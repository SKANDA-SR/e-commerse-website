const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// @desc    Get all products with search and filtering
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query object
    let query = { isActive: true };

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Sort options
    let sortBy = {};
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price-asc':
          sortBy = { price: 1 };
          break;
        case 'price-desc':
          sortBy = { price: -1 };
          break;
        case 'name':
          sortBy = { name: 1 };
          break;
        case 'newest':
          sortBy = { createdAt: -1 };
          break;
        case 'rating':
          sortBy = { 'rating.average': -1 };
          break;
        default:
          sortBy = { createdAt: -1 };
      }
    } else {
      sortBy = { createdAt: -1 };
    }

    // Execute query
    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      products,
      currentPage: page,
      totalPages,
      total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      originalPrice: req.body.originalPrice,
      category: req.body.category,
      brand: req.body.brand,
      images: req.body.images || [],
      stock: req.body.stock,
      specifications: req.body.specifications,
      tags: req.body.tags,
      weight: req.body.weight,
      dimensions: req.body.dimensions
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price || product.price;
      product.originalPrice = req.body.originalPrice || product.originalPrice;
      product.category = req.body.category || product.category;
      product.brand = req.body.brand || product.brand;
      product.images = req.body.images || product.images;
      product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
      product.specifications = req.body.specifications || product.specifications;
      product.tags = req.body.tags || product.tags;
      product.weight = req.body.weight || product.weight;
      product.dimensions = req.body.dimensions || product.dimensions;
      product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;
      product.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : product.isFeatured;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true }).limit(8);
    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Routes
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;