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

    // Handle login 
    async login() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const submitBtn = document.querySelector('#loginForm .auth-submit-btn');

        if (!email || !password) {
            showNotification('Please fill all fields', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';

        try {
            const result = await StorageManager.loginCustomer(email, password);
            
            if (!result.success) {
                showNotification(result.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
                return;
            }

            // Store user
            sessionStorage.setItem('current_user', JSON.stringify(result.customer));

            this.currentUser = result.customer;
            showNotification(`Welcome back, ${result.customer.name}!`, 'success');
            this.closeAuthModal();
            this.updateUIForLoggedInUser(result.customer);
        } catch (e) {
            showNotification('Login failed: ' + e.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
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
        const submitBtn = document.querySelector('#registerForm .auth-submit-btn');

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

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        try {
            const result = await StorageManager.registerCustomer({ name, email, phone, location, pan, password });
            
            if (!result.success) {
                showNotification(result.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
                return;
            }

            // Auto-login after registration
            const loginResult = await StorageManager.loginCustomer(email, password);
            if (loginResult.success) {
                this.currentUser = loginResult.customer;
                showNotification('Registration successful! You are now logged in.', 'success');
                this.updateUIForLoggedInUser(loginResult.customer);
                this.closeAuthModal();
            }
        } catch (e) {
            showNotification('Registration failed: ' + e.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
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
    async showDashboard() {
        const customer = await StorageManager.getCurrentUser();
        if (!customer) {
            showNotification('Please login first', 'error');
            return;
        }

        document.getElementById('customerDashboard').classList.add('active');
        await this.loadDashboardData();
    },

    // Close dashboard
    closeDashboard() {
        document.getElementById('customerDashboard').classList.remove('active');
    },

    // Load dashboard data
    async loadDashboardData() {
        const customer = await StorageManager.getCurrentUser();
        if (!customer) return;

        const stats = await StorageManager.getCustomerStats(customer.customerId);
        const orders = await StorageManager.getOrdersByCustomer(customer.customerId);

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
    async showEditProfile() {
        const customer = await StorageManager.getCurrentUser();
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
    async saveProfile() {
        const customer = await StorageManager.getCurrentUser();
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

        const result = await StorageManager.updateCustomerProfile(customer.customerId, updates);

        if (result.success) {
            showNotification('Profile updated successfully!', 'success');
            this.closeEditProfile();

            const updatedCustomer = await StorageManager.getCurrentUser();
            this.updateUIForLoggedInUser(updatedCustomer);
            await this.loadDashboardData();
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
    async changePassword() {
        const customer = await StorageManager.getCurrentUser();
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

        const result = await StorageManager.changePassword(customer.customerId, oldPassword, newPassword);

        if (result.success) {
            showNotification('Password changed successfully!', 'success');
            this.closeChangePassword();
        } else {
            showNotification(result.message, 'error');
        }
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

    // Password strength checker
    checkPasswordStrength(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        if (!strengthFill || !strengthText) return;

        let score = 0;
        if (password.length >= 6)  score++;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const levels = [
            { label: '',         color: 'transparent', width: '0%'   },
            { label: 'Weak',     color: '#ef4444',     width: '25%'  },
            { label: 'Fair',     color: '#f97316',     width: '50%'  },
            { label: 'Good',     color: '#eab308',     width: '75%'  },
            { label: 'Strong',   color: '#22c55e',     width: '90%'  },
            { label: 'Very Strong', color: '#16a34a',  width: '100%' },
        ];
        const level = levels[Math.min(score, 5)];
        strengthFill.style.width = level.width;
        strengthFill.style.background = level.color;
        strengthText.textContent = level.label;
        strengthText.style.color = level.color;
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