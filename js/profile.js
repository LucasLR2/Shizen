// ========================================
// PROFILE MODULE - STEAM INSPIRED
// ========================================

let isEditingProfile = false;

// ========================================
// BADGES SYSTEM
// ========================================

const BADGES_CONFIG = [
    { id: 'first_account', name: 'Primera Cuenta', icon: 'key', requirement: 1, type: 'accounts' },
    { id: 'account_master', name: 'Maestro de Cuentas', icon: 'shield', requirement: 10, type: 'accounts' },
    { id: 'first_note', name: 'Primera Nota', icon: 'sticky-note', requirement: 1, type: 'notes' },
    { id: 'note_writer', name: 'Escritor', icon: 'book', requirement: 10, type: 'notes' },
    { id: 'first_timer', name: 'Primera Sesión', icon: 'timer', requirement: 1, type: 'timer' },
    { id: 'productivity_master', name: 'Maestro Productivo', icon: 'zap', requirement: 25, type: 'timer' },
    { id: 'clipboard_user', name: 'Usuario de Portapapeles', icon: 'clipboard', requirement: 5, type: 'clipboard' },
    { id: 'organizer', name: 'Organizador', icon: 'folder', requirement: 20, type: 'total' },
    { id: 'shizen_explorer', name: 'Explorador Shizen', icon: 'compass', requirement: 50, type: 'total' },
    { id: 'dedication', name: 'Dedicación', icon: 'heart', requirement: 7, type: 'days' },
    { id: 'veteran', name: 'Veterano', icon: 'star', requirement: 30, type: 'days' },
    { id: 'zen_master', name: 'Maestro Zen', icon: 'award', requirement: 100, type: 'total' }
];

// ========================================
// ACHIEVEMENTS SYSTEM
// ========================================

const ACHIEVEMENTS_CONFIG = [
    {
        id: 'getting_started',
        name: 'Comenzando',
        description: 'Crea tu primera cuenta o nota',
        icon: 'rocket',
        check: (data) => (data.accounts?.length || 0) + (data.notes?.length || 0) >= 1
    },
    {
        id: 'security_conscious',
        name: 'Consciente de Seguridad',
        description: 'Guarda 5 cuentas',
        icon: 'lock',
        check: (data) => (data.accounts?.length || 0) >= 5
    },
    {
        id: 'note_taker',
        name: 'Tomador de Notas',
        description: 'Crea 5 notas',
        icon: 'file-text',
        check: (data) => (data.notes?.length || 0) >= 5
    },
    {
        id: 'time_manager',
        name: 'Gestor del Tiempo',
        description: 'Completa 10 sesiones de temporizador',
        icon: 'clock',
        check: (data) => (data.timerSessions || 0) >= 10
    },
    {
        id: 'pomodoro_fan',
        name: 'Fan del Pomodoro',
        description: 'Completa 25 sesiones de temporizador',
        icon: 'coffee',
        check: (data) => (data.timerSessions || 0) >= 25
    },
    {
        id: 'organizer',
        name: 'Super Organizador',
        description: 'Guarda 10 cuentas y 10 notas',
        icon: 'briefcase',
        check: (data) => (data.accounts?.length || 0) >= 10 && (data.notes?.length || 0) >= 10
    }
];

// ========================================
// LEVEL SYSTEM
// ========================================

function calculateLevel(xp) {
    // Fórmula: nivel = floor(sqrt(xp / 100))
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function calculateXP() {
    const accounts = appData.accounts?.length || 0;
    const notes = appData.notes?.length || 0;
    const clipboard = appData.clipboard?.length || 0;
    const timerSessions = appData.timerSessions || 0;
    const daysActive = calculateDaysActive();
    
    // XP por actividad
    const xp = (accounts * 10) + 
               (notes * 8) + 
               (clipboard * 3) + 
               (timerSessions * 15) +
               (daysActive * 20);
    
    return xp;
}

function calculateDaysActive() {
    if (!appData.profile.createdAt) return 0;
    
    const created = new Date(appData.profile.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

function getXPForNextLevel(currentLevel) {
    // XP necesario para el siguiente nivel
    return Math.pow(currentLevel, 2) * 100;
}

// ========================================
// INITIALIZE PROFILE
// ========================================

function initializeProfile() {
    // Solo inicializar fecha de creación si no existe
    if (!appData.profile.createdAt) {
        appData.profile.createdAt = new Date().toISOString();
        saveData();
    }
    
    // Inicializar badges unlocked si no existe
    if (!appData.profile.badgesUnlocked) {
        appData.profile.badgesUnlocked = [];
        saveData();
    }
}

// ========================================
// RENDER PROFILE
// ========================================

function renderProfile() {
    // Avatar y nombre
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileJoinDate = document.getElementById('profileJoinDate');
    const profileDescription = document.getElementById('profileDescription');
    
    if (profileAvatar) {
        profileAvatar.src = appData.profile.photo || 'resources/default-avatar.png';
        profileAvatar.onerror = () => {
            profileAvatar.src = 'resources/default-avatar.png';
        };
    }
    
    if (profileName) {
        profileName.textContent = appData.profile.name || 'Usuario';
    }
    
    if (profileJoinDate) {
        const joinDate = new Date(appData.profile.createdAt || Date.now());
        profileJoinDate.textContent = `Miembro desde ${formatDate(joinDate)}`;
    }
    
    if (profileDescription) {
        if (appData.profile.description && appData.profile.description.trim()) {
            profileDescription.textContent = appData.profile.description;
        } else {
            profileDescription.textContent = 'Sin descripción';
        }
    }
    
    // Last Activity
    const profileLastActivity = document.getElementById('profileLastActivity');
    if (profileLastActivity) {
        profileLastActivity.textContent = `Última actividad: ${getTimeAgo(Date.now())}`;
    }
    
    // Level & XP
    renderLevelProgress();
    
    // Stats
    updateProfileStats();
    
    // Badges
    renderBadges();
    
    // Activity
    renderProfileActivity();
    
    // Achievements
    renderAchievements();
}

// ========================================
// RENDER LEVEL PROGRESS
// ========================================

function renderLevelProgress() {
    const xp = calculateXP();
    const level = calculateLevel(xp);
    const xpForNextLevel = getXPForNextLevel(level);
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const xpInCurrentLevel = xp - currentLevelXP;
    const xpNeededForLevel = xpForNextLevel - currentLevelXP;
    const progressPercentage = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);
    
    // Update level badges
    const levelElements = document.querySelectorAll('#profileLevel, #profileLevelText');
    levelElements.forEach(el => {
        if (el) el.textContent = level;
    });
    
    // Update progress bar
    const progressFill = document.getElementById('levelProgressFill');
    const progressPercentageEl = document.getElementById('levelProgressPercentage');
    const levelXpText = document.getElementById('levelXpText');
    
    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
    }
    
    if (progressPercentageEl) {
        progressPercentageEl.textContent = `${Math.floor(progressPercentage)}%`;
    }
    
    if (levelXpText) {
        levelXpText.textContent = `${xpInCurrentLevel} / ${xpNeededForLevel} XP`;
    }
}

// ========================================
// UPDATE STATS
// ========================================

function updateProfileStats() {
    const accountsCount = document.getElementById('profileAccountsCount');
    const clipboardCount = document.getElementById('profileClipboardCount');
    const notesCount = document.getElementById('profileNotesCount');
    const timerCount = document.getElementById('profileTimerCount');
    
    if (accountsCount) {
        const count = appData.accounts?.length || 0;
        animateCounter(accountsCount, count);
    }
    
    if (clipboardCount) {
        const count = appData.clipboard?.length || 0;
        animateCounter(clipboardCount, count);
    }
    
    if (notesCount) {
        const count = appData.notes?.length || 0;
        animateCounter(notesCount, count);
    }
    
    if (timerCount) {
        const count = appData.timerSessions || 0;
        animateCounter(timerCount, count);
    }
}

// ========================================
// ANIMATE COUNTER
// ========================================

function animateCounter(element, target) {
    const duration = 1000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ========================================
// RENDER BADGES
// ========================================

function renderBadges() {
    const badgesContainer = document.getElementById('profileBadges');
    const badgesCountEl = document.getElementById('badgesCount');
    
    if (!badgesContainer) return;
    
    // Check which badges are unlocked
    const unlockedBadges = checkUnlockedBadges();
    
    // Update count
    if (badgesCountEl) {
        badgesCountEl.textContent = `${unlockedBadges.length}/${BADGES_CONFIG.length}`;
    }
    
    // Render badges
    badgesContainer.innerHTML = BADGES_CONFIG.map(badge => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        
        return `
            <div class="badge-item ${isUnlocked ? '' : 'locked'}" title="${badge.name}">
                <div class="badge-icon">
                    <i data-lucide="${badge.icon}"></i>
                </div>
                <div class="badge-name">${badge.name}</div>
            </div>
        `;
    }).join('');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ========================================
// CHECK UNLOCKED BADGES
// ========================================

function checkUnlockedBadges() {
    const unlocked = [];
    const accounts = appData.accounts?.length || 0;
    const notes = appData.notes?.length || 0;
    const clipboard = appData.clipboard?.length || 0;
    const timerSessions = appData.timerSessions || 0;
    const total = accounts + notes + clipboard;
    const daysActive = calculateDaysActive();
    
    BADGES_CONFIG.forEach(badge => {
        let isUnlocked = false;
        
        switch (badge.type) {
            case 'accounts':
                isUnlocked = accounts >= badge.requirement;
                break;
            case 'notes':
                isUnlocked = notes >= badge.requirement;
                break;
            case 'clipboard':
                isUnlocked = clipboard >= badge.requirement;
                break;
            case 'timer':
                isUnlocked = timerSessions >= badge.requirement;
                break;
            case 'total':
                isUnlocked = total >= badge.requirement;
                break;
            case 'days':
                isUnlocked = daysActive >= badge.requirement;
                break;
        }
        
        if (isUnlocked) {
            unlocked.push(badge.id);
        }
    });
    
    return unlocked;
}

// ========================================
// RENDER ACTIVITY
// ========================================

function renderProfileActivity() {
    const activityList = document.getElementById('profileActivityList');
    if (!activityList) return;
    
    const activities = getRecentActivities();
    
    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="activity"></i>
                <h3>Sin actividad reciente</h3>
                <p>Tus acciones aparecerán aquí</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        return;
    }
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i data-lucide="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ========================================
// GET RECENT ACTIVITIES
// ========================================

function getRecentActivities() {
    const activities = [];
    
    // Add account activities
    if (appData.accounts && appData.accounts.length > 0) {
        const recentAccounts = appData.accounts
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 3);
        
        recentAccounts.forEach(account => {
            activities.push({
                icon: 'key',
                title: `Cuenta agregada: ${account.platform}`,
                time: getTimeAgo(account.createdAt),
                timestamp: new Date(account.createdAt || 0)
            });
        });
    }
    
    // Add note activities
    if (appData.notes && appData.notes.length > 0) {
        const recentNotes = appData.notes
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 3);
        
        recentNotes.forEach(note => {
            activities.push({
                icon: 'sticky-note',
                title: `Nota creada: ${note.title}`,
                time: getTimeAgo(note.createdAt),
                timestamp: new Date(note.createdAt || 0)
            });
        });
    }
    
    // Add clipboard activities
    if (appData.clipboard && appData.clipboard.length > 0) {
        const recentClipboard = appData.clipboard
            .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
            .slice(0, 2);
        
        recentClipboard.forEach(item => {
            activities.push({
                icon: 'bookmark',
                title: `Item guardado en portapapeles`,
                time: getTimeAgo(item.timestamp),
                timestamp: new Date(item.timestamp || 0)
            });
        });
    }
    
    // Sort by timestamp and take top 8
    return activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 8);
}

// ========================================
// RENDER ACHIEVEMENTS
// ========================================

function renderAchievements() {
    const achievementsGrid = document.getElementById('achievementsGrid');
    const achievementsProgress = document.getElementById('achievementsProgress');
    
    if (!achievementsGrid) return;
    
    const unlockedAchievements = ACHIEVEMENTS_CONFIG.filter(achievement => 
        achievement.check(appData)
    );
    
    const progressPercentage = Math.floor((unlockedAchievements.length / ACHIEVEMENTS_CONFIG.length) * 100);
    
    if (achievementsProgress) {
        achievementsProgress.textContent = `${progressPercentage}%`;
    }
    
    achievementsGrid.innerHTML = ACHIEVEMENTS_CONFIG.map(achievement => {
        const isUnlocked = achievement.check(appData);
        
        return `
            <div class="achievement-item ${isUnlocked ? '' : 'locked'}">
                <div class="achievement-icon">
                    <i data-lucide="${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `;
    }).join('');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ========================================
// DATE FORMATTING
// ========================================

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

function getTimeAgo(timestamp) {
    if (!timestamp) return 'Hace un momento';
    
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Hace un momento';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
    
    const years = Math.floor(days / 365);
    return `Hace ${years} año${years > 1 ? 's' : ''}`;
}

// ========================================
// EDIT PROFILE
// ========================================

function openEditProfile() {
    isEditingProfile = true;
    
    const modal = document.createElement('div');
    modal.id = 'editProfileModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Editar Perfil</h2>
                <button class="modal-close" onclick="closeEditProfile()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label>Nombre</label>
                    <input type="text" id="editProfileName" class="input" 
                           placeholder="Tu nombre" value="${appData.profile.name || ''}" maxlength="50">
                </div>
                
                <div class="input-group">
                    <label>Descripción</label>
                    <textarea id="editProfileDescription" class="input" rows="3"
                              placeholder="Cuéntanos algo sobre ti..." maxlength="200">${appData.profile.description || ''}</textarea>
                    <small style="color: var(--text-muted); font-size: var(--font-size-xs); margin-top: var(--spacing-2); display: block;">
                        <span id="descriptionCounter">0</span>/200 caracteres
                    </small>
                </div>
                
                <div class="input-group">
                    <label>Foto de perfil (URL)</label>
                    <input type="text" id="editProfilePhoto" class="input" 
                           placeholder="https://ejemplo.com/foto.jpg" value="${appData.profile.photo || ''}">
                    <small style="color: var(--text-muted); font-size: var(--font-size-xs); margin-top: var(--spacing-2); display: block;">
                        Introduce la URL de una imagen o deja vacío para usar la predeterminada
                    </small>
                </div>
                
                <div class="input-group">
                    <label>Previsualización</label>
                    <div style="display: flex; align-items: center; gap: var(--spacing-4); 
                                padding: var(--spacing-4); background: var(--bg-tertiary); 
                                border-radius: var(--radius-lg); border: 1px solid var(--border-primary);">
                        <img id="editProfilePreview" 
                             src="${appData.profile.photo || 'resources/default-avatar.png'}" 
                             style="width: 80px; height: 80px; border-radius: 4px; object-fit: cover; 
                                    border: 2px solid var(--accent-primary);">
                        <div style="flex: 1;">
                            <div style="color: var(--text-primary); font-weight: 600; margin-bottom: var(--spacing-1);" 
                                 id="editProfilePreviewName">${appData.profile.name || 'Usuario'}</div>
                            <div style="color: var(--text-muted); font-size: var(--font-size-sm); font-style: italic;" 
                                 id="editProfilePreviewDesc">${appData.profile.description || 'Sin descripción'}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeEditProfile()">Cancelar</button>
                <button class="btn-primary" onclick="saveProfileChanges()">Guardar cambios</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Event listeners
    const nameInput = document.getElementById('editProfileName');
    const descriptionInput = document.getElementById('editProfileDescription');
    const photoInput = document.getElementById('editProfilePhoto');
    const previewImg = document.getElementById('editProfilePreview');
    const previewName = document.getElementById('editProfilePreviewName');
    const previewDesc = document.getElementById('editProfilePreviewDesc');
    const descCounter = document.getElementById('descriptionCounter');
    
    // Update counter
    if (descCounter && descriptionInput) {
        descCounter.textContent = descriptionInput.value.length;
        descriptionInput.addEventListener('input', (e) => {
            descCounter.textContent = e.target.value.length;
            previewDesc.textContent = e.target.value || 'Sin descripción';
        });
    }
    
    nameInput.addEventListener('input', (e) => {
        previewName.textContent = e.target.value || 'Usuario';
    });
    
    photoInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
            previewImg.src = url;
            previewImg.onerror = () => {
                previewImg.src = 'resources/default-avatar.png';
            };
        } else {
            previewImg.src = 'resources/default-avatar.png';
        }
    });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeEditProfile() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    isEditingProfile = false;
}

function saveProfileChanges() {
    const name = document.getElementById('editProfileName').value.trim();
    const description = document.getElementById('editProfileDescription').value.trim();
    const photo = document.getElementById('editProfilePhoto').value.trim();
    
    if (!name) {
        showNotification('Por favor ingresa un nombre', 'error');
        return;
    }
    
    // Validate photo URL if provided
    if (photo) {
        const img = new Image();
        img.onload = () => {
            saveProfileData(name, description, photo);
        };
        img.onerror = () => {
            showNotification('La URL de la imagen no es válida. Se usará la imagen predeterminada.', 'warning');
            saveProfileData(name, description, '');
        };
        img.src = photo;
    } else {
        saveProfileData(name, description, '');
    }
}

function saveProfileData(name, description, photo) {
    appData.profile.name = name;
    appData.profile.description = description;
    appData.profile.photo = photo || 'resources/default-avatar.png';
    
    saveData();
    renderProfile();
    
    // Update header
    const headerProfileName = document.getElementById('headerProfileName');
    const headerProfilePic = document.getElementById('headerProfilePic');
    
    if (headerProfileName) {
        headerProfileName.textContent = name;
    }
    
    if (headerProfilePic) {
        headerProfilePic.src = appData.profile.photo;
        headerProfilePic.onerror = () => {
            headerProfilePic.src = 'resources/default-avatar.png';
        };
    }
    
    closeEditProfile();
    showNotification('Perfil actualizado correctamente', 'success');
}

// ========================================
// SHOW ALL ACTIVITY
// ========================================

function showAllActivity() {
    showNotification('Función en desarrollo', 'info');
}

// ========================================
// REFRESH PROFILE
// ========================================

function refreshProfile() {
    renderProfile();
}