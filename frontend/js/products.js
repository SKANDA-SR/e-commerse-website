// Products Module
const products = {
    currentPage: 1,
    currentFilters: {
        search: '',
        category: 'all',
        sortBy: 'newest',
        minPrice: '',
        maxPrice: ''
    },

    // Fetch products from API
    fetchProducts: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams({
                page: params.page || 1,
                limit: params.limit || APP_CONFIG.ITEMS_PER_PAGE,
                ...params.filters
            });

            const response = await fetch(`${API_ENDPOINTS.PRODUCTS}?${queryParams}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch products error:', error);
            throw error;
        }
    },

    // Fetch featured products
    fetchFeaturedProducts: async () => {
        try {
            const response = await fetch(API_ENDPOINTS.FEATURED_PRODUCTS);
            
            if (!response.ok) {
                throw new Error('Failed to fetch featured products');
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch featured products error:', error);
            throw error;
        }
    },

    // Fetch product categories
    fetchCategories: async () => {
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCT_CATEGORIES);
            
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch categories error:', error);
            throw error;
        }
    },

    // Fetch single product
    fetchProduct: async (productId) => {
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(productId));
            
            if (!response.ok) {
                throw new Error('Product not found');
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch product error:', error);
            throw error;
        }
    },

    // Render product card
    renderProductCard: (product) => {
        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
        const discountPercentage = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        const imageUrl = product.images[0]?.url || utils.getPlaceholderImage(280, 250, product.category);

        return `
            <div class="product-card" onclick="window.location.href='product.html?id=${product._id}'">
                <img src="${imageUrl}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${utils.truncateText(product.description, 80)}</p>
                    <div class="product-price">
                        ${hasDiscount ? `<span class="original-price">${utils.formatCurrency(product.originalPrice)}</span>` : ''}
                        ${utils.formatCurrency(product.price)}
                        ${hasDiscount ? `<span class="discount">-${discountPercentage}%</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn" data-product-id="${product._id}" onclick="event.stopPropagation()">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
    },

    // Render products grid
    renderProducts: async (containerId, params = {}) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            utils.showLoading();
            const data = await products.fetchProducts(params);
            
            container.innerHTML = data.products.map(product => products.renderProductCard(product)).join('');
            
            // Update pagination if it exists
            if (data.totalPages > 1) {
                products.renderPagination(data);
            }
            
        } catch (error) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-600">Failed to load products. Please try again.</p>
                    <button onclick="products.renderProducts('${containerId}', ${JSON.stringify(params)})" class="btn btn-primary mt-4">
                        Retry
                    </button>
                </div>
            `;
        } finally {
            utils.hideLoading();
        }
    },

    // Render featured products
    renderFeaturedProducts: async (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const featuredProducts = await products.fetchFeaturedProducts();
            container.innerHTML = featuredProducts.map(product => products.renderProductCard(product)).join('');
        } catch (error) {
            container.innerHTML = '<p class="text-center">Failed to load featured products.</p>';
        }
    },

    // Render pagination
    renderPagination: (data) => {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        const { currentPage, totalPages, hasPrevPage, hasNextPage } = data;
        let paginationHTML = '';

        // Previous button
        if (hasPrevPage) {
            paginationHTML += `<button onclick="products.goToPage(${currentPage - 1})" class="pagination-btn">Previous</button>`;
        }

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button onclick="products.goToPage(1)" class="pagination-btn">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span>...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button onclick="products.goToPage(${i})" class="pagination-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span>...</span>`;
            }
            paginationHTML += `<button onclick="products.goToPage(${totalPages})" class="pagination-btn">${totalPages}</button>`;
        }

        // Next button
        if (hasNextPage) {
            paginationHTML += `<button onclick="products.goToPage(${currentPage + 1})" class="pagination-btn">Next</button>`;
        }

        paginationContainer.innerHTML = paginationHTML;
    },

    // Go to specific page
    goToPage: (page) => {
        products.currentPage = page;
        products.renderProducts('products-grid', {
            page: page,
            filters: products.currentFilters
        });
    },

    // Apply filters
    applyFilters: () => {
        products.currentPage = 1;
        products.renderProducts('products-grid', {
            page: 1,
            filters: products.currentFilters
        });
    },

    // Load categories into filter dropdown
    loadCategories: async () => {
        const categorySelect = document.getElementById('category-filter');
        if (!categorySelect) return;

        try {
            const categories = await products.fetchCategories();
            
            // Clear existing options except "All Categories"
            const allOption = categorySelect.querySelector('option[value="all"]');
            categorySelect.innerHTML = '';
            categorySelect.appendChild(allOption);

            // Add category options
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    },

    // Initialize products module
    init: () => {
        // Load categories
        products.loadCategories();

        // Set up search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput && searchBtn) {
            const debouncedSearch = utils.debounce(() => {
                products.currentFilters.search = searchInput.value.trim();
                products.applyFilters();
            }, 500);

            searchInput.addEventListener('input', debouncedSearch);
            searchBtn.addEventListener('click', () => {
                products.currentFilters.search = searchInput.value.trim();
                products.applyFilters();
            });

            // Handle Enter key in search
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    products.currentFilters.search = searchInput.value.trim();
                    products.applyFilters();
                }
            });
        }

        // Set up category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                products.currentFilters.category = categoryFilter.value;
                products.applyFilters();
            });
        }

        // Set up sort filter
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', () => {
                products.currentFilters.sortBy = sortFilter.value;
                products.applyFilters();
            });
        }

        // Set up price range filter
        const minPriceInput = document.getElementById('min-price');
        const maxPriceInput = document.getElementById('max-price');
        const priceFilterBtn = document.getElementById('price-filter-btn');
        
        if (minPriceInput && maxPriceInput && priceFilterBtn) {
            priceFilterBtn.addEventListener('click', () => {
                products.currentFilters.minPrice = minPriceInput.value;
                products.currentFilters.maxPrice = maxPriceInput.value;
                products.applyFilters();
            });

            // Handle Enter key in price inputs
            [minPriceInput, maxPriceInput].forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        products.currentFilters.minPrice = minPriceInput.value;
                        products.currentFilters.maxPrice = maxPriceInput.value;
                        products.applyFilters();
                    }
                });
            });
        }

        // Load initial products
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            products.renderProducts('products-grid');
        }

        // Load featured products
        const featuredGrid = document.getElementById('featured-products');
        if (featuredGrid) {
            products.renderFeaturedProducts('featured-products');
        }

        // Add event listeners for "Add to Cart" buttons
        document.addEventListener('click', async (e) => {
            if (e.target.matches('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                e.stopPropagation();
                
                const btn = e.target.matches('.add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');
                const productId = btn.getAttribute('data-product-id');
                
                if (productId) {
                    try {
                        // Fetch full product data
                        const product = await products.fetchProduct(productId);
                        cart.addItem(product, 1);
                    } catch (error) {
                        utils.showToast('Error adding product to cart', 'error');
                    }
                }
            }
        });
    }
};

// Initialize products when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    products.init();
});