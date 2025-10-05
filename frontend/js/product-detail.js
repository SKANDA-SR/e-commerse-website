// Product Detail Page Module
const productDetail = {
    currentProduct: null,
    selectedQuantity: 1,

    // Initialize product detail page
    init: () => {
        const productId = utils.getUrlParams().id;
        
        if (!productId) {
            utils.showToast('Product not found', 'error');
            window.location.href = 'index.html';
            return;
        }

        productDetail.loadProduct(productId);
    },

    // Load product data
    loadProduct: async (productId) => {
        try {
            utils.showLoading();
            
            const product = await products.fetchProduct(productId);
            productDetail.currentProduct = product;
            
            productDetail.renderProduct(product);
            productDetail.updateBreadcrumb(product.name);
            productDetail.loadRelatedProducts(product.category, product._id);
            
        } catch (error) {
            console.error('Error loading product:', error);
            productDetail.showError('Product not found or unavailable');
        } finally {
            utils.hideLoading();
        }
    },

    // Render product details
    renderProduct: (product) => {
        const container = document.getElementById('product-detail-container');
        if (!container) return;

        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
        const discountPercentage = hasDiscount ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        
        const stockStatus = product.stock > 0 ? 'in-stock' : 'out-of-stock';
        const stockText = product.stock > 0 ? 
            `In Stock (${product.stock} available)` : 
            'Out of Stock';

        // Get main image and thumbnails
        const images = product.images && product.images.length > 0 ? 
            product.images : 
            [{ url: utils.getPlaceholderImage(400, 400, product.category) }];
        
        const mainImage = images[0].url;
        const thumbnails = images.map((img, index) => 
            `<img src="${img.url}" alt="${product.name}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                 onclick="productDetail.changeMainImage('${img.url}', ${index})">`
        ).join('');

        container.innerHTML = `
            <div class="product-detail-images">
                <img src="${mainImage}" alt="${product.name}" class="main-image" id="main-image">
                <div class="thumbnail-images">
                    ${thumbnails}
                </div>
            </div>
            
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                
                <div class="product-detail-price">
                    ${hasDiscount ? `<span class="original-price">${utils.formatCurrency(product.originalPrice)}</span>` : ''}
                    ${utils.formatCurrency(product.price)}
                    ${hasDiscount ? `<span class="discount">-${discountPercentage}% OFF</span>` : ''}
                </div>
                
                <div class="product-stock ${stockStatus}">
                    <i class="fas ${stockStatus === 'in-stock' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    ${stockText}
                </div>
                
                <div class="product-description">
                    <p>${product.description}</p>
                </div>
                
                ${product.specifications ? productDetail.renderSpecifications(product.specifications) : ''}
                
                <div class="product-actions">
                    <div class="quantity-selector">
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" class="quantity-input" 
                               value="1" min="1" max="${product.stock}" 
                               ${product.stock === 0 ? 'disabled' : ''}>
                    </div>
                    
                    <button class="btn btn-primary btn-full add-to-cart-btn" 
                            ${product.stock === 0 ? 'disabled' : ''}
                            onclick="productDetail.addToCart()">
                        <i class="fas fa-cart-plus"></i>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
                
                <div class="product-meta">
                    <p><strong>Category:</strong> ${product.category}</p>
                    ${product.brand ? `<p><strong>Brand:</strong> ${product.brand}</p>` : ''}
                    ${product.weight ? `<p><strong>Weight:</strong> ${product.weight} lbs</p>` : ''}
                    ${product.tags && product.tags.length > 0 ? `<p><strong>Tags:</strong> ${product.tags.join(', ')}</p>` : ''}
                </div>
            </div>
        `;

        // Initialize quantity selector
        productDetail.initQuantitySelector();
    },

    // Render product specifications
    renderSpecifications: (specifications) => {
        if (!specifications || Object.keys(specifications).length === 0) {
            return '';
        }

        const specsHtml = Object.entries(specifications).map(([key, value]) => 
            `<tr><td><strong>${key}:</strong></td><td>${value}</td></tr>`
        ).join('');

        return `
            <div class="product-specifications">
                <h3>Specifications</h3>
                <table class="specs-table">
                    ${specsHtml}
                </table>
            </div>
        `;
    },

    // Initialize quantity selector
    initQuantitySelector: () => {
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            quantityInput.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                const max = parseInt(e.target.max);
                
                if (value < 1) {
                    e.target.value = 1;
                } else if (value > max) {
                    e.target.value = max;
                }
                
                productDetail.selectedQuantity = parseInt(e.target.value);
            });
        }
    },

    // Change main image
    changeMainImage: (imageUrl, index) => {
        const mainImage = document.getElementById('main-image');
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        if (mainImage) {
            mainImage.src = imageUrl;
        }
        
        // Update active thumbnail
        thumbnails.forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    },

    // Add product to cart
    addToCart: () => {
        if (!productDetail.currentProduct) {
            utils.showToast('Product not loaded', 'error');
            return;
        }

        if (productDetail.currentProduct.stock === 0) {
            utils.showToast('Product is out of stock', 'error');
            return;
        }

        const quantityInput = document.getElementById('quantity');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

        if (quantity > productDetail.currentProduct.stock) {
            utils.showToast(`Only ${productDetail.currentProduct.stock} items available`, 'error');
            return;
        }

        cart.addItem(productDetail.currentProduct, quantity);
        
        // Update button temporarily
        const addButton = document.querySelector('.add-to-cart-btn');
        if (addButton && !addButton.disabled) {
            const originalText = addButton.innerHTML;
            addButton.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
            addButton.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                addButton.innerHTML = originalText;
                addButton.style.backgroundColor = '';
            }, 2000);
        }
    },

    // Update breadcrumb
    updateBreadcrumb: (productName) => {
        const breadcrumbSpan = document.getElementById('product-breadcrumb');
        if (breadcrumbSpan) {
            breadcrumbSpan.textContent = utils.truncateText(productName, 30);
        }

        // Update page title
        document.title = `${productName} - E-Shop`;
    },

    // Load related products
    loadRelatedProducts: async (category, currentProductId) => {
        try {
            const data = await products.fetchProducts({
                filters: { category: category },
                limit: 4
            });
            
            // Filter out current product and limit to 4
            const relatedProducts = data.products
                .filter(product => product._id !== currentProductId)
                .slice(0, 4);
            
            productDetail.renderRelatedProducts(relatedProducts);
            
        } catch (error) {
            console.error('Error loading related products:', error);
        }
    },

    // Render related products
    renderRelatedProducts: (relatedProducts) => {
        const container = document.getElementById('related-products');
        if (!container || relatedProducts.length === 0) {
            const section = document.querySelector('.related-products');
            if (section) section.style.display = 'none';
            return;
        }

        container.innerHTML = relatedProducts.map(product => 
            products.renderProductCard(product)
        ).join('');
    },

    // Show error message
    showError: (message) => {
        const container = document.getElementById('product-detail-container');
        if (container) {
            container.innerHTML = `
                <div class="error-container text-center">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #dc3545; margin-bottom: 1rem;"></i>
                    <h2>Product Not Found</h2>
                    <p>${message}</p>
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-arrow-left"></i> Back to Shop
                    </a>
                </div>
            `;
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on product detail page
    if (window.location.pathname.includes('product.html')) {
        productDetail.init();
    }
});

// Export for use in HTML
window.productDetail = productDetail;