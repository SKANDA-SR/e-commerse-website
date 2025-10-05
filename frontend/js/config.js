// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Endpoints
const API_ENDPOINTS = {
    // User endpoints
    USER_REGISTER: `${API_BASE_URL}/users/register`,
    USER_LOGIN: `${API_BASE_URL}/users/login`,
    USER_PROFILE: `${API_BASE_URL}/users/profile`,
    
    // Product endpoints
    PRODUCTS: `${API_BASE_URL}/products`,
    PRODUCT_BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
    FEATURED_PRODUCTS: `${API_BASE_URL}/products/featured`,
    PRODUCT_CATEGORIES: `${API_BASE_URL}/products/categories`,
    
    // Order endpoints
    ORDERS: `${API_BASE_URL}/orders`,
    ORDER_BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
    MY_ORDERS: `${API_BASE_URL}/orders/myorders`,
    ORDER_PAY: (id) => `${API_BASE_URL}/orders/${id}/pay`,
    ORDER_CANCEL: (id) => `${API_BASE_URL}/orders/${id}/cancel`
};

// Application Settings
const APP_CONFIG = {
    ITEMS_PER_PAGE: 12,
    TAX_RATE: 0.08,
    FREE_SHIPPING_THRESHOLD: 100,
    SHIPPING_COST: 10
};

// Local Storage Keys
const STORAGE_KEYS = {
    USER: 'ecommerce_user',
    TOKEN: 'ecommerce_token',
    CART: 'ecommerce_cart'
};

// Utility Functions
const utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Truncate text
    truncateText: (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // Show loading spinner
    showLoading: () => {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.style.display = 'flex';
    },

    // Hide loading spinner
    hideLoading: () => {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.style.display = 'none';
    },

    // Show toast message
    showToast: (message, type = 'info') => {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add toast styles if not already present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.innerHTML = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 4px;
                    color: white;
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                }
                .toast-success { background: #28a745; }
                .toast-error { background: #dc3545; }
                .toast-info { background: #17a2b8; }
                .toast-warning { background: #ffc107; color: #333; }
                .toast button {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 10px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    },

    // Get URL parameters
    getUrlParams: () => {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (let [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Generate category-specific placeholder image URL
    getPlaceholderImage: (width = 300, height = 300, category = 'products') => {
        const categoryImages = {
            'electronics': `https://images.unsplash.com/photo-1498049794561-7780e7231661?w=${width}&h=${height}&fit=crop`,
            'clothing': `https://images.unsplash.com/photo-1445205170230-053b83016050?w=${width}&h=${height}&fit=crop`,
            'books': `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=${width}&h=${height}&fit=crop`,
            'home & garden': `https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=${width}&h=${height}&fit=crop`,
            'sports': `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${width}&h=${height}&fit=crop`,
            'beauty': `https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=${width}&h=${height}&fit=crop`,
            'toys': `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=${width}&h=${height}&fit=crop`,
            'food': `https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=${width}&h=${height}&fit=crop`
        };
        
        const categoryKey = category.toLowerCase();
        return categoryImages[categoryKey] || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=${width}&h=${height}&fit=crop`;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_ENDPOINTS, APP_CONFIG, STORAGE_KEYS, utils };
}