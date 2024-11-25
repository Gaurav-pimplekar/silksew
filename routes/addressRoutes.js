const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/protect');  // Assuming the protect middleware checks the JWT token
const User = require('../models/user');

// Add a new address to the user's address list
router.post('/address', protect, async (req, res) => {
  try {
    const { street, city, state, postalCode, country, isPrimary } = req.body;
    
    const user = await User.findById(req.user.id);  // Get the logged-in user

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if the user already has a primary address, and if so, set `isPrimary` to false for the rest of the addresses
    if (isPrimary) {
      user.addresses.forEach(address => {
        address.isPrimary = false;
      });
    }

    const newAddress = {
      street,
      city,
      state,
      postalCode,
      country,
      isPrimary,
    };

    user.addresses.push(newAddress);  // Add the new address to the user's address list
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      data: newAddress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error adding address.',
      error: error.message,
    });
  }
});

// Update an existing address
router.put('/address/:addressId', protect, async (req, res) => {
  try {
    const { street, city, state, postalCode, country, isPrimary } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const address = user.addresses.id(req.params.addressId);  // Find address by ID
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    // Update address details
    address.street = street;
    address.city = city;
    address.state = state;
    address.postalCode = postalCode;
    address.country = country;
    address.isPrimary = isPrimary;

    // If the address is marked as primary, set other addresses as non-primary
    if (isPrimary) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== address._id.toString()) {
          addr.isPrimary = false;
        }
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      data: address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating address.',
      error: error.message,
    });
  }
});

// Delete an address
router.delete('/address/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const address = user.addresses.id(req.params.addressId);  // Find address by ID
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    address.remove();  // Remove the address from the user's list
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting address.',
      error: error.message,
    });
  }
});

// Get all addresses for a user
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Addresses retrieved successfully.',
      data: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving addresses.',
      error: error.message,
    });
  }
});

module.exports = router;
