const express = require('express');
const router = express.Router();

const { placeOrder, getOrderById, getAllOrders, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../utils/jwt');

// Place a new order
router.post('/order',protect, placeOrder);

// Get order by ID
router.get('/order/:id',protect, getOrderById);

// Get all orders for the authenticated user
router.get('/orders',protect, getAllOrders);

// Update order status (e.g., shipped, delivered, etc.)
router.put('/order/status',protect, updateOrderStatus);

// Cancel an order
router.put('/order/cancel',protect, cancelOrder);

module.exports = router;
