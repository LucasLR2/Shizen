// ========================================
// UTILIDADES GENERALES
// ========================================

/**
 * Copiar texto al portapapeles
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copiado al portapapeles', 'success');
        
        // Si el texto copiado es una contraseña de alguna cuenta, agregarlo a la lista de exclusión
        const isPassword = appData.accounts.some(acc => acc.password === text);
        if (isPassword) {
            recentlyCopiedPasswords.push(text);
            // Limpiar la lista después de 5 segundos
            setTimeout(() => {
                recentlyCopiedPasswords = recentlyCopiedPasswords.filter(p => p !== text);
            }, 5000);
        }
    }).catch(() => {
        showNotification('Error al copiar', 'error');
    });
}

/**
 * Alternar visibilidad de contraseña
 */
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

/**
 * Formatear fecha relativa
 */
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

/**
 * Guardar datos en sessionStorage
 */
function saveToSession() {
    sessionStorage.setItem('shizenData', JSON.stringify(appData));
}

/**
 * Exportar datos a JSON
 */
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

/**
 * Cerrar sesión
 */
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión? Los elementos temporales del portapapeles se perderán.')) {
        sessionStorage.removeItem('shizenData');
        temporaryClipboard = []; // Limpiar temporales
        window.location.href = 'index.html';
    }
}

/**
 * Mostrar notificación
 */
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

/**
 * Truncar texto
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Escapar HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Actualizar estadísticas del dashboard
 */
function updateStats() {
    const statsAccounts = document.getElementById('statsAccounts');
    const statsClipboard = document.getElementById('statsClipboard');
    const statsNotes = document.getElementById('statsNotes');

    if (statsAccounts) statsAccounts.textContent = appData.accounts.length;
    if (statsClipboard) statsClipboard.textContent = temporaryClipboard.length + appData.clipboard.length;
    if (statsNotes) statsNotes.textContent = appData.notes.length;

    updateDashboardStats();
}