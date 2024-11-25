const jwt = require('jsonwebtoken');
const User = require('../models/user');  // Assuming you have a User model for verification

// Middleware to verify JWT token and check the user role
const protect = async (req, res, next) => {
  let token;

  // Check if the token is sent in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from the Authorization header (format: Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Decode the token and verify its validity
      const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Replace JWT_SECRET with your secret

      // Find the user associated with the token
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found.',
        });
      }

      // Attach user data to the request object for use in other routes
      req.user = user;

      next();  // Proceed to the next middleware or route handler
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed.',
        error: error.message,
      });
    }
  }

  // If no token is provided
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token.',
    });
  }
};

// Middleware to check if the user is an admin
const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied, admin privileges required.',
    });
  }
  next();
};

module.exports = { protect, admin };
