let appData = {
    profile: { name: '', photo: '', tools: { accounts: true, clipboard: true, notes: true } },
    accounts: [],
    clipboard: [], // Guardados permanentes
    notes: [],
    appearance: { theme: 'dark', accentColor: '#FF5252' },
    timerSettings: { selectedSound: 'bell', soundEnabled: true }
};

let timerState = {
    mode: 'custom',
    totalSeconds: 0,
    remainingSeconds: 0,
    isRunning: false,
    isPaused: false,
    intervalId: null,
    soundEnabled: true,
    selectedSound: 'bell',
    sessionsToday: 0,
    startTime: null
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
    // Inicializar timerSettings si no existe (para compatibilidad con datos antiguos)
    if (!appData.timerSettings) {
        appData.timerSettings = { selectedSound: 'bell', soundEnabled: true };
    }

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

    // Solicitar permisos de notificación
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('Permiso de notificaciones:', permission);
            });
        } else {
            console.log('Estado de notificaciones:', Notification.permission);
        }
    }

    // Inicializar detector de portapapeles
    initClipboardDetector();
    renderClipboard();

    // Inicializar temporizador
    initializeTimer();
    setTimerMode('custom');

    // Actualizar estadísticas y renderizar contenido
    updateStats();
    renderAccounts();
    renderNotes();
}

function initializeTimer() {
    const navTimer = document.getElementById('navTimerSidebar');
    if (navTimer) {
        navTimer.style.display = appData.profile.tools.timer !== false ? 'flex' : 'none';
    }
    
    // Cargar configuración guardada
    if (appData.timerSettings) {
        timerState.selectedSound = appData.timerSettings.selectedSound || 'bell';
        timerState.soundEnabled = appData.timerSettings.soundEnabled !== false;
    }
    
    // Actualizar el ícono del botón de sonido
    const btn = document.getElementById('timerSoundBtn');
    if (btn) {
        btn.innerHTML = `<i data-lucide="${timerState.soundEnabled ? 'volume-2' : 'volume-x'}"></i>`;
    }
    
    updateTimerDisplay();
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
        const soundModal = document.getElementById('soundModal');

        if (e.target === accountModal) {
            closeAccountModal();
        }
        if (e.target === noteModal) {
            closeNoteModal();
        }
        if (e.target === soundModal) {
            closeSoundModal();
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
        // Agrupar cuentas por categoría
        const grouped = {};
        appData.accounts.forEach((account, index) => {
            const category = account.platform.toLowerCase();
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push({ account, originalIndex: index });
        });

        // Ordenar categorías por cantidad (ascendente: menos cuentas primero)
        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            return grouped[a].length - grouped[b].length;
        });

        // Crear array ordenado de cuentas
        const sortedAccounts = [];
        sortedCategories.forEach(category => {
            grouped[category].forEach(item => {
                sortedAccounts.push(item);
            });
        });

        accountsList.innerHTML = sortedAccounts.map(item => `
            <div class="card account-card ${item.account.active === false ? 'inactive' : ''}">
                <div class="account-header">
                    <div class="account-icon">
                        <i data-lucide="key"></i>
                    </div>
                    <div class="account-info">
                        <h3>${item.account.platform} <span class="category-badge">${getCategoryCount(item.account.platform)}</span></h3>
                        <p>${item.account.username}</p>
                    </div>
                </div>
                <div class="account-actions">
                    <button class="btn-icon" onclick="copyToClipboard('${item.account.username}')" title="Copiar usuario">
                        <i data-lucide="user"></i>
                    </button>
                    <button class="btn-icon" onclick="copyToClipboard('${item.account.password}')" title="Copiar contraseña">
                        <i data-lucide="key"></i>
                    </button>
                    <button class="btn-icon" onclick="toggleAccountStatus(${item.originalIndex})" title="${item.account.active === false ? 'Activar cuenta' : 'Desactivar cuenta'}">
                        <i data-lucide="power"></i>
                    </button>
                    <button class="btn-icon" onclick="editAccount(${item.originalIndex})" title="Editar">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteAccount(${item.originalIndex})" title="Eliminar">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                ${item.account.notes ? `<div class="account-notes">${item.account.notes}</div>` : ''}
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
    let permissionAsked = false;

    // Verificar el portapapeles cada 1 segundo
    setInterval(async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text && text.trim() && text !== lastClipboardContent) {
                lastClipboardContent = text;
                addToTemporaryClipboard(text.trim());
            }
        } catch (err) {
            // Silencioso - no mostrar errores repetitivos
            if (!permissionAsked) {
                permissionAsked = true;
                console.log('💡 Tip: Permite el acceso al portapapeles para usar esta función');
            }
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

// ========== TIMER ==========

function setTimerMode(mode) {
    stopTimer();
    timerState.mode = mode;

    switch (mode) {
        case 'pomodoro':
            timerState.totalSeconds = 25 * 60;
            break;
        case 'short':
            timerState.totalSeconds = 5 * 60;
            break;
        case 'long':
            timerState.totalSeconds = 15 * 60;
            break;
        case 'custom':
            const minutes = parseInt(document.getElementById('customMinutes').value) || 0;
            const seconds = parseInt(document.getElementById('customSeconds').value) || 0;
            timerState.totalSeconds = (minutes * 60) + seconds;
            break;
    }

    timerState.remainingSeconds = timerState.totalSeconds;
    updateTimerDisplay();
    updateModeButtons();
}

function updateModeButtons() {
    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === timerState.mode) {
            btn.classList.add('active');
        }
    });
}

function startTimer() {
    if (timerState.remainingSeconds === 0) {
        showNotification('Configura un tiempo primero', 'error');
        return;
    }

    if (timerState.isRunning) return;

    timerState.isRunning = true;
    timerState.isPaused = false;
    timerState.startTime = Date.now();

    const startBtn = document.getElementById('timerStartBtn');
    const pauseBtn = document.getElementById('timerPauseBtn');

    if (startBtn) startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'inline-flex';

    timerState.intervalId = setInterval(() => {
        // Calcular tiempo real transcurrido
        const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
        timerState.remainingSeconds = Math.max(0, timerState.totalSeconds - elapsed);
        
        updateTimerDisplay();

        if (timerState.remainingSeconds <= 0) {
            finishTimer();
        }
    }, 100); 
}

function pauseTimer() {
    if (!timerState.isRunning) return;

    clearInterval(timerState.intervalId);
    timerState.isRunning = false;
    timerState.isPaused = true;
    
    // Guardar el tiempo restante actual
    timerState.totalSeconds = timerState.remainingSeconds;

    const startBtn = document.getElementById('timerStartBtn');
    const pauseBtn = document.getElementById('timerPauseBtn');

    if (startBtn) startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
}

function stopTimer() {
    clearInterval(timerState.intervalId);
    timerState.isRunning = false;
    timerState.isPaused = false;
    timerState.remainingSeconds = timerState.totalSeconds;

    const startBtn = document.getElementById('timerStartBtn');
    const pauseBtn = document.getElementById('timerPauseBtn');

    if (startBtn) startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';

    updateTimerDisplay();
}

function finishTimer() {
    clearInterval(timerState.intervalId);
    timerState.isRunning = false;
    timerState.remainingSeconds = 0;
    timerState.sessionsToday++;

    updateTimerDisplay();

    // Sonido
    if (timerState.soundEnabled) {
        playTimerSound();
    }

    // Animación visual
    const timerCircle = document.querySelector('.timer-circle');
    if (timerCircle) {
        timerCircle.classList.add('timer-complete');
        setTimeout(() => timerCircle.classList.remove('timer-complete'), 3000);
    }

    // Notificación visual grande y llamativa
    showTimerCompleteNotification();

    // Resetear
    setTimeout(() => {
        timerState.remainingSeconds = timerState.totalSeconds;
        updateTimerDisplay();
        const startBtn = document.getElementById('timerStartBtn');
        const pauseBtn = document.getElementById('timerPauseBtn');
        if (startBtn) startBtn.style.display = 'inline-flex';
        if (pauseBtn) pauseBtn.style.display = 'none';
    }, 2000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerState.remainingSeconds / 60);
    const seconds = timerState.remainingSeconds % 60;

    const display = document.getElementById('timerDisplay');
    if (display) {
        display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Actualizar círculo de progreso
    updateTimerCircle();

    // Actualizar estadística
    const sessionsEl = document.getElementById('timerSessionsToday');
    if (sessionsEl) {
        sessionsEl.textContent = timerState.sessionsToday;
    }
}

function updateTimerCircle() {
    const circle = document.getElementById('timerProgressCircle');
    if (!circle) return;

    const percentage = timerState.totalSeconds > 0
        ? (timerState.remainingSeconds / timerState.totalSeconds) * 100
        : 0;

    const circumference = 2 * Math.PI * 140; // radio = 140
    const offset = circumference - (percentage / 100) * circumference;

    circle.style.strokeDashoffset = offset;
}

function toggleTimerSound() {
    timerState.soundEnabled = !timerState.soundEnabled;
    
    // Guardar en appData
    appData.timerSettings.soundEnabled = timerState.soundEnabled;
    saveToSession();

    // Actualizar el ícono del botón
    const btn = document.getElementById('timerSoundBtn');
    if (btn) {
        btn.innerHTML = `<i data-lucide="${timerState.soundEnabled ? 'volume-2' : 'volume-x'}"></i>`;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    showNotification(timerState.soundEnabled ? 'Sonido activado' : 'Sonido desactivado', 'success');
}

function playTimerSoundOnce() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    switch (timerState.selectedSound) {
        case 'bell':
            playBellSound(audioContext);
            break;
        case 'beep':
            playBeepSound(audioContext);
            break;
        case 'chime':
            playChimeSound(audioContext);
            break;
        case 'ding':
            playDingSound(audioContext);
            break;
        case 'digital':
            playDigitalSound(audioContext);
            break;
        case 'soft':
            playSoftSound(audioContext);
            break;
        default:
            playBellSound(audioContext);
    }
}

function playTimerSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    switch (timerState.selectedSound) {
        case 'bell':
            playBellSound(audioContext);
            break;
        case 'beep':
            playBeepSound(audioContext);
            break;
        case 'chime':
            playChimeSound(audioContext);
            break;
        case 'ding':
            playDingSound(audioContext);
            break;
        case 'digital':
            playDigitalSound(audioContext);
            break;
        case 'soft':
            playSoftSound(audioContext);
            break;
        default:
            playBellSound(audioContext);
    }
}

function playBellSound(audioContext) {
    // Campana resonante de 5 segundos con armónicos
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    
    frequencies.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (i * 0.3);
        gainNode.gain.setValueAtTime(0.25, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 5);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 5);
    });
}

function playBeepSound(audioContext) {
    // Secuencia de beeps ascendentes de 5 segundos
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    
    notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'square';
        
        const startTime = audioContext.currentTime + (i * 0.6);
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.setValueAtTime(0.2, startTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
    });
}

function playChimeSound(audioContext) {
    // Melodía de campanas tubulares de 5 segundos
    const melody = [
        {freq: 523.25, time: 0},
        {freq: 659.25, time: 0.8},
        {freq: 783.99, time: 1.6},
        {freq: 1046.50, time: 2.4},
        {freq: 783.99, time: 3.2},
        {freq: 659.25, time: 4.0}
    ];
    
    melody.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = note.freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + note.time;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 1.5);
    });
}

function playDingSound(audioContext) {
    // Ding con eco y reverberación de 5 segundos
    for (let i = 0; i < 5; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1200 - (i * 50);
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (i * 1);
        const volume = 0.3 * Math.pow(0.6, i);
        
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.2);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 1.2);
    }
}

function playDigitalSound(audioContext) {
    // Sonido digital espacial de 5 segundos
    const pattern = [
        {freq: 880, time: 0, duration: 0.15},
        {freq: 1100, time: 0.2, duration: 0.15},
        {freq: 1320, time: 0.4, duration: 0.15},
        {freq: 880, time: 1.0, duration: 0.15},
        {freq: 1100, time: 1.2, duration: 0.15},
        {freq: 1320, time: 1.4, duration: 0.15},
        {freq: 1760, time: 2.0, duration: 0.3},
        {freq: 1320, time: 2.5, duration: 0.3},
        {freq: 1100, time: 3.0, duration: 0.3},
        {freq: 880, time: 3.5, duration: 0.8}
    ];
    
    pattern.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = note.freq;
        oscillator.type = 'square';
        
        const startTime = audioContext.currentTime + note.time;
        gainNode.gain.setValueAtTime(0.15, startTime);
        gainNode.gain.setValueAtTime(0.15, startTime + note.duration * 0.7);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration);
    });
}

function playSoftSound(audioContext) {
    // Sonido suave y relajante de 5 segundos con ondas superpuestas
    const frequencies = [220, 277, 330, 440];
    
    frequencies.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (i * 0.5);
        const volume = 0.15 - (i * 0.02);
        
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 5);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 5);
    });
}

function openSoundModal() {
    const modal = document.getElementById('soundModal');
    modal.classList.add('active');

    // Marcar el sonido actual como activo
    document.querySelectorAll('.sound-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.sound === timerState.selectedSound) {
            btn.classList.add('active');
        }
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeSoundModal() {
    document.getElementById('soundModal').classList.remove('active');
}

function selectSound(soundName) {
    timerState.selectedSound = soundName;

    // Actualizar botones activos
    document.querySelectorAll('.sound-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.sound === soundName) {
            btn.classList.add('active');
        }
    });

    // Guardar en appData
    appData.timerSettings.selectedSound = soundName;
    saveToSession();

    // Reproducir preview (solo una vez)
    playTimerSoundOnce();

    showNotification(`Sonido cambiado a: ${soundName}`, 'success');
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

function showTimerCompleteNotification() {
    // Crear notificación estilo Discord (simple y minimalista)
    const existingNotif = document.getElementById('timerCompleteNotification');
    if (existingNotif) existingNotif.remove();

    const notif = document.createElement('div');
    notif.id = 'timerCompleteNotification';
    notif.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2f3136;
        color: #dcddde;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 280px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notif.innerHTML = `
        <div style="
            width: 4px;
            height: 48px;
            background: #5865f2;
            border-radius: 4px;
            flex-shrink: 0;
        "></div>
        <div>
            <div style="font-weight: 600; margin-bottom: 4px;">Temporizador</div>
            <div style="color: #b9bbbe; font-size: 13px;">Tiempo completado</div>
        </div>
    `;
    
    document.body.appendChild(notif);

    // Agregar animación CSS
    if (!document.getElementById('timerNotifStyle')) {
        const style = document.createElement('style');
        style.id = 'timerNotifStyle';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Intentar notificación del sistema (funcionará en producción)
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Shizen', {
            body: 'Tiempo completado',
            icon: 'resources/flor-shizen-256-sf.png',
            tag: 'timer-complete',
            requireInteraction: true
        });
    }
    
    // Hacer parpadear el título
    let flashCount = 0;
    const originalTitle = document.title;
    const flashInterval = setInterval(() => {
        document.title = flashCount % 2 === 0 ? 'Tiempo!' : originalTitle;
        flashCount++;
        if (flashCount > 10) {
            clearInterval(flashInterval);
            document.title = originalTitle;
        }
    }, 500);

    // Quitar después de 5 segundos
    setTimeout(() => {
        notif.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notif.remove(), 300);
    }, 5000);
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