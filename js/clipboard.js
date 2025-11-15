// ========================================
// VARIABLES GLOBALES DEL PORTAPAPELES
// ========================================

let temporaryClipboard = [];
const MAX_CLIPBOARD_ITEMS = 50;

// ========================================
// DETECTOR DE PORTAPAPELES
// ========================================

function initClipboardDetector() {
    let lastClipboardContent = '';
    let clipboardPermissionGranted = localStorage.getItem('clipboardPermissionGranted') === 'true';
    let permissionCheckInProgress = false;

    // Función para verificar y solicitar permiso una sola vez
    async function checkClipboardPermission() {
        if (permissionCheckInProgress) return false;
        
        try {
            permissionCheckInProgress = true;
            
            // Intentar leer el portapapeles
            const text = await navigator.clipboard.readText();
            
            // Si llegamos aquí, tenemos permiso
            if (!clipboardPermissionGranted) {
                clipboardPermissionGranted = true;
                localStorage.setItem('clipboardPermissionGranted', 'true');
                console.log('✅ Permiso de portapapeles concedido');
            }
            
            permissionCheckInProgress = false;
            return true;
        } catch (err) {
            permissionCheckInProgress = false;
            
            // Si el error es de permiso denegado, no volver a preguntar
            if (err.name === 'NotAllowedError') {
                localStorage.setItem('clipboardPermissionGranted', 'false');
                console.log('❌ Permiso de portapapeles denegado por el usuario');
            }
            
            return false;
        }
    }

    // Verificar permiso al inicio
    checkClipboardPermission();

    // Monitorear el portapapeles cada 1 segundo
    setInterval(async () => {
        // No intentar si sabemos que no tenemos permiso
        if (localStorage.getItem('clipboardPermissionGranted') === 'false') {
            return;
        }

        try {
            const text = await navigator.clipboard.readText();
            if (text && text.trim() && text !== lastClipboardContent) {
                lastClipboardContent = text;
                addToTemporaryClipboard(text.trim());
            }
        } catch (err) {
            // Silencioso - no mostrar errores repetitivos
        }
    }, 1000);
}

// ========================================
// AGREGAR AL PORTAPAPELES TEMPORAL
// ========================================

function addToTemporaryClipboard(text) {
    // Filtrar contraseñas copiadas desde Account Manager
    if (recentlyCopiedPasswords.includes(text)) {
        console.log('🔒 Contraseña filtrada del historial del portapapeles');
        return;
    }
    
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

// ========================================
// DETECTAR TIPO DE CONTENIDO
// ========================================

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

// ========================================
// RENDERIZAR PORTAPAPELES
// ========================================

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

function isItemSaved(content) {
    return appData.clipboard.some(item => item.content === content);
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

// ========================================
// ACCIONES DEL PORTAPAPELES
// ========================================

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

// ========================================
// TABS DEL PORTAPAPELES
// ========================================

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