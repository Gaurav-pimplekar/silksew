const mongoose = require('mongoose');

// Order Status Enum
const orderStatus = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

// Order Item Schema
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

// Main Order Schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema], // Array of ordered items
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['CreditCard', 'PayPal', 'COD'], // Example payment methods
  },
  status: {
    type: String,
    required: true,
    enum: orderStatus,
    default: 'Pending',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
  },
});

// Pre-save hook to calculate total amount
orderSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((acc, item) => acc + item.total, 0);
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
