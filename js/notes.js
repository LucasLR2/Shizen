// ========================================
// RENDERIZAR NOTAS
// ========================================

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

// ========================================
// MODAL DE NOTA
// ========================================

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