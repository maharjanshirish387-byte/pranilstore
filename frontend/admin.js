// ==================== PROFESSIONAL ADMIN PANEL ====================

const Admin = {
    currentEditingProduct: null,
    currentEditingCompany: null,
    productImageBase64: null,
    isLoggedIn: false,
    currentView: 'overview', // overview, companies, products, orders

    // Show admin panel
    showAdminPanel() {
        if (!this.isLoggedIn && !StorageManager.isAdminLoggedIn()) {
            this.showAdminLoginModal();
            return;
        }
        
        const panel = document.getElementById('adminPanel');
        panel.classList.add('active');
        this.renderAdminHeader();
        this.showView('overview');
    },

    // Show admin login modal
    showAdminLoginModal() {
        document.getElementById('adminLoginModal').classList.add('active');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminLoginError').classList.remove('visible');
    },

    // Close admin login modal
    closeAdminLoginModal() {
        document.getElementById('adminLoginModal').classList.remove('active');
    },

    // Admin login
    login() {
        const password = document.getElementById('adminPassword').value;
        const errorEl = document.getElementById('adminLoginError');
        
        if (password === StorageManager.ADMIN_PASSWORD) {
            this.isLoggedIn = true;
            StorageManager.setAdminLoggedIn(true);
            this.closeAdminLoginModal();
            showNotification('Admin access granted', 'success');
            
            const panel = document.getElementById('adminPanel');
            panel.classList.add('active');
            this.renderAdminHeader();
            this.showView('overview');
        } else {
            errorEl.textContent = 'Incorrect password. Please try again.';
            errorEl.classList.add('visible');
            document.getElementById('adminPassword').value = '';
        }
    },

    // Render Admin Header with Navigation
    renderAdminHeader() {
        const header = document.querySelector('.admin-header');
        header.innerHTML = `
            <h2>Administration Panel</h2>
            <nav class="admin-nav">
                <button class="admin-nav-btn active" data-view="overview" onclick="Admin.showView('overview')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                    </svg>
                    Overview
                </button>
                <button class="admin-nav-btn" data-view="companies" onclick="Admin.showView('companies')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    Companies
                </button>
                <button class="admin-nav-btn" data-view="products" onclick="Admin.showView('products')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                    Products
                </button>
                <button class="admin-nav-btn" data-view="orders" onclick="Admin.showView('orders')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Orders
                </button>
            </nav>
            <button class="modal-close-btn" onclick="Admin.closeAdminPanel()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;
    },

    // Close admin panel
    closeAdminPanel() {
        document.getElementById('adminPanel').classList.remove('active');
    },

    // Show specific view
    async showView(viewName) {
        this.currentView = viewName;
        const content = document.getElementById('adminContent');
        
        // Update navigation active state
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-view="' + viewName + '"]')?.classList.add('active');

        switch(viewName) {
            case 'overview':
                await this.renderOverview(content);
                break;
            case 'companies':
                await this.renderCompaniesManagement(content);
                break;
            case 'products':
                await this.renderProductsManagement(content);
                break;
            case 'orders':
                await this.renderOrdersManagement(content);
                break;
        }
    },

    // Render Overview Dashboard
    async renderOverview(content) {
        const stats = await StorageManager.getStats();
        const companies = await StorageManager.getCompanies();
        const allProducts = companies.flatMap(c => c.products);
        
        const lowStockProducts = allProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
        const outOfStockProducts = allProducts.filter(p => p.stock === 0).length;
        
        content.innerHTML = `
            <div class="admin-overview">
                <div class="overview-header">
                    <h2>Dashboard Overview</h2>
                    <p class="overview-subtitle">Monitor your business performance at a glance</p>
                </div>

                <div class="stats-grid-admin">
                    <div class="stat-card-admin">
                        <div class="stat-icon-admin companies-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7"/>
                                <rect x="14" y="3" width="7" height="7"/>
                                <rect x="3" y="14" width="7" height="7"/>
                                <rect x="14" y="14" width="7" height="7"/>
                            </svg>
                        </div>
                        <div class="stat-info-admin">
                            <div class="stat-value-admin">${stats.companies}</div>
                            <div class="stat-label-admin">Total Companies</div>
                        </div>
                    </div>

                    <div class="stat-card-admin">
                        <div class="stat-icon-admin products-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                        </div>
                        <div class="stat-info-admin">
                            <div class="stat-value-admin">${stats.products}</div>
                            <div class="stat-label-admin">Total Products</div>
                        </div>
                    </div>

                    <div class="stat-card-admin">
                        <div class="stat-icon-admin orders-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                        </div>
                        <div class="stat-info-admin">
                            <div class="stat-value-admin">${stats.orders}</div>
                            <div class="stat-label-admin">Total Orders</div>
                        </div>
                    </div>

                    <div class="stat-card-admin">
                        <div class="stat-icon-admin revenue-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </div>
                        <div class="stat-info-admin">
                            <div class="stat-value-admin">NPR ${stats.revenue.toLocaleString()}</div>
                            <div class="stat-label-admin">Total Revenue</div>
                        </div>
                    </div>
                </div>

                <div class="alerts-section">
                    <h3>Inventory Alerts</h3>
                    <div class="alerts-grid">
                        <div class="alert-card ${lowStockProducts > 0 ? 'warning' : 'success'}">
                            <div class="alert-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                            </div>
                            <div class="alert-info">
                                <div class="alert-value">${lowStockProducts}</div>
                                <div class="alert-label">Low Stock Items</div>
                                <p class="alert-description">Products with stock between 1-10 units</p>
                            </div>
                        </div>

                        <div class="alert-card ${outOfStockProducts > 0 ? 'danger' : 'success'}">
                            <div class="alert-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                            </div>
                            <div class="alert-info">
                                <div class="alert-value">${outOfStockProducts}</div>
                                <div class="alert-label">Out of Stock</div>
                                <p class="alert-description">Products that need immediate restocking</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="quick-actions">
                    <h3>Quick Actions</h3>
                    <div class="actions-grid">
                        <button class="action-card" onclick="Admin.showView('companies')">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            </svg>
                            <span>Manage Companies</span>
                        </button>
                        <button class="action-card" onclick="Admin.showView('products')">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            <span>Add Product</span>
                        </button>
                        <button class="action-card" onclick="Admin.showView('orders')">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 11 12 14 22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                            <span>View Orders</span>
                        </button>
                        <button class="action-card" onclick="Admin.showView('products')">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="8.5" cy="7" r="4"/>
                                <polyline points="17 11 19 13 23 9"/>
                            </svg>
                            <span>Update Inventory</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Render Companies Management
    async renderCompaniesManagement(content) {
        const companies = await StorageManager.getCompanies();

        content.innerHTML = `
            <div class="admin-section">
                <div class="section-header">
                    <div>
                        <h2>Companies Management</h2>
                        <p class="section-subtitle">Manage your partner companies and their information</p>
                    </div>
                    <button class="btn-primary" onclick="Admin.showAddCompanyModal()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add Company
                    </button>
                </div>

                <div class="companies-list">
                    ${companies.length === 0 
                        ? '<p style="padding: 2rem; text-align: center; color: #666;">No companies yet. Add your first company!</p>' 
                        : companies.map(company => {
                            return `<div class="company-item-admin">
                                <div class="company-item-header">
                                    <img src="${company.logo}" alt="${company.name}" class="company-item-logo" onerror="this.src='https://placehold.co/100x100/000/fff?text=${company.name.charAt(0)}'">
                                    <div class="company-item-info">
                                        <h3>${company.name}</h3>
                                        <p>${company.products.length} Products</p>
                                    </div>
                                    <div class="company-item-actions">
                                        <button class="btn-icon" onclick="Admin.showEditCompanyModal(${company.id})" title="Edit Company">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                        </button>
                                        <button class="btn-icon" onclick="Admin.deleteCompany(${company.id})" title="Delete Company">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>`;
                        }).join('')}
                </div>
            </div>
        `;
    },

    // Render Products Management
    async renderProductsManagement(content) {
        const companies = await StorageManager.getCompanies();

        content.innerHTML = `
            <div class="admin-section">
                <div class="section-header">
                    <div>
                        <h2>Products Management</h2>
                        <p class="section-subtitle">Add, edit, and manage product inventory</p>
                    </div>
                </div>

                ${companies.map(company => `
                    <div class="products-company-section">
                        <div class="company-section-header">
                            <div class="company-section-bg" style="background-image: url('${company.headerImage || company.image || company.logo || ''}');" aria-hidden="true"></div>
                            <div class="company-section-title">
                                <img src="${company.logo}" alt="${company.name}">
                                <h3>${company.name}</h3>
                            </div>
                            <button class="btn-secondary" onclick="Admin.showAddProductModal(${company.id})">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Add Product
                            </button>
                        </div>

                        <div class="products-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Weight</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${company.products.length === 0 ? `
                                        <tr>
                                            <td colspan="6" class="empty-state-table">No products yet. Add your first product to get started.</td>
                                        </tr>
                                    ` : company.products.map(product => `
                                        <tr>
                                            <td>
                                                <div class="product-cell">
                                                    ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image-small">` : ''}
                                                    <span class="product-name-cell">${product.name}</span>
                                                </div>
                                            </td>
                                            <td>${product.gram}</td>
                                            <td><strong>NPR ${product.price.toLocaleString()}</strong></td>
                                            <td><span class="stock-badge-small">${product.stock}</span></td>
                                            <td>
                                                <span class="status-badge ${product.stock > 10 ? 'status-success' : product.stock > 0 ? 'status-warning' : 'status-danger'}">
                                                    ${product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td>
                                                <div class="table-actions">
                                                    <button class="btn-icon-small" onclick="Admin.editProduct(${company.id}, ${product.id})" title="Edit">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                        </svg>
                                                    </button>
                                                    <button class="btn-icon-small btn-danger" onclick="Admin.deleteProduct(${company.id}, ${product.id})" title="Delete">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                            <polyline points="3 6 5 6 21 6"/>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Render Orders Management
    async renderOrdersManagement(content) {
        const orders = await StorageManager.getOrders();
        
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        content.innerHTML = `
            <div class="admin-section">
                <div class="section-header">
                    <div>
                        <h2>Orders Management</h2>
                        <p class="section-subtitle">View and manage customer orders</p>
                    </div>
                </div>

                <div class="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.length === 0 ? `
                                <tr>
                                    <td colspan="5" class="empty-state-table">No orders yet</td>
                                </tr>
                            ` : orders.map(order => `
                                <tr>
                                    <td><code class="order-id-code">${order.id}</code></td>
                                    <td>
                                        <div class="customer-cell">
                                            <strong>${order.customer?.name || 'N/A'}</strong>
                                            <small>${order.customer?.phone || ''}</small>
                                        </div>
                                    </td>
                                    <td>${order.items?.length || 0} items</td>
                                    <td><strong>NPR ${parseFloat(order.total || 0).toLocaleString()}</strong></td>
                                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button class="btn-icon-small" onclick="Admin.viewOrderDetails('${order.id}')" title="View Details">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // Show Add Product Modal
    showAddProductModal(companyId) {
        this.currentEditingCompany = companyId;
        this.productImageBase64 = null;
        document.getElementById('editModal').classList.add('active');

        const modal = document.getElementById('editModal');
        modal.querySelector('h3').textContent = 'Add New Product';
        document.getElementById('editName').value = '';
        document.getElementById('editPrice').value = '';
        document.getElementById('editGram').value = '';
        document.getElementById('editStock').value = '';
        document.getElementById('editImage').value = '';

        // Reset image preview
        const preview = document.getElementById('productImagePreview');
        if (preview) {
            preview.style.display = 'none';
        }
        const fileInput = document.getElementById('editImageFile');
        if (fileInput) {
            fileInput.value = '';
        }

        // Change button behavior
        const form = modal.querySelector('.edit-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.addProduct(companyId);
        };
    },

    // Add Product
    async addProduct(companyId) {
        const product = {
            name: document.getElementById('editName').value.trim(),
            price: parseFloat(document.getElementById('editPrice').value),
            gram: document.getElementById('editGram').value.trim(),
            stock: parseInt(document.getElementById('editStock').value),
            image: this.productImageBase64 || document.getElementById('editImage').value.trim(),
            companyId: companyId
        };

        if (!product.name || !product.price || !product.gram || isNaN(product.stock)) {
            showNotification('Please fill all required fields correctly', 'error');
            return;
        }

        StorageManager.addProduct(product);

        this.productImageBase64 = null;
        this.closeEditModal();
        showNotification('Product added successfully', 'success');
        await this.showView('products');
        await renderCompanies();
    },

    // Edit Product
    async editProduct(companyId, productId) {
        const company = StorageManager.getCompanyById(companyId);
        const product = company.products.find(p => p.id === productId);

        if (!product) return;

        this.currentEditingProduct = { companyId, productId };

        document.getElementById('editName').value = product.name;
        document.getElementById('editPrice').value = product.price;
        document.getElementById('editGram').value = product.gram;
        document.getElementById('editStock').value = product.stock;
        document.getElementById('editImage').value = product.image || '';

        // Show image preview if product has an image
        if (product.image && (product.image.startsWith('data:') || product.image.startsWith('http'))) {
            const preview = document.getElementById('productImagePreview');
            const previewImg = document.getElementById('productImagePreviewImg');
            previewImg.src = product.image;
            preview.style.display = 'block';
            this.productImageBase64 = null;
        }

        const modal = document.getElementById('editModal');
        modal.querySelector('h3').textContent = 'Edit Product';
        modal.classList.add('active');

        // Change button behavior
        const form = modal.querySelector('.edit-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveEditedProduct();
        };
    },

    // Save Edited Product
    async saveEditedProduct() {
        if (!this.currentEditingProduct) return;

        const { companyId, productId } = this.currentEditingProduct;

        const updatedProduct = {
            name: document.getElementById('editName').value.trim(),
            price: parseFloat(document.getElementById('editPrice').value),
            gram: document.getElementById('editGram').value.trim(),
            stock: parseInt(document.getElementById('editStock').value),
            image: this.productImageBase64 || document.getElementById('editImage').value.trim()
        };

        if (!updatedProduct.name || !updatedProduct.price || !updatedProduct.gram || isNaN(updatedProduct.stock)) {
            showNotification('Please fill all fields correctly', 'error');
            return;
        }

        StorageManager.updateProduct(productId, updatedProduct);

        this.productImageBase64 = null;
        this.closeEditModal();
        showNotification('Product updated successfully', 'success');
        await this.showView('products');
        await renderCompanies();
    },

    // Close Edit Modal
    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
        this.currentEditingProduct = null;
        this.currentEditingCompany = null;
        this.productImageBase64 = null;
        // Reset image preview
        const preview = document.getElementById('productImagePreview');
        if (preview) {
            preview.style.display = 'none';
        }
        const fileInput = document.getElementById('editImageFile');
        if (fileInput) {
            fileInput.value = '';
        }
    },

    // Delete Product
    deleteProduct(companyId, productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        StorageManager.deleteProduct(productId);

        showNotification('Product deleted successfully', 'success');
        this.showView('products');
        renderCompanies();
    },

    // Delete Company
    async deleteCompany(companyId) {
        const company = StorageManager.getCompanyById(companyId);
        
        if (!confirm(`Are you sure you want to delete "${company.name}" and all its products? This action cannot be undone.`)) {
            return;
        }

        StorageManager.deleteCompany(companyId);

        showNotification('Company deleted successfully', 'success');
        await this.showView('companies');
        await renderCompanies();
    },

    // Show Add Company Modal
    showAddCompanyModal() {
        // Create a simple modal for adding company
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'addCompanyModal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Add New Company</h3>
                <form class="edit-form" onsubmit="event.preventDefault(); Admin.addCompany();">
                    <div class="form-group">
                        <label>Company Name</label>
                        <input type="text" id="companyName" required>
                    </div>
                    <div class="form-group">
                        <label>Logo Image</label>
                        <div class="image-upload-group">
                            <input type="file" id="companyLogo" accept="image/*" required onchange="Admin.previewCompanyLogo(event)">
                            <div id="logoPreview" class="image-preview" style="display: none;">
                                <img id="logoPreviewImg" src="" alt="Logo Preview">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Background Color</label>
                        <input type="color" id="companyBgColor" value="#000000">
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">Add Company</button>
                        <button type="button" class="btn-secondary" onclick="Admin.closeAddCompanyModal()">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.add('active');
    },

    // Preview Company Logo
    previewCompanyLogo(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('logoPreview');
                const previewImg = document.getElementById('logoPreviewImg');
                previewImg.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    },

    // Preview Edit Company Logo
    previewEditCompanyLogo(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('editLogoPreview');
                const previewImg = document.getElementById('editLogoPreviewImg');
                previewImg.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    },

    // Preview Product Image
    previewProductImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('productImagePreview');
                const previewImg = document.getElementById('productImagePreviewImg');
                previewImg.src = e.target.result;
                preview.style.display = 'block';
                // Store base64 image temporarily
                this.productImageBase64 = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    // Close Add Company Modal
    closeAddCompanyModal() {
        const modal = document.getElementById('addCompanyModal');
        if (modal) {
            modal.remove();
        }
    },

    // Show Edit Company Modal
    async showEditCompanyModal(companyId) {
        const companies = StorageManager.getCompanies();
        const company = companies.find(c => c.id === companyId);
        if (!company) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'editCompanyModal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Company</h3>
                <form class="edit-form" onsubmit="event.preventDefault(); Admin.updateCompany(${companyId});">
                    <div class="form-group">
                        <label>Company Name</label>
                        <input type="text" id="editCompanyName" value="${company.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Logo Image</label>
                        <div class="image-upload-group">
                            <input type="file" id="editCompanyLogo" accept="image/*" onchange="Admin.previewEditCompanyLogo(event)">
                            <div id="editLogoPreview" class="image-preview">
                                <img id="editLogoPreviewImg" src="${company.logo}" alt="Logo Preview">
                            </div>
                            <small style="color: var(--color-gray-500);">Leave empty to keep existing logo</small>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Background Color</label>
                        <input type="color" id="editCompanyBgColor" value="${company.bgColor}">
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">Update Company</button>
                        <button type="button" class="btn-secondary" onclick="Admin.closeEditCompanyModal()">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.add('active');
    },

    // Close Edit Company Modal
    closeEditCompanyModal() {
        const modal = document.getElementById('editCompanyModal');
        if (modal) {
            modal.remove();
        }
    },

    // Add Company
    async addCompany() {
        const nameInput = document.getElementById('companyName');
        const logoInput = document.getElementById('companyLogo');
        const bgColorInput = document.getElementById('companyBgColor');

        const name = nameInput.value.trim();
        const bgColor = bgColorInput.value;
        const logoFile = logoInput.files[0];

        if (!name || !logoFile) {
            showNotification('Please fill all required fields and upload an image', 'error');
            return;
        }

        // Convert image to base64
        const reader = new FileReader();
        reader.onload = async (e) => {
            const logoBase64 = e.target.result;

            await StorageManager.addCompany({
                name: name,
                logo: logoBase64,
                bgColor: bgColor
            });

            this.closeAddCompanyModal();
            showNotification('Company added successfully', 'success');
            await this.showView('companies');
            renderCompanies();
        };
        reader.readAsDataURL(logoFile);
    },

    // Update Company
    async updateCompany(companyId) {
        const nameInput = document.getElementById('editCompanyName');
        const logoInput = document.getElementById('editCompanyLogo');
        const bgColorInput = document.getElementById('editCompanyBgColor');

        const name = nameInput.value.trim();
        const bgColor = bgColorInput.value;
        const logoFile = logoInput.files[0];

        if (!name) {
            showNotification('Please enter a company name', 'error');
            return;
        }

        let logoBase64 = null;
        if (logoFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                logoBase64 = e.target.result;
                StorageManager.updateCompany(companyId, {
                    name: name,
                    logo: logoBase64,
                    bgColor: bgColor
                });
                this.closeEditCompanyModal();
                showNotification('Company updated successfully', 'success');
                await this.showView('companies');
                await renderCompanies();
            };
            reader.readAsDataURL(logoFile);
        } else {
            StorageManager.updateCompany(companyId, {
                name: name,
                bgColor: bgColor
            });
            this.closeEditCompanyModal();
            showNotification('Company updated successfully', 'success');
            await this.showView('companies');
            await renderCompanies();
        }
    },

    // View Order Details
    viewOrderDetails(orderId) {
        const orders = StorageManager.getOrders();
        const order = orders.find(o => o.id == orderId);

        if (!order) return;

        const detailsHTML = `
            <div class="order-details-modal">
                <h3>Order Details</h3>
                <div class="order-info-grid">
                    <div class="info-row">
                        <span class="info-label">Order ID:</span>
                        <span class="info-value"><code>${order.id}</code></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Customer:</span>
                        <span class="info-value">${order.customer?.name || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Phone:</span>
                        <span class="info-value">${order.customer?.phone || ''}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Location:</span>
                        <span class="info-value">${order.customer?.location || ''}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date:</span>
                        <span class="info-value">${new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                </div>

                <h4 style="margin-top: 2rem; margin-bottom: 1rem;">Order Items</h4>
                <table class="order-items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Weight</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(order.items || []).map(item => `
                            <tr>
                                <td>${item.name || item.product_name || 'N/A'}</td>
                                <td>${item.gram || item.weight || ''}</td>
                                <td>NPR ${parseFloat(item.price || 0).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2"><strong>Total</strong></td>
                            <td><strong>NPR ${parseFloat(order.total || 0).toLocaleString()}</strong></td>
                        </tr>
                    </tfoot>
                </table>

                <div class="modal-actions" style="margin-top: 2rem;">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').classList.remove('active')">Close</button>
                </div>
            </div>
        `;

        // Create temporary modal
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay active';
        modalOverlay.innerHTML = `<div class="modal-content">${detailsHTML}</div>`;
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        };
        document.body.appendChild(modalOverlay);
    },

    // Check admin status
    checkAdminStatus() {
        if (StorageManager.isAdminLoggedIn()) {
            this.isLoggedIn = true;
        }
    }
};