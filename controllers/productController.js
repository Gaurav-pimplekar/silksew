const Product = require('../models/product');
const User = require('../models/user');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { productName, description, price, brandName, color, size, imageUrl, category } = req.body;

    // Validate category (make sure it's within the available options)
    const validCategories = ['Shirts', 'Pants', 'Jackets', 'Accessories'];  // Add more as needed
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category.',
      });
    }

    const product = new Product({
      productName,
      description,
      price,
      brandName,
      color,
      size,  // size is now an array
      imageUrl,
      category,  // Include category in the product data
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating product.',
      error: error.message,
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully.',
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching products.',
      error: error.message,
    });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully.',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching product.',
      error: error.message,
    });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { productName, description, price, brandName, color, size, imageUrl, category } = req.body;

    // Validate category (make sure it's within the available options)
    const validCategories = ['Shirts', 'Pants', 'Jackets', 'Accessories', "Others"];  // Add more as needed
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category.',
      });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, {
      productName,
      description,
      price,
      brandName,
      color,
      size,  // size is now an array
      imageUrl,
      category,  // Update category
    }, { new: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating product.',
      error: error.message,
    });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting product.',
      error: error.message,
    });
  }
};

// Add a review to a product
exports.addReview = async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;

    // Ensure the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found.',
      });
    }

    const review = {
      userId,
      rating,
      comment,
      createdAt: new Date(),
    };

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Add review to product and save it
    product.reviews.push(review);
    await product.save();

    // Recalculate the average rating
    product.calculateAverageRating();
    console.log(product);
    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Review added successfully.',
      data: review,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Error adding review.',
      error: error.message,
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    review.rating = rating;
    review.comment = comment;
    review.updatedAt = Date.now();

    await product.save();
    product.calculateAverageRating();
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating review.',
      error: error.message,
    });
  }
};

// Delete a review
// Delete a review
exports.deleteReview = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }
  
      // Find the review by its ID
      const review = product.reviews.id(req.params.reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found.',
        });
      }
  
      // Remove the review from the reviews array
      product.reviews.pull(req.params.reviewId);
      
      // Save the product after removing the review
      await product.save();
  
      // Recalculate the average rating
      product.calculateAverageRating();
      await product.save();
  
      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully.',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting review.',
        error: error.message,
      });
    }
  };
  