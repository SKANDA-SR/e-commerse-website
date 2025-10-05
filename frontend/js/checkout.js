// Checkout Page Module
const checkout = {
    // Initialize checkout page
    init: () => {
        // Require authentication
        if (!auth.requireAuth()) {
            return;
        }

        // Check if cart has items
        const cartItems = cart.getCartItems();
        if (cartItems.length === 0) {
            utils.showToast('Your cart is empty', 'error');
            window.location.href = 'cart.html';
            return;
        }

        checkout.renderOrderSummary();
        checkout.initForm();
        checkout.loadUserData();
    },

    // Render order summary
    renderOrderSummary: () => {
        cart.renderCheckoutItems('checkout-items');
        cart.updateCartSummary();
    },

    // Initialize checkout form
    initForm: () => {
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', checkout.handleSubmit);
        }

        // Payment method validation
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', checkout.validatePaymentMethod);
        });
    },

    // Load user data into form
    loadUserData: async () => {
        try {
            const userProfile = await auth.getProfile();
            
            // Populate address fields if available
            if (userProfile.address) {
                const { address } = userProfile;
                
                document.getElementById('street').value = address.street || '';
                document.getElementById('city').value = address.city || '';
                document.getElementById('state').value = address.state || '';
                document.getElementById('zipCode').value = address.zipCode || '';
                document.getElementById('country').value = address.country || 'United States';
            }
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },

    // Validate payment method
    validatePaymentMethod: () => {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        
        if (!selectedMethod) {
            utils.showToast('Please select a payment method', 'error');
            return false;
        }
        
        return true;
    },

    // Validate shipping address
    validateShippingAddress: () => {
        const requiredFields = ['street', 'city', 'state', 'zipCode', 'country'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                isValid = false;
                if (field) {
                    field.style.borderColor = '#dc3545';
                }
            } else if (field) {
                field.style.borderColor = '#ddd';
            }
        });
        
        if (!isValid) {
            utils.showToast('Please fill in all shipping address fields', 'error');
        }
        
        return isValid;
    },

    // Handle form submission
    handleSubmit: async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!checkout.validateShippingAddress() || !checkout.validatePaymentMethod()) {
            return;
        }
        
        try {
            checkout.setLoading(true);
            
            // Get form data
            const formData = new FormData(e.target);
            
            // Prepare order data
            const orderData = {
                orderItems: cart.getCartItems().map(item => ({
                    product: item._id,
                    quantity: item.quantity
                })),
                shippingAddress: {
                    street: formData.get('street'),
                    city: formData.get('city'),
                    state: formData.get('state'),
                    zipCode: formData.get('zipCode'),
                    country: formData.get('country')
                },
                paymentMethod: formData.get('paymentMethod'),
                orderNotes: formData.get('orderNotes') || ''
            };
            
            // Submit order
            const order = await checkout.submitOrder(orderData);
            
            if (order) {
                // Clear cart
                cart.clearCart();
                
                // Show success message
                utils.showToast('Order placed successfully!', 'success');
                
                // Redirect to order confirmation (for now, redirect to orders page)
                setTimeout(() => {
                    window.location.href = `order-success.html?orderId=${order._id}`;
                }, 2000);
            }
            
        } catch (error) {
            utils.showToast(error.message || 'Error placing order', 'error');
        } finally {
            checkout.setLoading(false);
        }
    },

    // Submit order to backend
    submitOrder: async (orderData) => {
        try {
            const response = await auth.apiRequest(API_ENDPOINTS.ORDERS, {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to place order');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Submit order error:', error);
            throw error;
        }
    },

    // Set loading state
    setLoading: (isLoading) => {
        const submitBtn = document.getElementById('place-order-btn');
        const form = document.getElementById('checkout-form');
        
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.innerHTML = isLoading ? 
                '<i class="fas fa-spinner fa-spin"></i> Processing...' : 
                '<i class="fas fa-check"></i> Place Order';
        }
        
        if (form) {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.disabled = isLoading;
            });
        }
        
        if (isLoading) {
            utils.showLoading();
        } else {
            utils.hideLoading();
        }
    },

    // Process payment (simplified for demo)
    processPayment: async (paymentMethod, amount) => {
        // This is a simplified payment processing
        // In a real application, you would integrate with payment providers like Stripe, PayPal, etc.
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'payment_' + Date.now(),
                    status: 'completed',
                    update_time: new Date().toISOString(),
                    payer: {
                        email_address: auth.getCurrentUser().email
                    }
                });
            }, 2000);
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        checkout.init();
    }
});