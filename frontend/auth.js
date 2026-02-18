// ==================== CUSTOMER AUTHENTICATION ====================

const CustomerAuth = {
    currentUser: null,

    // Show login modal
    showLoginModal() {
        document.getElementById('authModal').classList.add('active');
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    },

    // Show register modal
    showRegisterModal() {
        document.getElementById('authModal').classList.add('active');
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    },

    // Switch to login
    switchToLogin() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    },

    // Switch to register
    switchToRegister() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    },

    // Close auth modal
    closeAuthModal() {
        document.getElementById('authModal').classList.remove('active');
        this.clearForms();
    },

    // Clear forms
    clearForms() {
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('registerName').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPhone').value = '';
        document.getElementById('registerLocation').value = '';
        document.getElementById('registerPan').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerConfirmPassword').value = '';
    },

    // Handle login (server-backed)
    async login() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showNotification('Please fill all fields', 'error');
            return;
        }

        try {
            const apiBase = (window.APP_CONFIG && window.APP_CONFIG.apiBase) || '';
            const resp = await fetch(`${apiBase}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await resp.json();
            if (!resp.ok) {
                showNotification(data.error || 'Login failed', 'error');
                return;
            }

            // store token + user
            sessionStorage.setItem('auth_token', data.token);
            sessionStorage.setItem('current_user_id', data.customer.customerId);
            sessionStorage.setItem('current_user', JSON.stringify(data.customer));

            this.currentUser = data.customer;
            showNotification(`Welcome back, ${data.customer.name}! 🎉`, 'success');
            this.closeAuthModal();
            this.updateUIForLoggedInUser(data.customer);
        } catch (e) {
            showNotification('Login failed: ' + e.message, 'error');
        }
    },

    // Handle registration
    async register() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const phone = document.getElementById('registerPhone').value.trim();
        const location = document.getElementById('registerLocation').value.trim();
        const pan = document.getElementById('registerPan').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // Validation
        if (!name || !email || !phone || !location || !password || !confirmPassword) {
            showNotification('Please fill all required fields', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        const customerData = {
            name,
            email,
            phone,
            location,
            pan,
            password
        };

        try {
            const apiBase = (window.APP_CONFIG && window.APP_CONFIG.apiBase) || '';
            const resp = await fetch(`${apiBase}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, location, pan, password })
            });

            const data = await resp.json();
            if (!resp.ok) {
                showNotification(data.error || 'Registration failed', 'error');
                return;
            }

            // store token + user
            sessionStorage.setItem('auth_token', data.token);
            sessionStorage.setItem('current_user_id', data.customer.customerId);
            sessionStorage.setItem('current_user', JSON.stringify(data.customer));

            showNotification('✨ Registration successful! You are logged in.', 'success');
            this.updateUIForLoggedInUser(data.customer);
            this.closeAuthModal();
        } catch (e) {
            showNotification('Registration failed: ' + e.message, 'error');
        }
    },

    // Handle logout
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            StorageManager.logoutCustomer();
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('current_user');
            sessionStorage.removeItem('current_user_id');
            this.currentUser = null;
            showNotification('Logged out successfully 👋', 'success');
            this.updateUIForLoggedOutUser();
            this.closeDashboard();
        }
    },

    // Update UI for logged in user
    updateUIForLoggedInUser(customer) {
        document.getElementById('guestControls').style.display = 'none';
        document.getElementById('userControls').style.display = 'flex';
        
        document.getElementById('userAvatar').textContent = customer.name.charAt(0).toUpperCase();
        document.getElementById('userName').textContent = customer.name.split(' ')[0];

        // Pre-fill checkout form
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerLocation').value = customer.location;
        document.getElementById('customerPan').value = customer.pan || '';
    },

    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        document.getElementById('guestControls').style.display = 'flex';
        document.getElementById('userControls').style.display = 'none';

        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerLocation').value = '';
        document.getElementById('customerPan').value = '';
    },

    // Show dashboard
    showDashboard() {
        const customer = StorageManager.getCurrentUser();
        if (!customer) {
            showNotification('Please login first', 'error');
            return;
        }

        document.getElementById('customerDashboard').classList.add('active');
        this.loadDashboardData();
    },

    // Close dashboard
    closeDashboard() {
        document.getElementById('customerDashboard').classList.remove('active');
    },

    // Load dashboard data
    loadDashboardData() {
        const customer = StorageManager.getCurrentUser();
        if (!customer) return;

        const stats = StorageManager.getCustomerStats(customer.customerId);
        const orders = StorageManager.getOrdersByCustomer(customer.customerId);

        // Fill customer info
        document.getElementById('dashboardCustomerName').textContent = customer.name;
        document.getElementById('dashboardCustomerEmail').textContent = customer.email;
        document.getElementById('dashboardCustomerPhone').textContent = customer.phone;
        document.getElementById('dashboardCustomerLocation').textContent = customer.location;
        document.getElementById('dashboardCustomerPan').textContent = customer.pan || 'N/A';

        // Fill stats
        document.getElementById('dashboardTotalOrders').textContent = stats.totalOrders;
        document.getElementById('dashboardTotalSpent').textContent = `NPR ${stats.totalSpent.toLocaleString()}`;
        document.getElementById('dashboardAvgOrder').textContent = `NPR ${Math.round(stats.averageOrderValue).toLocaleString()}`;

        // Fill orders
        const ordersContainer = document.getElementById('dashboardOrders');
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No orders yet</p>';
        } else {
            ordersContainer.innerHTML = orders.slice(-10).reverse().map(order => `
                <div class="dashboard-order-card">
                    <div class="order-header">
                        <span class="order-id">Order #${order.orderId}</span>
                        <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span>${item.image} ${item.name}</span>
                                <span>NPR ${item.price.toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total">
                        <strong>Total:</strong>
                        <strong>NPR ${order.total.toLocaleString()}</strong>
                    </div>
                </div>
            `).join('');
        }
    },

    // Show edit profile modal
    showEditProfile() {
        const customer = StorageManager.getCurrentUser();
        if (!customer) return;

        document.getElementById('editProfileName').value = customer.name;
        document.getElementById('editProfilePhone').value = customer.phone;
        document.getElementById('editProfileLocation').value = customer.location;
        document.getElementById('editProfilePan').value = customer.pan || '';

        document.getElementById('editProfileModal').classList.add('active');
    },

    // Close edit profile
    closeEditProfile() {
        document.getElementById('editProfileModal').classList.remove('active');
    },

    // Save profile
    saveProfile() {
        const customer = StorageManager.getCurrentUser();
        if (!customer) return;

        const updates = {
            name: document.getElementById('editProfileName').value.trim(),
            phone: document.getElementById('editProfilePhone').value.trim(),
            location: document.getElementById('editProfileLocation').value.trim(),
            pan: document.getElementById('editProfilePan').value.trim() || 'N/A'
        };

        if (!updates.name || !updates.phone || !updates.location) {
            showNotification('Please fill all required fields', 'error');
            return;
        }

        const result = StorageManager.updateCustomerProfile(customer.customerId, updates);

        if (result.success) {
            showNotification('Profile updated successfully! ✅', 'success');
            this.closeEditProfile();

            const updatedCustomer = StorageManager.getCurrentUser();
            this.updateUIForLoggedInUser(updatedCustomer);
            this.loadDashboardData();
        } else {
            showNotification(result.message, 'error');
        }
    },

    // Show change password modal
    showChangePassword() {
        document.getElementById('changePasswordModal').classList.add('active');
    },

    // Close change password
    closeChangePassword() {
        document.getElementById('changePasswordModal').classList.remove('active');
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    },

    // Change password
    changePassword() {
        const customer = StorageManager.getCurrentUser();
        if (!customer) return;

        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            showNotification('Please fill all fields', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        const result = StorageManager.changePassword(customer.customerId, oldPassword, newPassword);

        if (result.success) {
            showNotification('Password changed successfully! 🔐', 'success');
            this.closeChangePassword();
        } else {
            showNotification(result.message, 'error');
        }
    },

    // Check auth status on page load
    async checkAuthStatus() {
        if (StorageManager.isCustomerLoggedIn()) {
            const customer = await StorageManager.getCurrentUser();
            if (customer) {
                this.currentUser = customer;
                this.updateUIForLoggedInUser(customer);
            } else {
                StorageManager.logoutCustomer();
                this.updateUIForLoggedOutUser();
            }
        } else {
            this.updateUIForLoggedOutUser();
        }
    }
};