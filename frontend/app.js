// ==================== MAIN APPLICATION ====================

let currentCompanyId = null;
let currentUser = null;
let allCompanies = [];
let searchQuery = '';

// Show companies view
function showCompanies() {
    document.getElementById('companyView').style.display = 'block';
    document.getElementById('productsView').style.display = 'none';
    currentCompanyId = null;
    const bg = document.getElementById('productsBg');
    if (bg) bg.style.opacity = '0';
    
    // Reset search
    document.getElementById('searchInput').value = '';
    document.getElementById('searchClear').style.display = 'none';
    searchQuery = '';
    renderCompanies();
}

// Search functionality
function handleSearch(event) {
    searchQuery = event.target.value.toLowerCase();
    const clearBtn = document.getElementById('searchClear');
    clearBtn.style.display = searchQuery ? 'block' : 'none';
    
    if (searchQuery.length >= 2) {
        showSearchResults(searchQuery);
    } else if (searchQuery.length === 0) {
        renderCompanies();
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchClear').style.display = 'none';
    searchQuery = '';
    renderCompanies();
}

async function showSearchResults(query) {
    const companies = await StorageManager.getCompanies();
    const results = [];
    
    companies.forEach(company => {
        company.products.forEach(product => {
            if (product.name.toLowerCase().includes(query) || 
                company.name.toLowerCase().includes(query)) {
                results.push({ ...product, company });
            }
        });
    });
    
    renderSearchResults(results, query);
}

function renderSearchResults(results, query) {
    document.getElementById('companyView').style.display = 'block';
    document.getElementById('productsView').style.display = 'none';
    
    const grid = document.getElementById('companiesGrid');
    grid.innerHTML = `
        <div class="search-results-header">
            <h2>Search Results for "${query}"</h2>
            <p>Found ${results.length} products</p>
        </div>
    `;
    
    if (results.length === 0) {
        grid.innerHTML += `
            <div class="empty-state">
                <p>No products found for "${query}"</p>
                <button class="btn-primary" onclick="showCompanies()">Browse All Products</button>
            </div>
        `;
        return;
    }
    
    // Show products directly
    results.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card search-result-card';
        card.onclick = () => showProducts(product.company.id);
        
        let stockClass = product.stock > 10 ? 'in-stock' : (product.stock > 0 ? 'low-stock' : 'out-of-stock');
        let stockText = product.stock > 10 ? `In Stock (${product.stock})` : (product.stock > 0 ? `Low Stock (${product.stock})` : 'Out of Stock');
        
        card.innerHTML = `
            <div class="product-image">${product.image ? `<span class="product-emoji">${product.image}</span>` : '<div class="product-placeholder"></div>'}</div>
            <div class="product-details">
                <p class="product-company">${product.company.name}</p>
                <h3>${product.name}</h3>
                <div class="product-meta">
                    <span class="price">NPR ${product.price.toLocaleString()}</span>
                    <span class="weight">${product.gram}</span>
                </div>
                <div class="stock-badge ${stockClass}">${stockText}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Hide loading screen
function hideLoading() {
    const loader = document.getElementById('loadingScreen');
    loader.classList.add('hidden');
    setTimeout(() => loader.style.display = 'none', 500);
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await StorageManager.init();
        allCompanies = StorageManager.getCompaniesWithProducts();
        renderCompanies();
        await CustomerAuth.checkAuthStatus();
        Admin.checkAdminStatus();
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Failed to load. Please refresh the page.', 'error');
    } finally {
        hideLoading();
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const authModal = document.getElementById('authModal');
            const dashboard = document.getElementById('customerDashboard');
            const editProfile = document.getElementById('editProfileModal');
            const changePassword = document.getElementById('changePasswordModal');
            const adminPanel = document.getElementById('adminPanel');

            if (authModal.classList.contains('active')) CustomerAuth.closeAuthModal();
            if (dashboard.classList.contains('active')) CustomerAuth.closeDashboard();
            if (editProfile.classList.contains('active')) CustomerAuth.closeEditProfile();
            if (changePassword.classList.contains('active')) CustomerAuth.closeChangePassword();
            if (adminPanel.classList.contains('active')) Admin.closeAdminPanel();
        }
    });

    console.log('Pranil Sales & Marketing Platform - Ready');
});

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    
    notification.innerHTML = `${icons[type] || icons.success}<span>${message}</span>`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Render companies on page load
function renderCompanies() {
    const companies = StorageManager.getCompaniesWithProducts();
    const grid = document.getElementById('companiesGrid');
    grid.innerHTML = '';

    if (companies.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; padding: 3rem;">
                <h3>No companies yet</h3>
                <p>Admin can add companies from the admin panel</p>
                <button class="btn-primary" onclick="Admin.showAdminPanel()" style="margin-top: 1rem;">Go to Admin Panel</button>
            </div>
        `;
        return;
    }

    companies.forEach((company, index) => {
        const card = document.createElement('div');
        card.className = 'company-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.backgroundColor = company.bgColor;

        card.innerHTML = `
            <img src="${company.logo}" alt="${company.name}" class="company-logo-img" onerror="this.src='https://placehold.co/100x100/000/fff?text=${company.name.charAt(0)}'">
            <h3>${company.name}</h3>
            <p>${company.products.length} Products</p>
        `;

        card.addEventListener('click', () => showProducts(company.id));
        grid.appendChild(card);
    });
}

// Show products view
function showProducts(companyId) {
    const company = StorageManager.getCompanyById(companyId);
    if (!company) return;

    const products = StorageManager.getProducts(companyId);
    currentCompanyId = companyId;
    document.getElementById('companyView').style.display = 'none';
    document.getElementById('productsView').style.display = 'block';

    // Update header
    const productsHeader = document.getElementById('productsHeader');
    productsHeader.style.background = `linear-gradient(135deg, ${company.bgColor}22, ${company.bgColor}11)`;
    
    const infoHeader = document.getElementById('companyInfoHeader');
    infoHeader.innerHTML = `
        <h2>${company.name}</h2>
    `;

    // set blurred background to company image (falls back to logo)
    const bgEl = document.getElementById('productsBg');
    if (bgEl) {
        const img = company.headerImage || company.image || company.logo || '';
        bgEl.style.backgroundImage = img ? `url('${img}')` : '';
        // reveal with a short delay for smoother transition
        requestAnimationFrame(() => { bgEl.style.opacity = '1'; });
        // ensure background height matches header if header size changes
        const header = document.getElementById('productsHeader');
        if (header) {
            // set bg height to header inner height (clamped)
            const h = Math.min(Math.max(header.clientHeight, 120), 240);
            bgEl.style.height = h + 'px';
        }
    }

    // Render products
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; padding: 3rem;">
                <h3>No products in this company</h3>
                <p>Admin can add products from the admin panel</p>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        let stockClass, stockText, stockIcon;
        if (product.stock > 10) {
            stockClass = 'in-stock';
            stockText = `In Stock (${product.stock})`;
            stockIcon = '';
        } else if (product.stock > 0) {
            stockClass = 'low-stock';
            stockText = `Low Stock (${product.stock})`;
            stockIcon = '';
        } else {
            stockClass = 'out-of-stock';
            stockText = 'Out of Stock';
            stockIcon = '';
        }

        const imageContent = product.image
            ? `<img src="${product.image}" alt="${product.name}">`
            : '<div class="product-placeholder"></div>';

        card.innerHTML = `
            <div class="product-image">${imageContent}</div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <div class="product-meta">
                    <span class="price">NPR ${product.price.toLocaleString()}</span>
                    <span class="weight">${product.gram}</span>
                </div>
                <div class="stock-badge ${stockClass}">
                    <span>${stockText}</span>
                </div>
                <button class="add-to-cart-btn" ${product.stock === 0 ? 'disabled' : ''}>
                    Add to Cart
                </button>
            </div>
        `;

        const addBtn = card.querySelector('.add-to-cart-btn');
        addBtn.addEventListener('click', () => Cart.addToCart(product, company));
        grid.appendChild(card);
    });
}