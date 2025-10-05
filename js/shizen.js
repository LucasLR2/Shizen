let appData = {
    profile: { name: '', photo: '', tools: { accounts: true, clipboard: true, notes: true } },
    accounts: [],
    clipboard: [], // Guardados permanentes
    notes: [],
    appearance: { theme: 'dark', accentColor: '#FF5252' }
};

// Historial temporal de portapapeles (no se exporta)
let temporaryClipboard = [];
const MAX_CLIPBOARD_ITEMS = 50;

let editingAccountIndex = -1;
let editingNoteIndex = -1;

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', function () {
    // Cargar datos del sessionStorage
    const savedData = sessionStorage.getItem('shizenData');

    if (!savedData) {
        // Si no hay datos, redirigir al login
        window.location.href = 'index.html';
        return;
    }

    try {
        appData = JSON.parse(savedData);
        initializeDashboard();
    } catch (error) {
        console.error('Error al cargar datos:', error);
        window.location.href = 'index.html';
    }
});

function initializeDashboard() {
    // Configurar perfil en header
    const profileName = document.getElementById('headerProfileName');
    const profilePic = document.getElementById('headerProfilePic');
    const welcomeName = document.getElementById('welcomeName');

    if (profileName) profileName.textContent = appData.profile.name;
    if (profilePic) profilePic.src = appData.profile.photo;
    if (welcomeName) welcomeName.textContent = appData.profile.name;

    // Mostrar/ocultar herramientas según configuración
    const navAccounts = document.getElementById('navAccounts');
    const navNotes = document.getElementById('navNotes');
    const navAccountsSidebar = document.getElementById('navAccountsSidebar');
    const navNotesSidebar = document.getElementById('navNotesSidebar');

    if (navAccounts) {
        navAccounts.style.display = appData.profile.tools.accounts ? 'flex' : 'none';
    }
    if (navNotes) {
        navNotes.style.display = appData.profile.tools.notes ? 'flex' : 'none';
    }
    if (navAccountsSidebar) {
        navAccountsSidebar.style.display = appData.profile.tools.accounts ? 'flex' : 'none';
    }
    if (navNotesSidebar) {
        navNotesSidebar.style.display = appData.profile.tools.notes ? 'flex' : 'none';
    }

    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Configurar event listeners
    setupEventListeners();

     // Inicializar detector de portapapeles
    initClipboardDetector();
    renderClipboard();

    // Actualizar estadísticas y renderizar contenido
    updateStats();
    renderAccounts();
    renderNotes();
}

function setupEventListeners() {
    // Navigation items (header)
    document.querySelectorAll('.header-nav-item').forEach(item => {
        item.addEventListener('click', function () {
            showSection(this.dataset.section);
        });
    });

    // Navigation items (sidebar)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function () {
            showSection(this.dataset.section);
        });
    });

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', function (e) {
        const dropdown = document.getElementById('profileDropdown');
        const userInfo = document.querySelector('.user-info');
        if (dropdown && userInfo && !userInfo.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Cerrar modales al hacer click fuera
    window.addEventListener('click', function (e) {
        const accountModal = document.getElementById('accountModal');
        const noteModal = document.getElementById('noteModal');

        if (e.target === accountModal) {
            closeAccountModal();
        }
        if (e.target === noteModal) {
            closeNoteModal();
        }
    });
}

function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Remover active de todos los nav items
    document.querySelectorAll('.header-nav-item, .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });

    // Mostrar la sección seleccionada
    const section = document.getElementById('section-' + sectionName);
    if (section) {
        section.classList.add('active');
    }
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('active');

    // Reinicializar iconos después de toggle
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function updateStats() {
    const statsAccounts = document.getElementById('statsAccounts');
    const statsClipboard = document.getElementById('statsClipboard');
    const statsNotes = document.getElementById('statsNotes');

    if (statsAccounts) statsAccounts.textContent = appData.accounts.length;
    if (statsClipboard) statsClipboard.textContent = temporaryClipboard.length + appData.clipboard.length;
    if (statsNotes) statsNotes.textContent = appData.notes.length;
}

// ========== ACCOUNTS ==========

function renderAccounts() {
    const accountsList = document.getElementById('accountsList');

    if (!accountsList) return;

    if (appData.accounts.length === 0) {
        accountsList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="key"></i>
                <h3>No hay cuentas guardadas</h3>
                <p>Comienza agregando tu primera cuenta</p>
            </div>
        `;
    } else {
        accountsList.innerHTML = appData.accounts.map((account, index) => `
            <div class="card account-card ${account.active === false ? 'inactive' : ''}">
                <div class="account-header">
                    <div class="account-icon">
                        <i data-lucide="key"></i>
                    </div>
                    <div class="account-info">
                        <h3>${account.platform} <span class="category-badge">${getCategoryCount(account.platform)}</span></h3>
                        <p>${account.username}</p>
                    </div>
                </div>
                <div class="account-actions">
                    <button class="btn-icon" onclick="copyToClipboard('${account.username}')" title="Copiar usuario">
                        <i data-lucide="user"></i>
                    </button>
                    <button class="btn-icon" onclick="copyToClipboard('${account.password}')" title="Copiar contraseña">
                        <i data-lucide="key"></i>
                    </button>
                    <button class="btn-icon" onclick="toggleAccountStatus(${index})" title="${account.active === false ? 'Activar cuenta' : 'Desactivar cuenta'}">
                        <i data-lucide="power"></i>
                    </button>
                    <button class="btn-icon" onclick="editAccount(${index})" title="Editar">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteAccount(${index})" title="Eliminar">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                ${account.notes ? `<div class="account-notes">${account.notes}</div>` : ''}
            </div>
        `).join('');
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    updateStats();
}

function openAccountModal() {
    editingAccountIndex = -1;
    document.getElementById('accountModalTitle').textContent = 'Nueva Cuenta';
    document.getElementById('accountPlatform').value = '';
    document.getElementById('accountUsername').value = '';
    document.getElementById('accountPassword').value = '';
    document.getElementById('accountNotes').value = '';
    document.getElementById('accountModal').classList.add('active');

    // Inicializar autocompletado de categorías
    initCategoryAutocomplete();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeAccountModal() {
    document.getElementById('accountModal').classList.remove('active');
    editingAccountIndex = -1;
}

function saveAccount() {
    const platform = document.getElementById('accountPlatform').value.trim();
    const username = document.getElementById('accountUsername').value.trim();
    const password = document.getElementById('accountPassword').value.trim();
    const notes = document.getElementById('accountNotes').value.trim();

    if (!platform || !username || !password) {
        showNotification('Por favor completa todos los campos obligatorios', 'error');
        return;
    }

    const account = {
        platform,
        username,
        password,
        notes,
        active: editingAccountIndex >= 0 ? appData.accounts[editingAccountIndex].active : true,
        createdAt: editingAccountIndex >= 0 ? appData.accounts[editingAccountIndex].createdAt : new Date().toISOString()
    };

    if (editingAccountIndex >= 0) {
        appData.accounts[editingAccountIndex] = account;
        showNotification('Cuenta actualizada correctamente', 'success');
    } else {
        appData.accounts.push(account);
        showNotification('Cuenta agregada correctamente', 'success');
    }

    saveToSession();
    renderAccounts();
    closeAccountModal();
}

function editAccount(index) {
    editingAccountIndex = index;
    const account = appData.accounts[index];

    document.getElementById('accountModalTitle').textContent = 'Editar Cuenta';
    document.getElementById('accountPlatform').value = account.platform;
    document.getElementById('accountUsername').value = account.username;
    document.getElementById('accountPassword').value = account.password;
    document.getElementById('accountNotes').value = account.notes || '';
    document.getElementById('accountModal').classList.add('active');

    // Inicializar autocompletado de categorías
    initCategoryAutocomplete();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function deleteAccount(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
        appData.accounts.splice(index, 1);
        saveToSession();
        renderAccounts();
        showNotification('Cuenta eliminada correctamente', 'success');
    }
}

function toggleAccountStatus(index) {
    appData.accounts[index].active = !appData.accounts[index].active;
    saveToSession();
    renderAccounts();
    const status = appData.accounts[index].active ? 'activada' : 'desactivada';
    showNotification(`Cuenta ${status} correctamente`, 'success');
}

// ========== NOTES ==========

function renderNotes() {
    const notesList = document.getElementById('notesList');

    if (!notesList) return;

    if (appData.notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="sticky-note"></i>
                <h3>No hay notas creadas</h3>
                <p>Comienza escribiendo tu primera nota</p>
            </div>
        `;
    } else {
        notesList.innerHTML = appData.notes.map((note, index) => `
            <div class="card note-card">
                <div class="note-header">
                    <h3>${note.title}</h3>
                    <div class="note-actions">
                        <button class="btn-icon" onclick="editNote(${index})" title="Editar">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteNote(${index})" title="Eliminar">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">${note.content}</div>
                <div class="note-footer">
                    <span class="note-date">${formatDate(note.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    updateStats();
}

function openNoteModal() {
    editingNoteIndex = -1;
    document.getElementById('noteModalTitle').textContent = 'Nueva Nota';
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteModal').classList.add('active');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeNoteModal() {
    document.getElementById('noteModal').classList.remove('active');
    editingNoteIndex = -1;
}

function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    if (!title || !content) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    const note = {
        title,
        content,
        createdAt: new Date().toISOString()
    };

    if (editingNoteIndex >= 0) {
        appData.notes[editingNoteIndex] = note;
        showNotification('Nota actualizada correctamente', 'success');
    } else {
        appData.notes.push(note);
        showNotification('Nota creada correctamente', 'success');
    }

    saveToSession();
    renderNotes();
    closeNoteModal();
}

function editNote(index) {
    editingNoteIndex = index;
    const note = appData.notes[index];

    document.getElementById('noteModalTitle').textContent = 'Editar Nota';
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    document.getElementById('noteModal').classList.add('active');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function deleteNote(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
        appData.notes.splice(index, 1);
        saveToSession();
        renderNotes();
        showNotification('Nota eliminada correctamente', 'success');
    }
}

// ========== CLIPBOARD ==========

function initClipboardDetector() {
    let lastClipboardContent = '';
    
    // Verificar el portapapeles cada 1 segundo
    setInterval(async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text && text.trim() && text !== lastClipboardContent) {
                lastClipboardContent = text;
                addToTemporaryClipboard(text.trim());
            }
        } catch (err) {
            // El usuario aún no ha dado permisos o el clipboard está vacío
            console.log('Esperando permisos de portapapeles...');
        }
    }, 1000);
}

function addToTemporaryClipboard(text) {
    // Evitar duplicados consecutivos
    if (temporaryClipboard.length > 0 && temporaryClipboard[0].content === text) {
        return;
    }

    const item = {
        content: text,
        type: detectContentType(text),
        createdAt: new Date().toISOString()
    };

    // Agregar al inicio del array
    temporaryClipboard.unshift(item);

    // Mantener solo los últimos 50 items
    if (temporaryClipboard.length > MAX_CLIPBOARD_ITEMS) {
        temporaryClipboard = temporaryClipboard.slice(0, MAX_CLIPBOARD_ITEMS);
    }

    renderClipboard();
    updateStats();
}

function detectContentType(text) {
    // Detectar URLs
    if (/^https?:\/\/.+/.test(text)) {
        return 'url';
    }
    // Detectar emails
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        return 'email';
    }
    // Detectar números
    if (/^\d+$/.test(text)) {
        return 'number';
    }
    // Detectar código (contiene símbolos típicos de programación)
    if (/[{}\[\];()<>=]/.test(text) || text.includes('function') || text.includes('const') || text.includes('let')) {
        return 'code';
    }
    return 'text';
}

function isItemSaved(content) {
    return appData.clipboard.some(item => item.content === content);
}

function getTypeIcon(type) {
    const icons = {
        'url': 'link',
        'email': 'mail',
        'number': 'hash',
        'code': 'code',
        'text': 'file-text'
    };
    return icons[type] || 'file-text';
}

function getTypeName(type) {
    const names = {
        'url': 'URL',
        'email': 'Email',
        'number': 'Número',
        'code': 'Código',
        'text': 'Texto'
    };
    return names[type] || 'Texto';
}

function renderClipboard() {
    renderTemporaryClipboard();
    renderSavedClipboard();
    updateClipboardCounts();
}

function updateClipboardCounts() {
    const tempCount = document.getElementById('tempCount');
    const savedCount = document.getElementById('savedCount');
    
    if (tempCount) tempCount.textContent = temporaryClipboard.length;
    if (savedCount) savedCount.textContent = appData.clipboard.length;
}

function renderTemporaryClipboard() {
    const clipboardList = document.getElementById('clipboardTemporaryList');

    if (!clipboardList) return;

    if (temporaryClipboard.length === 0) {
        clipboardList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="clipboard"></i>
                <h3>No hay elementos temporales</h3>
                <p>Copia algo para que aparezca aquí automáticamente</p>
            </div>
        `;
    } else {
        clipboardList.innerHTML = temporaryClipboard.map((item, index) => `
            <div class="card clipboard-card">
                <div class="clipboard-header">
                    <div class="clipboard-type">
                        <i data-lucide="${getTypeIcon(item.type)}"></i>
                        <span>${getTypeName(item.type)}</span>
                    </div>
                    <div class="clipboard-actions">
                        <button class="btn-icon" onclick="copyClipboardItem('${escapeHtml(item.content)}')" title="Copiar">
                            <i data-lucide="copy"></i>
                        </button>
                        <button class="btn-icon ${isItemSaved(item.content) ? 'saved-item' : ''}" onclick="saveClipboardItem(${index}, false)" title="${isItemSaved(item.content) ? 'Ya guardado' : 'Guardar permanente'}">
                            <i data-lucide="bookmark"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteTemporaryClipboardItem(${index})" title="Eliminar">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                <div class="clipboard-content">${escapeHtml(truncateText(item.content, 200))}</div>
                <div class="clipboard-footer">
                    <span class="clipboard-date">${formatDate(item.createdAt)}</span>
                    <span class="clipboard-length">${item.content.length} caracteres</span>
                </div>
            </div>
        `).join('');
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderSavedClipboard() {
    const clipboardList = document.getElementById('clipboardSavedList');

    if (!clipboardList) return;

    if (appData.clipboard.length === 0) {
        clipboardList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="bookmark"></i>
                <h3>No hay elementos guardados</h3>
                <p>Guarda elementos desde el historial temporal para mantenerlos permanentemente</p>
            </div>
        `;
    } else {
        clipboardList.innerHTML = appData.clipboard.map((item, index) => `
            <div class="card clipboard-card">
                <div class="clipboard-header">
                    <div class="clipboard-type">
                        <i data-lucide="${getTypeIcon(item.type)}"></i>
                        <span>${getTypeName(item.type)}</span>
                    </div>
                    <div class="clipboard-actions">
                        <button class="btn-icon" onclick="copyClipboardItem('${escapeHtml(item.content)}')" title="Copiar">
                            <i data-lucide="copy"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteSavedClipboardItem(${index})" title="Eliminar">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                <div class="clipboard-content">${escapeHtml(truncateText(item.content, 200))}</div>
                <div class="clipboard-footer">
                    <span class="clipboard-date">${formatDate(item.createdAt)}</span>
                    <span class="clipboard-length">${item.content.length} caracteres</span>
                </div>
            </div>
        `).join('');
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function copyClipboardItem(text) {
    const decoded = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    navigator.clipboard.writeText(decoded).then(() => {
        showNotification('Copiado al portapapeles', 'success');
    }).catch(() => {
        showNotification('Error al copiar', 'error');
    });
}

function saveClipboardItem(index, isFromSaved = false) {
    const item = isFromSaved ? appData.clipboard[index] : temporaryClipboard[index];
    
    // Verificar si ya existe en guardados
    const exists = appData.clipboard.some(saved => saved.content === item.content);
    
    if (exists) {
        showNotification('Este elemento ya está guardado', 'error');
        return;
    }

    appData.clipboard.push({
        content: item.content,
        type: item.type,
        createdAt: new Date().toISOString()
    });

    saveToSession();
    renderClipboard();
    updateStats();
    showNotification('Elemento guardado permanentemente', 'success');
}

function deleteTemporaryClipboardItem(index) {
    temporaryClipboard.splice(index, 1);
    renderClipboard();
    updateStats();
    showNotification('Elemento eliminado del historial', 'success');
}

function deleteSavedClipboardItem(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este elemento guardado?')) {
        appData.clipboard.splice(index, 1);
        saveToSession();
        renderClipboard();
        updateStats();
        showNotification('Elemento eliminado de guardados', 'success');
    }
}

function clearTemporaryClipboard() {
    if (temporaryClipboard.length === 0) {
        showNotification('No hay elementos temporales para limpiar', 'error');
        return;
    }

    if (confirm('¿Estás seguro de que quieres limpiar todo el historial temporal?')) {
        temporaryClipboard = [];
        renderClipboard();
        updateStats();
        showNotification('Historial temporal limpiado', 'success');
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function switchClipboardTab(tabName) {
    // Remover active de todas las pestañas
    document.querySelectorAll('.clipboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remover active de todo el contenido
    document.querySelectorAll('.clipboard-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Activar la pestaña seleccionada
    const selectedTab = document.querySelector(`.clipboard-tab[data-tab="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Activar el contenido correspondiente
    const selectedContent = document.getElementById(`tab-${tabName}`);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }

    // Mostrar/ocultar botón de limpiar temporales
    const btnClearTemp = document.getElementById('btnClearTemp');
    if (btnClearTemp) {
        btnClearTemp.style.display = tabName === 'temporary' ? 'inline-flex' : 'none';
    }

    // Reinicializar iconos
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ========== UTILITIES ==========

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copiado al portapapeles', 'success');
    }).catch(() => {
        showNotification('Error al copiar', 'error');
    });
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.password-toggle i');

    if (input.type === 'password') {
        input.type = 'text';
        button.setAttribute('data-lucide', 'eye-off');
    } else {
        input.type = 'password';
        button.setAttribute('data-lucide', 'eye');
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function saveToSession() {
    sessionStorage.setItem('shizenData', JSON.stringify(appData));
}

function exportData() {
    // Crear una copia de appData sin modificar el original
    const dataToExport = {
        profile: appData.profile,
        accounts: appData.accounts,
        clipboard: appData.clipboard, // Solo exportar guardados permanentes
        notes: appData.notes,
        appearance: appData.appearance
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shizen-${appData.profile.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Datos exportados correctamente (sin temporales)', 'success');
}

function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión? Los elementos temporales del portapapeles se perderán.')) {
        sessionStorage.removeItem('shizenData');
        temporaryClipboard = []; // Limpiar temporales
        window.location.href = 'index.html';
    }
}

// ========== CATEGORY AUTOCOMPLETE ==========

function getExistingCategories() {
    const categories = appData.accounts.map(acc => acc.platform);
    // Eliminar duplicados y ordenar
    return [...new Set(categories)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

function getCategoryCount(category) {
    return appData.accounts.filter(acc => acc.platform.toLowerCase() === category.toLowerCase()).length;
}

function initCategoryAutocomplete() {
    const input = document.getElementById('accountPlatform');
    const suggestionsDiv = document.getElementById('categorySuggestions');

    if (!input || !suggestionsDiv) return;

    let selectedIndex = -1;

    // Limpiar sugerencias previas
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.style.display = 'none';

    input.addEventListener('input', function () {
        const value = this.value.trim();
        selectedIndex = -1;

        if (value.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        const categories = getExistingCategories();
        const matches = categories.filter(cat =>
            cat.toLowerCase().startsWith(value.toLowerCase())
        ).slice(0, 5); // Máximo 5 sugerencias

        if (matches.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        suggestionsDiv.innerHTML = matches.map((cat, index) => {
            const count = getCategoryCount(cat);
            return `
                <div class="suggestion-item" data-index="${index}" data-value="${cat}">
                    <span class="suggestion-name">${cat}</span>
                    <span class="suggestion-count">${count}</span>
                </div>
            `;
        }).join('');

        suggestionsDiv.style.display = 'block';

        // Click en sugerencia
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function () {
                input.value = this.dataset.value;
                suggestionsDiv.style.display = 'none';
                input.focus();
            });
        });
    });

    // Navegación con teclado
    input.addEventListener('keydown', function (e) {
        const items = suggestionsDiv.querySelectorAll('.suggestion-item');

        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelectedSuggestion(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelectedSuggestion(items, selectedIndex);
        } else if (e.key === 'Tab' && selectedIndex >= 0) {
            e.preventDefault();
            input.value = items[selectedIndex].dataset.value;
            suggestionsDiv.style.display = 'none';
        } else if (e.key === 'Tab' && items.length > 0) {
            e.preventDefault();
            input.value = items[0].dataset.value;
            suggestionsDiv.style.display = 'none';
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            input.value = items[selectedIndex].dataset.value;
            suggestionsDiv.style.display = 'none';
        } else if (e.key === 'Escape') {
            suggestionsDiv.style.display = 'none';
            selectedIndex = -1;
        }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', function (e) {
        if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

function updateSelectedSuggestion(items, index) {
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.background = type === 'success' ?
        'linear-gradient(135deg, #81C784, #66BB6A)' :
        'linear-gradient(135deg, #FF5252, #EF4444)';
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}