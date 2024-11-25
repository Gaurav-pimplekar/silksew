const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming the user is authenticated and the ID is in req.user
    const { shippingAddress, paymentMethod } = req.body;

    // Fetch the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Cannot place an order.',
      });
    }

    // Prepare the order items
    const orderItems = cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    }));

    // Create a new order
    const newOrder = new Order({
      userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'Pending',
    });

    // Save the order
    await newOrder.save();

    // Clear the user's cart after placing the order
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error placing order.',
      error: error.message,
    });
  }
};


exports.getOrderById = async (req, res) => {
    try {
      const orderId = req.params.id;
      const userId = req.user._id; // Assuming the user is authenticated
  
      // Find the order by ID and ensure the user owns it
      const order = await Order.findOne({ _id: orderId, userId }).populate('items.productId');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or user not authorized.',
        });
      }
  
      return res.status(200).json({
        success: true,
        order: order,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching order details.',
        error: error.message,
      });
    }
  };

  

  exports.getAllOrders = async (req, res) => {
    try {
      const userId = req.user._id; // Assuming the user is authenticated
  
      // Find all orders for the user
      const orders = await Order.find({ userId }).populate('items.productId').sort('-orderDate');
      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No orders found for this user.',
        });
      }
  
      return res.status(200).json({
        success: true,
        orders: orders,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching orders.',
        error: error.message,
      });
    }
  };

  

  exports.updateOrderStatus = async (req, res) => {
    try {
      const { orderId, status } = req.body;
      const userId = req.user._id; // Assuming the user is authenticated
  
      if (!orderId || !status) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and status are required.',
        });
      }
  
      // Validate the status
      const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status.',
        });
      }
  
      // Find the order by ID and ensure the user owns it
      const order = await Order.findOne({ _id: orderId, userId });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or user not authorized.',
        });
      }
  
      // Update the status
      order.status = status;
  
      if (status === 'Shipped') {
        order.deliveryDate = new Date(); // Set delivery date when shipped
      }
  
      await order.save();
  
      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully.',
        order: order,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating order status.',
        error: error.message,
      });
    }
  };

  
  exports.cancelOrder = async (req, res) => {
    try {
      const { orderId } = req.body;
      const userId = req.user._id; // Assuming the user is authenticated
  
      // Find the order by ID and ensure the user owns it
      const order = await Order.findOne({ _id: orderId, userId });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or user not authorized.',
        });
      }
  
      // Check if the order is already shipped or delivered, which cannot be cancelled
      if (order.status === 'Shipped' || order.status === 'Delivered') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a shipped or delivered order.',
        });
      }
  
      // Set status to 'Cancelled'
      order.status = 'Cancelled';
      await order.save();
  
      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully.',
        order: order,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error cancelling order.',
        error: error.message,
      });
    }
  };
  