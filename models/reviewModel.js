const mongoose = require('mongoose');
const Product = require('./productModel');
const randomDate = require('../utils/randomDate');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Review must contain a rating'],
    },
    recommends: {
      type: Boolean,
      default: true,
    },
    incentivized: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      default: randomDate(),
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ensure only one combination of product and user
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// using static method, group reviews by product property. For each group, sum up quantity properties & calc avg
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        reviewsQty: { $sum: 1 },
        reviewsAvg: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length) {
    await Product.findByIdAndUpdate(productId, {
      reviews_quantity: stats[0].reviewsQty,
      reviews_average: stats[0].reviewsAvg,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      reviews_quantity: 0,
      reviews_average: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.product);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // need access to the product to update, but can't just use 'this'
  // as a workaround, execute the query ('this')
  // review doc is NOT updated yet, hence the subsequent post middleware
  this.r = await this.findOne();

  next();
});

// once the review has been updated, call the calcAverageRating function to update the stats
// since the review needs to be passed from pre to post middleware, it was stored in 'this'
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
