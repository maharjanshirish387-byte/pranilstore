// ==================== SHOPPING CART MANAGEMENT ====================

const Cart = {
    items: [],

    // Add item to cart
    addToCart(product, company) {
        this.items.push({
            ...product,
            companyName: company.name
        });
        this.updateUI();
        showNotification(`${product.name} added to cart! 🛒`, 'success');
    },

    // Remove item from cart
    removeFromCart(index) {
        const removed = this.items.splice(index, 1);
        this.updateUI();
        showNotification(`${removed[0].name} removed from cart`, 'success');
    },

    // Calculate total
    calculateTotal() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    },

    // Update cart UI
    updateUI() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');

        // Update count
        document.getElementById('cartCount').textContent = this.items.length;

        // Show/hide footer
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-state">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="32" cy="32" r="24"/>
                        <path d="M24 40h16M24 32h16M24 24h8"/>
                    </svg>
                    <p>Your cart is empty</p>
                    <span>Browse our products and add items to your cart</span>
                </div>
            `;
            cartFooter.style.display = 'none';
        } else {
            cartFooter.style.display = 'block';

            // Render items
            cartItemsContainer.innerHTML = this.items.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <span class="cart-item-icon">${item.image || '📦'}</span>
                        <div class="cart-item-details">
                            <strong>${item.name}</strong>
                            <small>${item.companyName}</small>
                            <div class="cart-item-price">NPR ${item.price.toLocaleString()}</div>
                        </div>
                    </div>
                    <button class="remove-btn" onclick="Cart.removeFromCart(${index})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            `).join('');

            // Update total
            document.getElementById('totalAmount').textContent = `NPR ${this.calculateTotal().toLocaleString()}`;
            document.getElementById('totalAmountFinal').textContent = `NPR ${this.calculateTotal().toLocaleString()}`;
        }
    },

    // Toggle cart sidebar
    async toggleCart() {
        const sidebar = document.getElementById('checkoutSidebar');
        if (sidebar.style.display === 'flex') {
            sidebar.style.display = 'none';
        } else {
            sidebar.style.display = 'flex';

            // Auto-fill if logged in
            if (StorageManager.isCustomerLoggedIn()) {
                const customer = await StorageManager.getCurrentUser();
                if (customer) {
                    document.getElementById('customerName').value = customer.name;
                    document.getElementById('customerPhone').value = customer.phone;
                    document.getElementById('customerLocation').value = customer.location;
                    document.getElementById('customerPan').value = customer.pan || '';
                }
            }
        }
    },

    // Checkout
    async checkout() {
        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();
        const location = document.getElementById('customerLocation').value.trim();
        const pan = document.getElementById('customerPan').value.trim();
        const checkoutBtn = document.querySelector('.checkout-btn');

        if (!name || !phone || !location) {
            showNotification('Please fill all required fields', 'error');
            return;
        }

        if (this.items.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }

        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Processing...';

        const currentUser = await StorageManager.getCurrentUser();
        const customerId = currentUser ? currentUser.customerId : null;

        const order = {
            orderId: StorageManager.generateOrderId(),
            customerId: customerId,
            customer: {
                name,
                phone,
                location,
                pan: pan || 'N/A'
            },
            items: this.items,
            total: this.calculateTotal(),
            date: new Date().toISOString(),
            timestamp: Date.now(),
            status: 'completed'
        };

        await StorageManager.saveOrder(order);

        // Generate receipt text
        const receipt = this.generateReceipt(order);

        // Try to send to office printer via backend; fall back to browser print
        try {
            const printUrl = (window.APP_CONFIG && window.APP_CONFIG.printApiUrl) || '/api/print-order';
            const resp = await fetch(printUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order })
            });

            if (resp.ok) {
                showNotification('Order sent to printer', 'success');
            } else {
                console.warn('Server print failed, falling back to browser print');
                this.printReceipt(receipt);
            }
        } catch (e) {
            console.warn('Could not reach print server, using browser print', e);
            this.printReceipt(receipt);
        }

        // Clear cart
        this.items = [];
        this.updateUI();

        if (!currentUser) {
            document.getElementById('customerName').value = '';
            document.getElementById('customerPhone').value = '';
            document.getElementById('customerLocation').value = '';
            document.getElementById('customerPan').value = '';
        }

        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Complete Purchase';
        
        showNotification('Order placed successfully!', 'success');

        setTimeout(() => {
            this.toggleCart();
            showCompanies();
        }, 2000);
    },

    // Generate receipt
    generateReceipt(order) {
        const date = new Date(order.date).toLocaleString();

        let receipt = `
╔═══════════════════════════════════════╗
           📦 ORDER RECEIPT
╚═══════════════════════════════════════╝

Order ID: ${order.orderId}
${order.customerId ? `Customer ID: ${order.customerId}` : ''}

👤 CUSTOMER DETAILS:
─────────────────────────────────────────
Name:     ${order.customer.name}
Phone:    ${order.customer.phone}
Location: ${order.customer.location}`;

        if (order.customer.pan !== 'N/A') {
            receipt += `\nPAN:      ${order.customer.pan}`;
        }

        receipt += `

📅 DATE: ${date}

═════════════════════════════════════════
           📋 ITEMS ORDERED
═════════════════════════════════════════

`;

        order.items.forEach((item, index) => {
            receipt += `${index + 1}. ${item.name}
   🏢 Company: ${item.companyName}
   ⚖️  Weight:  ${item.gram}
   💰 Price:   NPR ${item.price.toLocaleString()}

`;
        });

        receipt += `═════════════════════════════════════════
💵 TOTAL: NPR ${order.total.toLocaleString()}
═════════════════════════════════════════

          ✨ Thank you for shopping! ✨
╚═══════════════════════════════════════╝
        `;

        return receipt;
    },

    // Print receipt
    printReceipt(receipt) {
        const printWindow = window.open('', '', 'width=600,height=700');
        printWindow.document.write(`
            <html>
            <head>
                <title>Order Receipt</title>
                <style>
                    body {
                        font-family: 'Courier New', monospace;
                        padding: 20px;
                        white-space: pre-wrap;
                        background: #f5f7fa;
                    }
                    @media print {
                        body { 
                            padding: 0;
                            background: white;
                        }
                    }
                </style>
            </head>
            <body>${receipt}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
};