// ========================================
// DATOS GLOBALES
// ========================================

let appData = {
    profile: { name: '', photo: '', tools: { accounts: true, clipboard: true, notes: true } },
    accounts: [],
    clipboard: [], // Guardados permanentes
    notes: [],
    appearance: { theme: 'dark', accentColor: '#FF5252' },
    timerSettings: { selectedSound: 'bell', soundEnabled: true }
};

// Variables globales
let editingAccountIndex = -1;
let editingNoteIndex = -1;
let recentlyCopiedPasswords = [];

// ========================================
// INICIALIZACIÓN
// ========================================

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

    // Inicializar módulos
    initClipboardDetector();
    renderClipboard();
    initializeTimer();
    setTimerMode('custom');

    // Actualizar estadísticas y renderizar contenido
    updateStats();
    renderAccounts();
    renderNotes();

    setTimeout(() => {
        if (document.querySelector('.dashboard-hero')) {
            initZenDashboard();
        }
    }, 100);
}

// ========================================
// EVENT LISTENERS
// ========================================

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

    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', function (e) {
        const profileDropdown = document.getElementById('profileDropdown');
        const settingsDropdown = document.getElementById('settingsDropdown');
        const userInfo = document.querySelector('.user-info');
        const hamburgerBtn = document.querySelector('.hamburger-btn');

        // Cerrar profile dropdown si el click no es en user-info ni en el dropdown
        if (profileDropdown && userInfo && !userInfo.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }

        // Cerrar settings dropdown si el click no es en hamburger ni en el dropdown
        if (settingsDropdown && hamburgerBtn && !hamburgerBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
            settingsDropdown.classList.remove('active');
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

// ========================================
// NAVEGACIÓN
// ========================================

function showSection(sectionName) {
    const contentDashboard = document.querySelector('.content-dashboard');
    const contentOther = document.querySelector('.content');
    
    if (sectionName === 'dashboard') {
        contentDashboard.style.display = 'block';
        contentOther.style.display = 'none';
    } else {
        contentDashboard.style.display = 'none';
        contentOther.style.display = 'block';
    }

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

    if (sectionName === 'dashboard') {
        setTimeout(refreshDashboard, 100);
    }
}

// ========================================
// DROPDOWNS
// ========================================

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('active');

    // Reinicializar iconos después de toggle
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function toggleSettingsMenu() {
    const dropdown = document.getElementById('settingsDropdown');
    dropdown.classList.toggle('active');

    // Reinicializar iconos después de toggle
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}