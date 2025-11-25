// ========================================
// VARIABLES GLOBALES
// ========================================

let currentDocIndex = -1;
let autoSaveTimeout = null;
let openMenuIndex = null;

// ========================================
// INICIALIZACIÓN
// ========================================

function initializeDocuments() {
    // Migración de notas antiguas
    if (appData.notes && appData.notes.length > 0 && !appData.documents) {
        appData.documents = appData.notes.map(note => ({
            ...note
        }));
    }
    
    if (!appData.documents) {
        appData.documents = [];
    }
    
    renderDocuments();
    setupDocumentClickOutside();
}

// ========================================
// RENDERIZAR VISTA PRINCIPAL
// ========================================

function renderDocuments() {
    const section = document.getElementById('section-documents');
    if (!section) return;
    
    let html = '';
    
    // Header con título y botón
    html += `
        <div class="documents-main-header">
            <div class="documents-header-left">
                <h1 class="documents-title">Documentos</h1>
                <p class="documents-subtitle">Organiza tus ideas en un solo lugar</p>
            </div>
            <button class="btn-new-document btn-primary" onclick="openDocumentEditor()" title="Crear nuevo documento">
                <i data-lucide="plus"></i>
                <span>Nuevo documento</span>
            </button>
        </div>
    `;
    
    // Documentos
    const docs = appData.documents;
    
    if (docs.length > 0) {
        html += '<div class="documents-section">';
        html += '<div class="documents-list">';
        
        docs.forEach(doc => {
            const docIndex = appData.documents.indexOf(doc);
            html += `
                <div class="document-item">
                    <div class="document-icon" onclick="openDocumentEditor(${docIndex})">
                        <i data-lucide="file-text"></i>
                    </div>
                    <div class="document-info" onclick="openDocumentEditor(${docIndex})">
                        <div class="document-name">${doc.title}</div>
                        <div class="document-meta">${formatDate(doc.createdAt)}</div>
                    </div>
                    <button class="document-menu-btn" onclick="toggleDocumentMenu(event, ${docIndex})">
                        <i data-lucide="more-vertical"></i>
                    </button>
                    <div class="document-menu" id="docMenu${docIndex}">
                        <div class="menu-item" onclick="openDocumentEditor(${docIndex})">
                            <i data-lucide="edit-2"></i>
                            <span>Editar</span>
                        </div>
                        <div class="menu-item" onclick="exportDocument(${docIndex})">
                            <i data-lucide="download"></i>
                            <span>Exportar</span>
                        </div>
                        <div class="menu-item danger" onclick="deleteDocument(${docIndex})">
                            <i data-lucide="trash-2"></i>
                            <span>Eliminar</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>'; // documents-list
        html += '</div>'; // documents-section
    }
    
    // Estado vacío
    if (docs.length === 0) {
        html += `
            <div class="empty-state">
                <i data-lucide="file-text"></i>
                <p>No hay documentos</p>
                <p class="empty-state-hint">Haz clic en el botón + para crear tu primer documento</p>
            </div>
        `;
    }
    
    section.innerHTML = html;
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    updateDocumentsStats();
}

// ========================================
// MENÚ DE 3 PUNTOS
// ========================================

function toggleDocumentMenu(event, index) {
    event.stopPropagation();
    
    const menu = document.getElementById(`docMenu${index}`);
    const wasOpen = menu.classList.contains('active');
    
    // Cerrar todos los menús
    document.querySelectorAll('.document-menu').forEach(m => {
        m.classList.remove('active');
    });
    
    // Abrir este menú si no estaba abierto
    if (!wasOpen) {
        menu.classList.add('active');
        openMenuIndex = index;
    } else {
        openMenuIndex = null;
    }
}

function setupDocumentClickOutside() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.document-menu') && !e.target.closest('.document-menu-btn')) {
            document.querySelectorAll('.document-menu').forEach(m => {
                m.classList.remove('active');
            });
            openMenuIndex = null;
        }
    });
}

// ========================================
// EDITOR DE DOCUMENTOS
// ========================================

function openDocumentEditor(index = -1) {
    currentDocIndex = index;
    
    const isNew = index === -1;
    const doc = isNew ? {
        title: '',
        content: ''
    } : appData.documents[index];
    
    const editorHTML = `
        <div class="document-editor-modal active" id="documentEditorModal">
            <div class="editor-container">
                <!-- Top Bar -->
                <div class="editor-top-bar">
                    <div class="editor-top-left">
                        <button class="btn-icon-editor" onclick="closeDocumentEditor()" title="Cerrar">
                            <i data-lucide="x"></i>
                        </button>
                        <input type="text" id="editorTitle" class="editor-title" 
                               placeholder="Documento sin título" value="${doc.title}">
                    </div>
                    <div class="editor-top-right">
                        <span id="autoSaveStatus" class="auto-save-status">Guardado</span>
                        <button class="btn-secondary" onclick="exportCurrentDocument()">
                            <i data-lucide="download"></i>
                        </button>
                        <button class="btn-primary" onclick="saveDocumentFromEditor()">
                            <i data-lucide="save"></i>
                            Guardar
                        </button>
                    </div>
                </div>
                
                <!-- Format Bar -->
                <div class="editor-format-bar">
                    <div class="format-group">
                        <select class="font-selector" id="fontSelector" onchange="changeFont(this.value)">
                            <option value="Inter">Inter</option>
                            <option value="Arial">Arial</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Verdana">Verdana</option>
                        </select>
                        <select class="size-selector" id="sizeSelector" onchange="changeFontSize(this.value)">
                            <option value="12px">12</option>
                            <option value="14px">14</option>
                            <option value="16px" selected>16</option>
                            <option value="18px">18</option>
                            <option value="20px">20</option>
                            <option value="24px">24</option>
                            <option value="28px">28</option>
                            <option value="32px">32</option>
                        </select>
                    </div>
                    
                    <div class="format-divider"></div>
                    
                    <div class="format-group">
                        <button class="format-btn" onclick="formatText('bold')" title="Negrita (Ctrl+B)">
                            <i data-lucide="bold"></i>
                        </button>
                        <button class="format-btn" onclick="formatText('italic')" title="Cursiva (Ctrl+I)">
                            <i data-lucide="italic"></i>
                        </button>
                        <button class="format-btn" onclick="formatText('underline')" title="Subrayado (Ctrl+U)">
                            <i data-lucide="underline"></i>
                        </button>
                        <button class="format-btn" onclick="formatText('strikeThrough')" title="Tachado">
                            <i data-lucide="strikethrough"></i>
                        </button>
                    </div>
                    
                    <div class="format-divider"></div>
                    
                    <div class="format-group">
                        <button class="format-btn" onclick="formatText('justifyLeft')" title="Alinear izquierda">
                            <i data-lucide="align-left"></i>
                        </button>
                        <button class="format-btn" onclick="formatText('justifyCenter')" title="Alinear centro">
                            <i data-lucide="align-center"></i>
                        </button>
                        <button class="format-btn" onclick="formatText('justifyRight')" title="Alinear derecha">
                            <i data-lucide="align-right"></i>
                        </button>
                        <button class="format-btn" onclick="formatText('justifyFull')" title="Justificar">
                            <i data-lucide="align-justify"></i>
                        </button>
                    </div>
                    
                    <div class="format-divider"></div>
                    
                    <div class="format-group">
                        <button class="format-btn" onclick="formatText('insertUnorderedList')" title="Lista con viñetas">
                            <i data-lucide="list"></i>
                        </button>
                        <button class="format-btn" onclick="formatText('insertOrderedList')" title="Lista numerada">
                            <i data-lucide="list-ordered"></i>
                        </button>
                    </div>
                    
                    <div class="format-divider"></div>
                    
                    <div class="format-group">
                        <div class="color-picker-inline" title="Color de texto">
                            <input type="color" id="textColorPicker" value="255, 255, 255, 1" 
                                   onchange="changeTextColor(this.value)">
                        </div>
                        <div class="color-picker-inline" title="Color de fondo">
                            <input type="color" id="bgColorPicker" value="#000000ff" 
                                   onchange="changeBackgroundColor(this.value)">
                        </div>
                    </div>
                </div>
                
                <!-- Content Area -->
                <div class="editor-page-wrapper">
                    <div class="editor-page" id="editorContent" contenteditable="true">${doc.content || ''}</div>
                </div>
                
                <!-- Footer -->
                <div class="editor-footer-bar">
                    <div class="editor-stats">
                        <span id="wordCount">0 palabras</span>
                        <span class="stat-divider">•</span>
                        <span id="charCount">0 caracteres</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('documentEditorModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', editorHTML);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Event listeners
    const titleInput = document.getElementById('editorTitle');
    const contentDiv = document.getElementById('editorContent');
    
    titleInput.addEventListener('input', triggerAutoSave);
    contentDiv.addEventListener('input', () => {
        updateWordCount();
        triggerAutoSave();
    });
    
    updateWordCount();
    
    if (isNew) {
        setTimeout(() => titleInput.focus(), 100);
    }
}

function closeDocumentEditor() {
    const modal = document.getElementById('documentEditorModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
    currentDocIndex = -1;
    clearTimeout(autoSaveTimeout);
}

// ========================================
// AUTO-GUARDADO
// ========================================

function triggerAutoSave() {
    const status = document.getElementById('autoSaveStatus');
    if (status) status.textContent = 'Guardando...';
    
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        autoSaveDocument();
        if (status) status.textContent = 'Guardado';
    }, 1500);
}

function autoSaveDocument() {
    const title = document.getElementById('editorTitle').value.trim();
    const content = document.getElementById('editorContent').innerHTML;
    
    if (!title && !content) return;
    
    const doc = {
        title: title || 'Sin título',
        content,
        createdAt: currentDocIndex >= 0 ? appData.documents[currentDocIndex].createdAt : new Date().toISOString()
    };
    
    if (currentDocIndex >= 0) {
        appData.documents[currentDocIndex] = doc;
    } else {
        appData.documents.push(doc);
        currentDocIndex = appData.documents.length - 1;
    }
    
    saveToSession();
}

function saveDocumentFromEditor() {
    const title = document.getElementById('editorTitle').value.trim();
    
    if (!title) {
        showNotification('El documento necesita un título', 'error');
        return;
    }
    
    autoSaveDocument();
    showNotification('Documento guardado', 'success');
    closeDocumentEditor();
    renderDocuments();
}

// ========================================
// FORMATO DE TEXTO
// ========================================

function formatText(command) {
    document.execCommand(command, false, null);
    document.getElementById('editorContent').focus();
}

function changeFont(font) {
    document.execCommand('fontName', false, font);
    document.getElementById('editorContent').focus();
}

function changeFontSize(size) {
    document.getElementById('editorContent').style.fontSize = size;
    document.getElementById('editorContent').focus();
}

function changeTextColor(color) {
    document.execCommand('foreColor', false, color);
    document.getElementById('editorContent').focus();
}

function changeBackgroundColor(color) {
    document.getElementById('editorContent').style.backgroundColor = color;
}

function updateWordCount() {
    const content = document.getElementById('editorContent').innerText;
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = content.length;
    
    document.getElementById('wordCount').textContent = `${words} palabra${words !== 1 ? 's' : ''}`;
    document.getElementById('charCount').textContent = `${chars} caracter${chars !== 1 ? 'es' : ''}`;
}

// ========================================
// EXPORTAR
// ========================================

function exportDocument(index) {
    const doc = appData.documents[index];
    const content = doc.content.replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Documento exportado', 'success');
}

function exportCurrentDocument() {
    if (currentDocIndex >= 0) {
        exportDocument(currentDocIndex);
    }
}

// ========================================
// ELIMINAR DOCUMENTO
// ========================================

function deleteDocument(index) {
    if (confirm('¿Eliminar este documento?')) {
        appData.documents.splice(index, 1);
        saveToSession();
        renderDocuments();
        showNotification('Documento eliminado', 'success');
    }
}

// ========================================
// UTILIDADES
// ========================================

function updateDocumentsStats() {
    const statsValue = document.querySelector('.stat-badge.documents .stat-badge-value');
    if (statsValue) {
        statsValue.textContent = appData.documents ? appData.documents.length : 0;
    }
}