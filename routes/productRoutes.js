const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../utils/jwt');

// Product Routes
router.post('/products',protect, admin, productController.createProduct); // Create product
router.get('/products', productController.getAllProducts); // Get all products
router.get('/products/:id', productController.getProductById); // Get single product by ID
router.put('/products/:id',protect, admin, productController.updateProduct); // Update product by ID
router.delete('/products/:id',protect, admin, productController.deleteProduct); // Delete product by ID

// Review Routes
router.post('/products/:id/reviews',protect, productController.addReview); // Add review
router.put('/products/:id/reviews/:reviewId',protect, productController.updateReview); // Update review
router.delete('/products/:id/reviews/:reviewId',protect, productController.deleteReview); // Delete review

module.exports = router;
