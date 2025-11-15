// ========================================
// ESTADO DEL TEMPORIZADOR
// ========================================

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

// ========================================
// INICIALIZAR TEMPORIZADOR
// ========================================

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

// ========================================
// MODOS DEL TEMPORIZADOR
// ========================================

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

// ========================================
// CONTROLES DEL TEMPORIZADOR
// ========================================

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

// ========================================
// ACTUALIZAR DISPLAY
// ========================================

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

// ========================================
// SONIDO
// ========================================

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

function playTimerSoundOnce() {
    playTimerSound();
}

// ========================================
// SONIDOS ESPECÍFICOS
// ========================================

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

// ========================================
// MODAL DE SONIDOS
// ========================================

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

// ========================================
// NOTIFICACIÓN DE TIMER COMPLETO
// ========================================

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
        document.title = flashCount % 2 === 0 ? '¡Tiempo!' : originalTitle;
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