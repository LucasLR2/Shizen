// ========================================
// DASHBOARD ZEN - ÉPICO
// ========================================

// Frases zen japonesas
const zenQuotes = [
    { text: "La simplicidad es la máxima sofisticación", author: "Proverbio Zen" },
    { text: "El río que todo lo arrasa se llama violento, pero nadie llama violento al lecho que lo oprime", author: "Lao Tzu" },
    { text: "La paz viene de dentro. No la busques fuera", author: "Buddha" },
    { text: "Deja ir o sé arrastrado", author: "Proverbio Zen" },
    { text: "El mejor momento fue ayer. El segundo mejor momento es ahora", author: "Proverbio Chino" },
    { text: "No temas ir despacio, teme sólo quedarte quieto", author: "Proverbio Chino" },
    { text: "Una jarra se llena gota a gota", author: "Buddha" },
    { text: "El que conoce a los demás es sabio. El que se conoce a sí mismo es iluminado", author: "Lao Tzu" },
    { text: "La naturaleza no se apresura, pero todo se realiza", author: "Lao Tzu" },
    { text: "En el silencio encontramos respuestas que el ruido nunca nos dará", author: "Proverbio Zen" }
];

// Inicializar dashboard zen
function initZenDashboard() {
    updateGreeting();
    displayZenQuote();
    createRealisticPetals();
    animateStats();
}

// Saludo dinámico según la hora
function updateGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.querySelector('.hero-greeting');
    const userName = appData.profile.name || 'Usuario';
    
    let greeting = '';
    if (hour < 12) {
        greeting = `Buenos días, ${userName}`;
    } else if (hour < 18) {
        greeting = `Buenas tardes, ${userName}`;
    } else {
        greeting = `Buenas noches, ${userName}`;
    }
    
    if (greetingEl) {
        greetingEl.textContent = greeting;
    }
}

// Mostrar frase zen aleatoria del día
function displayZenQuote() {
    // Usar la fecha como seed para que sea la misma durante todo el día
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const quoteIndex = seed % zenQuotes.length;
    
    const quote = zenQuotes[quoteIndex];
    const quoteTextEl = document.querySelector('.zen-quote');
    const quoteAuthorEl = document.querySelector('.zen-quote-author');
    
    if (quoteTextEl && quoteAuthorEl) {
        quoteTextEl.textContent = `"${quote.text}"`;
        quoteAuthorEl.textContent = `— ${quote.author}`;
    }
}

// Crear pétalos realistas de sakura
function createRealisticPetals() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;
    
    // Limpiar pétalos existentes
    container.innerHTML = '';
    
    const petalCount = 25; // Más pétalos para efecto más lleno
    
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'sakura-petal';
        
        // Posición inicial aleatoria en X
        petal.style.left = Math.random() * 100 + '%';
        
        // Duración aleatoria (más lenta = más realista)
        const duration = 12 + Math.random() * 10; // 12-22 segundos
        petal.style.animationDuration = duration + 's';
        
        // Delay aleatorio escalonado
        petal.style.animationDelay = (Math.random() * 8) + 's';
        
        // Tamaño aleatorio (pétalos de diferentes tamaños)
        const size = 10 + Math.random() * 12; // 10-22px
        petal.style.width = size + 'px';
        petal.style.height = size + 'px';
        
        // Variación en la opacidad máxima
        const maxOpacity = 0.7 + Math.random() * 0.3;
        petal.style.setProperty('--max-opacity', maxOpacity);
        
        container.appendChild(petal);
    }
}

// Animar estadísticas con efecto de conteo
function animateStats() {
    const badges = document.querySelectorAll('.stat-badge');
    
    badges.forEach((badge, index) => {
        const valueEl = badge.querySelector('.stat-badge-value');
        
        if (!valueEl) return;
        
        const finalValue = parseInt(valueEl.textContent) || 0;
        
        // Animar el conteo con delay progresivo
        setTimeout(() => {
            animateValue(valueEl, 0, finalValue, 1200);
        }, 600 + (index * 100));
    });
}

// Función para animar valores numéricos con easing
function animateValue(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    
    function easeOutQuart(x) {
        return 1 - Math.pow(1 - x, 4);
    }
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easedProgress = easeOutQuart(progress);
        const current = start + (range * easedProgress);
        
        element.textContent = Math.floor(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end;
        }
    }
    
    requestAnimationFrame(update);
}

// Actualizar estadísticas en los badges
function updateDashboardStats() {
    const accountsCount = appData.accounts?.length || 0;
    const clipboardCount = appData.clipboard?.length || 0;
    const notesCount = appData.notes?.length || 0;
    
    // Actualizar valores en el DOM
    const accountsValue = document.querySelector('.stat-badge.accounts .stat-badge-value');
    const clipboardValue = document.querySelector('.stat-badge.clipboard .stat-badge-value');
    const notesValue = document.querySelector('.stat-badge.notes .stat-badge-value');
    
    if (accountsValue) accountsValue.textContent = accountsCount;
    if (clipboardValue) clipboardValue.textContent = clipboardCount;
    if (notesValue) notesValue.textContent = notesCount;
    
    // Re-animar después de actualizar
    if (document.querySelector('.section#section-dashboard')?.classList.contains('active')) {
        animateStats();
    }
}

// Reiniciar animaciones cuando se muestra el dashboard
function refreshDashboard() {
    if (document.querySelector('.dashboard-hero')) {
        initZenDashboard();
        updateDashboardStats();
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(refreshDashboard, 100);
    });
} else {
    setTimeout(refreshDashboard, 100);
}