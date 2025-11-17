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
    { text: "En el silencio encontramos respuestas que el ruido nunca nos dará", author: "Proverbio Zen" },

    { text: "La calma es la cumbre del poder", author: "Proverbio Japonés" },
    { text: "Donde hay paciencia, hay sabiduría", author: "Proverbio Oriental" },
    { text: "El que domina a otros es fuerte; el que se domina a sí mismo es poderoso", author: "Lao Tzu" },
    { text: "Cuando el alumno está listo, aparece el maestro", author: "Proverbio Zen" },
    { text: "Respira. Todo está llegando", author: "Desconocido" },
    { text: "A veces, no hacer nada es el acto más poderoso", author: "Proverbio Zen" },
    { text: "La disciplina tarde o temprano vencerá a la inteligencia", author: "Proverbio Japonés" },
    { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día", author: "Robert Collier" },
    { text: "Lo que resistes, persiste. Lo que aceptas, se transforma", author: "Carl Jung" },
    { text: "La mente tranquila trae fortaleza interior", author: "Dalai Lama" },

    { text: "Si te caes siete veces, levántate ocho", author: "Proverbio Japonés" },
    { text: "Cada día es una nueva oportunidad para cambiar tu vida", author: "Desconocido" },
    { text: "Sé como el agua: fuerte, suave y adaptable", author: "Bruce Lee" },
    { text: "Un viaje de mil millas comienza con un solo paso", author: "Lao Tzu" },
    { text: "Tu mayor oponente eres tú mismo", author: "Proverbio Japonés" },
    { text: "Nada florece durante todo el año; descansa también", author: "Desconocido" },
    { text: "Cuida tus pensamientos; se convierten en acciones", author: "Lao Tzu" },
    { text: "Cambiar es difícil al principio, confuso en medio y hermoso al final", author: "Robin Sharma" },
    { text: "El pasado ya no está, el futuro no llegó. Solo tienes este momento", author: "Proverbio Zen" },
    { text: "No te sobrecargues. Incluso el cielo descansa al anochecer", author: "Proverbio Chino" },

    { text: "Confiar en ti mismo es el primer paso hacia todo", author: "Ralph Waldo Emerson" },
    { text: "La paciencia es el mejor remedio para cualquier problema", author: "Proverbio Chino" },
    { text: "La gota cava la piedra no por su fuerza, sino por su constancia", author: "Ovidio" },
    { text: "Haz lo que puedas, con lo que tengas, donde estés", author: "Theodore Roosevelt" },
    { text: "Cuanto más sereno estás, más claro ves", author: "Proverbio Zen" },
    { text: "El dolor es inevitable, pero el sufrimiento es opcional", author: "Proverbio Japonés" },
    { text: "La mejor forma de predecir el futuro es crearlo", author: "Peter Drucker" },
    { text: "No hay camino a la felicidad. La felicidad es el camino", author: "Buddha" },
    { text: "La motivación te pone en marcha. El hábito te mantiene", author: "Jim Ryun" },
    { text: "A veces perder es la manera de ganar espacio para algo mejor", author: "Desconocido" },

    { text: "No cuentes los días, haz que los días cuenten", author: "Muhammad Ali" },
    { text: "El momento presente es un regalo. Por eso se llama presente", author: "Proverbio Zen" },
    { text: "La fuerza crece en los momentos en que pensaste que no podías más", author: "Desconocido" },
    { text: "Sé firme, pero no duro. Sé suave, pero no débil", author: "Proverbio Japonés" },
    { text: "No necesitas velocidad, necesitas dirección", author: "Desconocido" },
    { text: "Tu vida es tan buena como tu mentalidad", author: "Desconocido" },
    { text: "La constancia gana donde la intensidad falla", author: "Desconocido" },
    { text: "La flor que florece en la adversidad es la más hermosa de todas", author: "Proverbio Chino" },
    { text: "Suelta lo que pesa, aunque duela", author: "Desconocido" },
    { text: "Lo que haces hoy puede mejorar todos tus mañanas", author: "Ralph Marston" },

    { text: "No es la meta, es el camino", author: "Proverbio Zen" },
    { text: "Cuida el exterior tanto como el interior; todo es uno", author: "Buddha" },
    { text: "A veces el silencio es la respuesta más poderosa", author: "Proverbio Zen" },
    { text: "Cada día tienes la oportunidad de ser un poco mejor", author: "Desconocido" },
    { text: "Enfócate en el paso que tienes enfrente, no en toda la escalera", author: "Martin Luther King" },
    { text: "No llenes tu vida de ruido, deja espacio para respirar", author: "Desconocido" },
    { text: "Lo que haces repetidamente determina quién eres", author: "Aristóteles" },
    { text: "El equilibrio no es algo que encuentras, es algo que creas", author: "Desconocido" },
    { text: "La claridad llega cuando dejas de correr", author: "Proverbio Zen" },
    { text: "El que quiere hacerlo, encuentra un medio. El que no, una excusa", author: "Proverbio Árabe" }
];

// Inicializar dashboard zen
function initZenDashboard() {
    updateGreeting();
    displayZenQuote();
    createRealisticPetals();
    animateStats();
}

// Saludo dinámico según la hora con variaciones aleatorias
function updateGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.querySelector('.hero-greeting');
    const userName = appData.profile.name || 'Usuario';
    
    let greetings = [];
    
    // Madrugada (0:00 - 5:59)
    if (hour >= 0 && hour < 6) {
        greetings = [
            `Vaya, trabajando tarde, ${userName}?`,
            `Aún despierto/a, ${userName}?`,
            `Noche larga, eh ${userName}?`,
            `Qué te trae por aquí a esta hora, ${userName}?`
        ];
    }
    // Amanecer (6:00 - 7:59)
    else if (hour >= 6 && hour < 8) {
        greetings = [
            `Buen día, ${userName}`,
            `Empezando temprano, ${userName}?`,
            `Buenos días, ${userName}`,
            `Madrugador/a hoy, ${userName}`
        ];
    }
    // Mañana (8:00 - 11:59)
    else if (hour >= 8 && hour < 12) {
        greetings = [
            `Buenos días, ${userName}`,
            `Hola, ${userName}`,
            `Qué tal, ${userName}?`,
            `Cómo va tu mañana, ${userName}?`
        ];
    }
    // Mediodía (12:00 - 13:59)
    else if (hour >= 12 && hour < 14) {
        greetings = [
            `Hola, ${userName}`,
            `Ya es mediodía, ${userName}`,
            `Qué tal, ${userName}?`,
            `Hora de un descanso, ${userName}?`
        ];
    }
    // Tarde (14:00 - 18:59)
    else if (hour >= 14 && hour < 19) {
        greetings = [
            `Buenas tardes, ${userName}`,
            `Hola, ${userName}`,
            `Cómo va tu tarde, ${userName}?`,
            `Qué tal todo, ${userName}?`
        ];
    }
    // Atardecer (19:00 - 20:59)
    else if (hour >= 19 && hour < 21) {
        greetings = [
            `Buenas noches, ${userName}`,
            `Terminando el día, ${userName}?`,
            `Cómo estuvo tu día, ${userName}?`,
            `Ya casi noche, ${userName}`
        ];
    }
    // Noche (21:00 - 23:59)
    else {
        greetings = [
            `Buenas noches, ${userName}`,
            `Hola, ${userName}`,
            `Relajándote ya, ${userName}?`,
            `Cómo va la noche, ${userName}?`
        ];
    }
    
    // Seleccionar un saludo aleatorio
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    if (greetingEl) {
        greetingEl.textContent = randomGreeting;
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