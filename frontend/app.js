// ==================== MAIN APPLICATION ====================

let currentCompanyId = null;
let currentUser = null;

// Show companies view
function showCompanies() {
    document.getElementById('companyView').style.display = 'block';
    document.getElementById('productsView').style.display = 'none';
    currentCompanyId = null;
    // hide products background when returning to companies
    const bg = document.getElementById('productsBg');
    if (bg) bg.style.opacity = '0';
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await StorageManager.init();
    await renderCompanies();
    await CustomerAuth.checkAuthStatus();
    Admin.checkAdminStatus();

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
    console.log('Admin password: admin123');
});

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Render companies on page load
async function renderCompanies() {
    const companies = await StorageManager.getCompanies();
    const grid = document.getElementById('companiesGrid');
    grid.innerHTML = '';

    companies.forEach((company, index) => {
        const card = document.createElement('div');
        card.className = 'company-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.backgroundColor = company.bgColor;

        card.innerHTML = `
            <img src="${company.logo}" alt="${company.name}" class="company-logo-img">
            <h3>${company.name}</h3>
            <p>${company.products.length} Products</p>
        `;

        card.addEventListener('click', () => showProducts(company.id));
        grid.appendChild(card);
    });
}

// Show products view
async function showProducts(companyId) {
    const company = await StorageManager.getCompanyById(companyId);
    if (!company) return;

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

    company.products.forEach(product => {
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