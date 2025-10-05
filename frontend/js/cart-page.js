// Cart Page Module
const cartPage = {
    // Initialize cart page
    init: () => {
        cartPage.renderCart();
        cartPage.initEventListeners();
    },

    // Render cart items and summary
    renderCart: () => {
        cart.renderCartItems('cart-items');
        cartPage.updateSummary();
    },

    // Update cart summary
    updateSummary: () => {
        cart.updateCartSummary();
        cartPage.updateCheckoutButton();
    },

    // Update checkout button state
    updateCheckoutButton: () => {
        const checkoutBtn = document.getElementById('checkout-btn');
        const cartItems = cart.getCartItems();
        
        if (checkoutBtn) {
            if (cartItems.length === 0) {
                checkoutBtn.disabled = true;
                checkoutBtn.textContent = 'Cart is Empty';
            } else {
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Proceed to Checkout';
            }
        }
    },

    // Initialize event listeners
    initEventListeners: () => {
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', cartPage.handleCheckout);
        }

        // Listen for cart updates
        document.addEventListener('cartUpdated', () => {
            cartPage.renderCart();
        });

        // Quantity change handlers (delegated event listeners)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.quantity-btn')) {
                e.preventDefault();
                setTimeout(() => {
                    cartPage.updateSummary();
                }, 100);
            }
            
            if (e.target.matches('.remove-item-btn') || e.target.closest('.remove-item-btn')) {
                e.preventDefault();
                setTimeout(() => {
                    cartPage.renderCart();
                }, 100);
            }
        });
    },

    // Handle checkout button click
    handleCheckout: async (e) => {
        e.preventDefault();
        
        // Check if user is logged in
        if (!auth.isAuthenticated()) {
            utils.showToast('Please login to proceed with checkout', 'warning');
            window.location.href = 'auth.html?redirect=checkout.html';
            return;
        }

        // Check if cart is not empty
        const cartItems = cart.getCartItems();
        if (cartItems.length === 0) {
            utils.showToast('Your cart is empty', 'error');
            return;
        }

        try {
            utils.showLoading();
            
            // Validate cart items before checkout
            await cart.validateCart();
            
            // Redirect to checkout page
            window.location.href = 'checkout.html';
            
        } catch (error) {
            utils.showToast('Error validating cart. Please try again.', 'error');
        } finally {
            utils.hideLoading();
        }
    },

    // Clear entire cart
    clearCart: () => {
        if (confirm('Are you sure you want to clear your entire cart?')) {
            cart.clearCart();
            cartPage.renderCart();
            utils.showToast('Cart cleared', 'info');
        }
    },

    // Continue shopping
    continueShopping: () => {
        window.location.href = 'index.html#products';
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on cart page
    if (window.location.pathname.includes('cart.html')) {
        cartPage.init();
    }
});

// Export for use in HTML
window.cartPage = cartPage;