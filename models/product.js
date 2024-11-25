const mongoose = require('mongoose');

// Schema for Reviews
const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Main Product Schema
const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    brandName: {
        type: String,
        required: true,
        trim: true,
    },
    color: {
        type: String,
        required: true,
        trim: true,
    },
    size: {
        type: [String], // An array of strings
        enum: ['S', 'M', 'L', 'XL', 'XXL'], // Define possible size options
        required: true,
    },
    imageUrl: {
        type: String,
        required: true, // Assuming every product must have an image URL
    },
    category: {
        type: String,
        required: true,
        enum: ['Shirts', 'Pants', 'Jackets', 'Accessories', "Others"], // Subcategories of Men's Clothing
    },
    reviews: [reviewSchema], // Array of reviews
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    // Dynamically calculated average rating from reviews
    averageRating: {
        type: Number,
        default: 1,
        min: 0,
        max: 5,
    },
});

// Update updatedAt field on each update
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Method to calculate the average rating based on the reviews
productSchema.methods.calculateAverageRating = function () {
    if (this.reviews.length > 0) {
        const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.averageRating = totalRating / this.reviews.length;
    } else {
        this.averageRating = 1; // Set to 1 if no reviews exist
    }

    console.log(this.averageRating);
};

// Hook to update average rating before saving the product
productSchema.pre('save', function (next) {
    this.calculateAverageRating();
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
