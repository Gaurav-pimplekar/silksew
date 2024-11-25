const Cart = require('../models/cart');
const Product = require('../models/product');

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;  // Assuming user is authenticated and their ID is in req.user

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Calculate the total price for the item
    const price = product.price;
    const total = price * quantity;

    // Find or create the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update the existing cart item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].total += total;
    } else {
      // Add new item to the cart
      cart.items.push({ productId, quantity, price, total });
    }

    // Save the cart
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to cart successfully.',
      cart: cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error adding product to cart.',
      error: error.message,
    });
  }
};


exports.removeFromCart = async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = req.user._id;
  
      // Find the user's cart
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found.',
        });
      }
  
      // Find the product in the cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in cart.',
        });
      }
  
      // Remove the item from the cart
      cart.items.splice(itemIndex, 1);
  
      // Save the cart
      await cart.save();
  
      return res.status(200).json({
        success: true,
        message: 'Product removed from cart successfully.',
        cart: cart,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error removing product from cart.',
        error: error.message,
      });
    }
  };

  
  exports.updateCartItemQuantity = async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user._id;
  
      // Find the user's cart
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found.',
        });
      }
  
      // Find the product in the cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in cart.',
        });
      }
  
      // Update the product's quantity and total price
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }
  
      const price = product.price;
      const total = price * quantity;
  
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].total = total;
  
      // Save the cart
      await cart.save();
  
      return res.status(200).json({
        success: true,
        message: 'Cart item quantity updated.',
        cart: cart,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating cart item.',
        error: error.message,
      });
    }
  };

  
  exports.getCart = async (req, res) => {
    try {
      const userId = req.user._id;
  
      // Find the user's cart
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found.',
        });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Cart retrieved successfully.',
        cart: cart,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving cart.',
        error: error.message,
      });
    }
  };

  
  exports.clearCart = async (req, res) => {
    try {
      const userId = req.user._id;
  
      // Find the user's cart
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found.',
        });
      }
  
      // Clear the cart
      cart.items = [];
  
      // Save the empty cart
      await cart.save();
  
      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully.',
        cart: cart,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error clearing cart.',
        error: error.message,
      });
    }
  };
  