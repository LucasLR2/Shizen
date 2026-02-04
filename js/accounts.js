// ========================================
// RENDERIZAR CUENTAS
// ========================================

let currentSearchTerm = '';

function renderAccounts() {
    const accountsList = document.getElementById('accountsList');
    const searchInput = document.getElementById('accountsSearch');
    const clearBtn = document.getElementById('searchClearBtn');

    if (!accountsList) return;

    // Filtrar cuentas según el término de búsqueda
    let filteredAccounts = appData.accounts;
    
    if (currentSearchTerm) {
        filteredAccounts = appData.accounts.filter(account => {
            const searchLower = currentSearchTerm.toLowerCase();
            return account.platform.toLowerCase().includes(searchLower) ||
                   account.username.toLowerCase().includes(searchLower);
        });
    }

    if (filteredAccounts.length === 0) {
        if (currentSearchTerm) {
            accountsList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="search"></i>
                    <h3>No se encontraron resultados</h3>
                    <p>No hay cuentas que coincidan con "${currentSearchTerm}"</p>
                </div>
            `;
        } else {
            accountsList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="key"></i>
                    <h3>No hay cuentas guardadas</h3>
                    <p>Comienza agregando tu primera cuenta</p>
                </div>
            `;
        }
    } else {
        // Agrupar cuentas por categoría
        const grouped = {};
        filteredAccounts.forEach((account) => {
            const originalIndex = appData.accounts.indexOf(account);
            const category = account.platform.toLowerCase();
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push({ account, originalIndex });
        });

        // Ordenar categorías por cantidad (ascendente: menos cuentas primero)
        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            return grouped[a].length - grouped[b].length;
        });

        // Crear array ordenado de cuentas
        const sortedAccounts = [];
        sortedCategories.forEach(category => {
            grouped[category].forEach(item => {
                sortedAccounts.push(item);
            });
        });

        accountsList.innerHTML = sortedAccounts.map(item => `
            <div class="card account-card ${item.account.active === false ? 'inactive' : ''}">
                <div class="account-header">
                    <div class="account-icon">
                        <i data-lucide="key"></i>
                    </div>
                    <div class="account-info">
                        <h3>${item.account.platform} <span class="category-badge">${getCategoryCount(item.account.platform)}</span></h3>
                        <p>${item.account.username}</p>
                    </div>
                </div>
                <div class="account-actions">
                    <button class="btn-icon" onclick="copyToClipboard('${item.account.username}')" title="Copiar usuario">
                        <i data-lucide="user"></i>
                    </button>
                    <button class="btn-icon" onclick="copyToClipboard('${item.account.password}')" title="Copiar contraseña">
                        <i data-lucide="key"></i>
                    </button>
                    <button class="btn-icon" onclick="toggleAccountStatus(${item.originalIndex})" title="${item.account.active === false ? 'Activar cuenta' : 'Desactivar cuenta'}">
                        <i data-lucide="power"></i>
                    </button>
                    <button class="btn-icon" onclick="editAccount(${item.originalIndex})" title="Editar">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteAccount(${item.originalIndex})" title="Eliminar">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                ${item.account.notes ? `<div class="account-notes">${item.account.notes}</div>` : ''}
            </div>
        `).join('');
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    updateStats();
}

// ========================================
// MODAL DE CUENTA
// ========================================

function openAccountModal() {
    editingAccountIndex = -1;
    document.getElementById('accountModalTitle').textContent = 'Nueva Cuenta';
    document.getElementById('accountPlatform').value = '';
    document.getElementById('accountUsername').value = '';
    document.getElementById('accountPassword').value = '';
    document.getElementById('accountNotes').value = '';
    document.getElementById('accountModal').classList.add('active');

    // Inicializar autocompletado de categorías
    initCategoryAutocomplete();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeAccountModal() {
    document.getElementById('accountModal').classList.remove('active');
    editingAccountIndex = -1;
}

function saveAccount() {
    const platform = document.getElementById('accountPlatform').value.trim();
    const username = document.getElementById('accountUsername').value.trim();
    const password = document.getElementById('accountPassword').value.trim();
    const notes = document.getElementById('accountNotes').value.trim();

    if (!platform || !username || !password) {
        showNotification('Por favor completa todos los campos obligatorios', 'error');
        return;
    }

    const account = {
        platform,
        username,
        password,
        notes,
        active: editingAccountIndex >= 0 ? appData.accounts[editingAccountIndex].active : true,
        createdAt: editingAccountIndex >= 0 ? appData.accounts[editingAccountIndex].createdAt : new Date().toISOString()
    };

    if (editingAccountIndex >= 0) {
        appData.accounts[editingAccountIndex] = account;
        showNotification('Cuenta actualizada correctamente', 'success');
    } else {
        appData.accounts.push(account);
        showNotification('Cuenta agregada correctamente', 'success');
    }

    saveToSession();
    renderAccounts();
    closeAccountModal();
}

function editAccount(index) {
    editingAccountIndex = index;
    const account = appData.accounts[index];

    document.getElementById('accountModalTitle').textContent = 'Editar Cuenta';
    document.getElementById('accountPlatform').value = account.platform;
    document.getElementById('accountUsername').value = account.username;
    document.getElementById('accountPassword').value = account.password;
    document.getElementById('accountNotes').value = account.notes || '';
    document.getElementById('accountModal').classList.add('active');

    // Inicializar autocompletado de categorías
    initCategoryAutocomplete();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function deleteAccount(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
        appData.accounts.splice(index, 1);
        saveToSession();
        renderAccounts();
        showNotification('Cuenta eliminada correctamente', 'success');
    }
}

function toggleAccountStatus(index) {
    appData.accounts[index].active = !appData.accounts[index].active;
    saveToSession();
    renderAccounts();
    const status = appData.accounts[index].active ? 'activada' : 'desactivada';
    showNotification(`Cuenta ${status} correctamente`, 'success');
}

// ========================================
// AUTOCOMPLETADO DE CATEGORÍAS
// ========================================

function getExistingCategories() {
    const categories = appData.accounts.map(acc => acc.platform);
    // Eliminar duplicados y ordenar
    return [...new Set(categories)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

function getCategoryCount(category) {
    return appData.accounts.filter(acc => acc.platform.toLowerCase() === category.toLowerCase()).length;
}

function initCategoryAutocomplete() {
    const input = document.getElementById('accountPlatform');
    const suggestionsDiv = document.getElementById('categorySuggestions');

    if (!input || !suggestionsDiv) return;

    let selectedIndex = -1;

    // Limpiar sugerencias previas
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.style.display = 'none';

    input.addEventListener('input', function () {
        const value = this.value.trim();
        selectedIndex = -1;

        if (value.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        const categories = getExistingCategories();
        const matches = categories.filter(cat =>
            cat.toLowerCase().startsWith(value.toLowerCase())
        ).slice(0, 5); // Máximo 5 sugerencias

        if (matches.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        suggestionsDiv.innerHTML = matches.map((cat, index) => {
            const count = getCategoryCount(cat);
            return `
                <div class="suggestion-item" data-index="${index}" data-value="${cat}">
                    <span class="suggestion-name">${cat}</span>
                    <span class="suggestion-count">${count}</span>
                </div>
            `;
        }).join('');

        suggestionsDiv.style.display = 'block';

        // Click en sugerencia
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function () {
                input.value = this.dataset.value;
                suggestionsDiv.style.display = 'none';
                input.focus();
            });
        });
    });

    // Navegación con teclado
    input.addEventListener('keydown', function (e) {
        const items = suggestionsDiv.querySelectorAll('.suggestion-item');

        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelectedSuggestion(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelectedSuggestion(items, selectedIndex);
        } else if (e.key === 'Tab' && selectedIndex >= 0) {
            e.preventDefault();
            input.value = items[selectedIndex].dataset.value;
            suggestionsDiv.style.display = 'none';
        } else if (e.key === 'Tab' && items.length > 0) {
            e.preventDefault();
            input.value = items[0].dataset.value;
            suggestionsDiv.style.display = 'none';
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            input.value = items[selectedIndex].dataset.value;
            suggestionsDiv.style.display = 'none';
        } else if (e.key === 'Escape') {
            suggestionsDiv.style.display = 'none';
            selectedIndex = -1;
        }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', function (e) {
        if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

function updateSelectedSuggestion(items, index) {
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// ========================================
// BÚSQUEDA DE CUENTAS
// ========================================

function initAccountsSearch() {
    const searchInput = document.getElementById('accountsSearch');

    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        currentSearchTerm = this.value.trim();
        renderAccounts();
    });

    // Inicializar íconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Inicializar búsqueda cuando se muestre la sección de cuentas
document.addEventListener('DOMContentLoaded', function() {
    initAccountsSearch();
});