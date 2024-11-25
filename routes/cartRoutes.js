const express = require('express');
const router = express.Router();

const { addToCart, removeFromCart, updateCartItemQuantity, getCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../utils/jwt');

// Add product to cart
router.post('/cart',protect, addToCart);

// Remove product from cart
router.delete('/cart',protect, removeFromCart);

// Update product quantity in cart
router.put('/cart',protect, updateCartItemQuantity);

// Get cart details
router.get('/cart',protect, getCart);

// Clear cart
router.delete('/cart/clear',protect, clearCart);

module.exports = router;
