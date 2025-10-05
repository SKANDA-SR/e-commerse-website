const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Sample data
const sampleUsers = [
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'United States'
        },
        phone: '+1 (555) 123-4567'
    },
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
    }
];

const sampleProducts = [
    {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
        price: 99.99,
        originalPrice: 149.99,
        category: 'Electronics',
        brand: 'AudioTech',
        images: [
            { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', alt: 'Wireless Headphones' }
        ],
        stock: 50,
        isFeatured: true,
        specifications: {
            'Battery Life': '30 hours',
            'Connectivity': 'Bluetooth 5.0',
            'Noise Cancellation': 'Yes',
            'Weight': '250g'
        },
        tags: ['wireless', 'bluetooth', 'noise-cancellation']
    },
    {
        name: 'Smartphone - Latest Model',
        description: 'Flagship smartphone with 128GB storage, triple camera system, and fast charging.',
        price: 699.99,
        originalPrice: 799.99,
        category: 'Electronics',
        brand: 'TechCorp',
        images: [
            { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop', alt: 'Smartphone' }
        ],
        stock: 25,
        isFeatured: true,
        specifications: {
            'Storage': '128GB',
            'RAM': '8GB',
            'Camera': 'Triple 48MP',
            'Battery': '4000mAh'
        },
        tags: ['smartphone', 'mobile', 'camera']
    },
    {
        name: 'Casual Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt available in multiple colors and sizes.',
        price: 19.99,
        category: 'Clothing',
        brand: 'FashionWear',
        images: [
            { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop', alt: 'Cotton T-Shirt' }
        ],
        stock: 100,
        specifications: {
            'Material': '100% Cotton',
            'Fit': 'Regular',
            'Care': 'Machine washable'
        },
        tags: ['cotton', 'casual', 'comfortable']
    },
    {
        name: 'Programming Book - JavaScript Guide',
        description: 'Complete guide to modern JavaScript programming with practical examples.',
        price: 29.99,
        category: 'Books',
        brand: 'TechBooks',
        images: [
            { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop', alt: 'JavaScript Book' }
        ],
        stock: 30,
        specifications: {
            'Pages': '450',
            'Language': 'English',
            'Level': 'Intermediate'
        },
        tags: ['javascript', 'programming', 'web-development']
    },
    {
        name: 'Ergonomic Office Chair',
        description: 'Comfortable office chair with lumbar support and adjustable height.',
        price: 199.99,
        originalPrice: 299.99,
        category: 'Home & Garden',
        brand: 'ComfortSeating',
        images: [
            { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop', alt: 'Office Chair' }
        ],
        stock: 15,
        isFeatured: true,
        specifications: {
            'Material': 'Mesh and Fabric',
            'Weight Capacity': '300 lbs',
            'Adjustable Height': 'Yes'
        },
        tags: ['office', 'ergonomic', 'comfortable']
    },
    {
        name: 'Fitness Tracker Watch',
        description: 'Smart fitness tracker with heart rate monitor and GPS.',
        price: 79.99,
        category: 'Sports',
        brand: 'FitTech',
        images: [
            { url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&h=300&fit=crop', alt: 'Fitness Tracker' }
        ],
        stock: 40,
        specifications: {
            'Battery Life': '7 days',
            'Water Resistance': 'IPX7',
            'Heart Rate Monitor': 'Yes',
            'GPS': 'Built-in'
        },
        tags: ['fitness', 'health', 'wearable']
    },
    {
        name: 'Skincare Set - Anti-Aging',
        description: 'Complete skincare routine set with cleanser, serum, and moisturizer.',
        price: 89.99,
        category: 'Beauty',
        brand: 'GlowSkin',
        images: [
            { url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop', alt: 'Skincare Set' }
        ],
        stock: 20,
        specifications: {
            'Skin Type': 'All types',
            'Age Group': '25+',
            'Ingredients': 'Natural'
        },
        tags: ['skincare', 'anti-aging', 'beauty']
    },
    {
        name: 'Building Blocks Set',
        description: 'Educational building blocks set for kids aged 3-8 years.',
        price: 34.99,
        category: 'Toys',
        brand: 'PlayTime',
        images: [
            { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', alt: 'Building Blocks' }
        ],
        stock: 60,
        specifications: {
            'Age Range': '3-8 years',
            'Pieces': '200',
            'Material': 'BPA-free plastic'
        },
        tags: ['educational', 'kids', 'building']
    }
];

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        console.log('Cleared existing data');

        // Create users
        console.log('Creating users...');
        const createdUsers = await User.insertMany(sampleUsers);
        console.log(`Created ${createdUsers.length} users`);

        // Create products
        console.log('Creating products...');
        const createdProducts = await Product.insertMany(sampleProducts);
        console.log(`Created ${createdProducts.length} products`);

        console.log('Database seeding completed successfully!');
        console.log('\n--- Sample Accounts ---');
        console.log('User Account:');
        console.log('Email: john@example.com');
        console.log('Password: password123');
        console.log('\nAdmin Account:');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
        
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run seeder
connectDB().then(() => {
    seedDatabase();
});