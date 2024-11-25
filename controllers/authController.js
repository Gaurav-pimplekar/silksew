const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.js');
const dotenv = require('dotenv');

dotenv.config();

// Helper function to send a token response
const sendTokenResponse = (user, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(200).json({
    message: 'Authentication successful',
    status: 200,
    success: true,
    data: { token },
  });
};

// Register a new user/admin
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'User already exists',
        status: 400,
        success: false,
        data: null,
      });
    }

    const user = new User({ name, email, password, role });
    await user.save();
    sendTokenResponse(user, res);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 500,
      success: false,
      data: null,
    });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials',
        status: 400,
        success: false,
        data: null,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials',
        status: 400,
        success: false,
        data: null,
      });
    }

    sendTokenResponse(user, res);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 500,
      success: false,
      data: null,
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: 404,
        success: false,
        data: null,
      });
    }

    // Create reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    await user.save();

    res.status(200).json({
      message: `Password reset token generated successfully. Use this token to reset your password: ${resetToken}`,
      status: 200,
      success: true,
      data: { resetToken },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 500,
      success: false,
      data: null,
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired token',
        status: 400,
        success: false,
        data: null,
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, res);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 500,
      success: false,
      data: null,
    });
  }
};
