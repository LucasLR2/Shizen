// ========================================
// TOGGLE FAQ
// ========================================

function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const wasActive = faqItem.classList.contains('active');
    
    // Cerrar todos los FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Abrir el clickeado si no estaba activo
    if (!wasActive) {
        faqItem.classList.add('active');
    }
    
    // Reinicializar iconos
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}