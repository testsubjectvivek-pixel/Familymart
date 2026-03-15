require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const connectDB = require('../config/db');

connectDB();

const adminUser = {
  email: 'admin@familymart.com',
  password: 'password123',
  role: 'admin'
};

const categories = [
  { name: 'Fruits & Vegetables', description: 'Fresh produce' },
  { name: 'Dairy & Eggs', description: 'Milk, cheese, eggs' },
  { name: 'Beverages', description: 'Soft drinks, juices' },
  { name: 'Snacks', description: 'Chips, biscuits, chocolates' },
  { name: 'Personal Care', description: 'Toiletries, hygiene' },
  { name: 'Household', description: 'Cleaning supplies' }
];

const products = [
  {
    name: 'Apple',
    description: 'Fresh red apples',
    price: 120,
    category: 'Fruits & Vegetables',
    imageUrl: 'https://example.com/apple.jpg',
    stock: 100
  },
  {
    name: 'Banana',
    description: 'Ripe yellow bananas',
    price: 80,
    category: 'Fruits & Vegetables',
    imageUrl: 'https://example.com/banana.jpg',
    stock: 150
  },
  {
    name: 'Milk',
    description: 'Fresh cow milk',
    price: 50,
    category: 'Dairy & Eggs',
    imageUrl: 'https://example.com/milk.jpg',
    stock: 200
  },
  {
    name: 'Bread',
    description: 'Whole wheat bread',
    price: 40,
    category: 'Snacks',
    imageUrl: 'https://example.com/bread.jpg',
    stock: 80
  },
  {
    name: 'Toothpaste',
    description: 'Mint flavored toothpaste',
    price: 60,
    category: 'Personal Care',
    imageUrl: 'https://example.com/toothpaste.jpg',
    stock: 120
  },
  {
    name: 'Detergent',
    description: 'Washing powder',
    price: 100,
    category: 'Household',
    imageUrl: 'https://example.com/detergent.jpg',
    stock: 90
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    // Create admin user
    const admin = await User.create(adminUser);
    console.log('Admin user created:', admin.email);

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created:', createdCategories.length);

    // Create products
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    const productsWithCategoryIds = products.map(product => ({
      ...product,
      category: categoryMap[product.category]
    }));

    const createdProducts = await Product.insertMany(productsWithCategoryIds);
    console.log('Products created:', createdProducts.length);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();