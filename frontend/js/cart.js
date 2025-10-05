// Shopping Cart Module
const cart = {
    // Get cart items from localStorage
    getCartItems: () => {
        const cartStr = localStorage.getItem(STORAGE_KEYS.CART);
        return cartStr ? JSON.parse(cartStr) : [];
    },

    // Save cart items to localStorage
    saveCartItems: (items) => {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
        cart.updateCartCount();
    },

    // Add item to cart
    addItem: (product, quantity = 1) => {
        let cartItems = cart.getCartItems();
        const existingItemIndex = cartItems.findIndex(item => item._id === product._id);

        if (existingItemIndex > -1) {
            // Item already exists, update quantity
            cartItems[existingItemIndex].quantity += quantity;
        } else {
            // New item, add to cart
            cartItems.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0]?.url || utils.getPlaceholderImage(100, 100),
                quantity: quantity,
                stock: product.stock
            });
        }

        cart.saveCartItems(cartItems);
        utils.showToast(`${product.name} added to cart`, 'success');
        return cartItems;
    },

    // Remove item from cart
    removeItem: (productId) => {
        let cartItems = cart.getCartItems();
        const itemIndex = cartItems.findIndex(item => item._id === productId);
        
        if (itemIndex > -1) {
            const removedItem = cartItems.splice(itemIndex, 1)[0];
            cart.saveCartItems(cartItems);
            utils.showToast(`${removedItem.name} removed from cart`, 'info');
            return cartItems;
        }
        return cartItems;
    },

    // Update item quantity
    updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
            return cart.removeItem(productId);
        }

        let cartItems = cart.getCartItems();
        const itemIndex = cartItems.findIndex(item => item._id === productId);
        
        if (itemIndex > -1) {
            cartItems[itemIndex].quantity = quantity;
            cart.saveCartItems(cartItems);
            return cartItems;
        }
        return cartItems;
    },

    // Clear entire cart
    clearCart: () => {
        localStorage.removeItem(STORAGE_KEYS.CART);
        cart.updateCartCount();
    },

    // Get total number of items in cart
    getTotalItems: () => {
        const cartItems = cart.getCartItems();
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    },

    // Get cart subtotal
    getSubtotal: () => {
        const cartItems = cart.getCartItems();
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Calculate tax
    getTax: () => {
        return cart.getSubtotal() * APP_CONFIG.TAX_RATE;
    },

    // Calculate shipping
    getShipping: () => {
        const subtotal = cart.getSubtotal();
        return subtotal >= APP_CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : APP_CONFIG.SHIPPING_COST;
    },

    // Get cart total
    getTotal: () => {
        return cart.getSubtotal() + cart.getTax() + cart.getShipping();
    },

    // Update cart count in navigation
    updateCartCount: () => {
        const cartCountElements = document.querySelectorAll('#cart-count');
        const totalItems = cart.getTotalItems();
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    },

    // Get cart summary object
    getSummary: () => {
        return {
            items: cart.getCartItems(),
            itemCount: cart.getTotalItems(),
            subtotal: cart.getSubtotal(),
            tax: cart.getTax(),
            shipping: cart.getShipping(),
            total: cart.getTotal()
        };
    },

    // Check if item is in cart
    isInCart: (productId) => {
        const cartItems = cart.getCartItems();
        return cartItems.some(item => item._id === productId);
    },

    // Get item quantity in cart
    getItemQuantity: (productId) => {
        const cartItems = cart.getCartItems();
        const item = cartItems.find(item => item._id === productId);
        return item ? item.quantity : 0;
    },

    // Render cart items for cart page
    renderCartItems: (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cartItems = cart.getCartItems();
        const cartContainer = document.getElementById('cart-container');
        const emptyCart = document.getElementById('empty-cart');

        if (cartItems.length === 0) {
            cartContainer.style.display = 'none';
            emptyCart.style.display = 'block';
            return;
        }

        cartContainer.style.display = 'grid';
        emptyCart.style.display = 'none';

        container.innerHTML = cartItems.map(item => `
            <div class="cart-item" data-id="${item._id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${utils.formatCurrency(item.price)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item._id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item._id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">
                    ${utils.formatCurrency(item.price * item.quantity)}
                </div>
                <button class="remove-item-btn" onclick="cart.removeItem('${item._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        cart.updateCartSummary();
    },

    // Update cart summary display
    updateCartSummary: () => {
        const summary = cart.getSummary();
        
        const elements = {
            subtotal: document.querySelectorAll('#cart-subtotal, #checkout-subtotal'),
            tax: document.querySelectorAll('#cart-tax, #checkout-tax'),
            shipping: document.querySelectorAll('#cart-shipping, #checkout-shipping'),
            total: document.querySelectorAll('#cart-total, #checkout-total')
        };

        elements.subtotal.forEach(el => el.textContent = utils.formatCurrency(summary.subtotal));
        elements.tax.forEach(el => el.textContent = utils.formatCurrency(summary.tax));
        elements.shipping.forEach(el => el.textContent = utils.formatCurrency(summary.shipping));
        elements.total.forEach(el => el.textContent = utils.formatCurrency(summary.total));
    },

    // Render order items for checkout
    renderCheckoutItems: (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cartItems = cart.getCartItems();
        
        container.innerHTML = cartItems.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}" class="order-item-image">
                <div class="order-item-info">
                    <h5>${item.name}</h5>
                    <small>Qty: ${item.quantity} × ${utils.formatCurrency(item.price)}</small>
                </div>
                <div class="order-item-total">
                    ${utils.formatCurrency(item.price * item.quantity)}
                </div>
            </div>
        `).join('');

        cart.updateCartSummary();
    },

    // Validate cart items against current stock
    validateCart: async () => {
        const cartItems = cart.getCartItems();
        const updatedItems = [];
        let hasChanges = false;

        for (let item of cartItems) {
            try {
                const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(item._id));
                if (response.ok) {
                    const product = await response.json();
                    
                    // Check if product is still available
                    if (!product.isActive || product.stock === 0) {
                        utils.showToast(`${item.name} is no longer available and was removed from cart`, 'warning');
                        hasChanges = true;
                        continue;
                    }
                    
                    // Check if quantity exceeds stock
                    if (item.quantity > product.stock) {
                        utils.showToast(`${item.name} quantity reduced to available stock (${product.stock})`, 'warning');
                        item.quantity = product.stock;
                        hasChanges = true;
                    }
                    
                    // Update price if changed
                    if (item.price !== product.price) {
                        item.price = product.price;
                        hasChanges = true;
                    }
                    
                    updatedItems.push(item);
                } else {
                    // Product not found
                    utils.showToast(`${item.name} is no longer available and was removed from cart`, 'warning');
                    hasChanges = true;
                }
            } catch (error) {
                console.error(`Error validating product ${item._id}:`, error);
                updatedItems.push(item); // Keep item if validation fails
            }
        }

        if (hasChanges) {
            cart.saveCartItems(updatedItems);
        }

        return updatedItems;
    },

    // Initialize cart module
    init: () => {
        // Update cart count on page load
        cart.updateCartCount();

        // Add event listeners for cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                const btn = e.target.matches('.add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');
                const productId = btn.getAttribute('data-product-id');
                const quantity = parseInt(btn.getAttribute('data-quantity') || '1');
                
                if (productId) {
                    // Get product data from the button's parent element or fetch from API
                    const productCard = btn.closest('.product-card');
                    if (productCard) {
                        const product = {
                            _id: productId,
                            name: productCard.querySelector('.product-name').textContent,
                            price: parseFloat(productCard.querySelector('.product-price').textContent.replace(/[^0-9.]/g, '')),
                            images: [{ url: productCard.querySelector('.product-image').src }],
                            stock: 100 // Default stock, should be fetched from API in real implementation
                        };
                        cart.addItem(product, quantity);
                    }
                }
            }
        });
    }
};

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    cart.init();
});