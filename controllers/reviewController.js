const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createReview = factory.createOne(Review, {
  path: 'product',
  select: 'name sku',
});

exports.getReview = factory.getOne(Review);

exports.getAllReviews = factory.getAll(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.getMyReviews = factory.getMine(Review, false, {
  path: 'product',
  select: 'name sku brand image_main',
});

exports.setProductUserIds = catchAsync(async (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;

  const product = await Product.findById(req.body.product);

  if (!product) {
    return next(new AppError(`Unable to find a product with that ID`, 403));
  }

  next();
});

exports.checkIfAuthor = async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError(`Unable to find a review with that ID`, 403));
  }

  if (req.user.role !== 'admin') {
    if (review.user.id !== req.user.id)
      return next(new AppError(`You cannot edit someone else's review`, 403));
  }

  next();
};
