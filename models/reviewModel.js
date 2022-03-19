const mongoose = require('mongoose');
const Product = require('./productModel');

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
    recommends: Boolean,
    created_at: {
      type: Date,
      default: Date.now(),
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
      reviews_average: 4.2,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.product);
});

// document middleware to update our stats whenever a review is updated or delete, not just when it's created
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // remember that we need access to the product so we can update it, but we can't just use 'this' here
  // to get around it, we will just execute the query ('this' points to the query here)
  // the .findOne() method gets the review document from the DB
  // so, the review doc is NOT updated with the new review/is not deleted yet. That's why the subsequent post middleware is necessary
  this.r = await this.findOne();

  next();
});

// then, once the review has been updated (hence the post), call the calcAverageRating function to update the stats
// since we need to pass the review itself from the pre middleware to the post middleware, we just stored it on 'this' (aka the query itself)
// this is an example of query middleware
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
