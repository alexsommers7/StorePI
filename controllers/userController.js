const User = require('../models/userModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const factory = require('./handlerFactory');

exports.getMyWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await User.findById(req.params.id)
    .populate({
      path: 'wishlist',
      select: 'name image_main sku',
    })
    .select('wishlist');

  res.status(200).json({
    status: 'success',
    wishlist,
  });
});

exports.addProductToMyWishlist = catchAsync(async (req, res, next) => {
  if (!req.body.sku) return next(new AppError('A sku must be provided', 400));
  const { sku } = req.body;

  const product = await Product.findOne({ sku });

  if (!product)
    return next(new AppError('No product found with that sku', 400));

  const user = await User.findById(req.params.id)
    .populate({
      path: 'wishlist',
    })
    .select('wishlist');

  const skus = user.wishlist.map((item) => item.sku);
  if (skus.includes(sku)) {
    return next(new AppError('Product is Already on Wishlist', 400));
  }

  user.wishlist.push(product);

  const { wishlist } = user;

  // const wishlist = await User.findByIdAndUpdate(
  //   req.user.id,
  //   { $addToSet: { wishlist: req.body.product } },
  //   { new: true }
  // )
  //   .populate({
  //     path: 'wishlist',
  //     select: 'name image_main sku',
  //   })
  //   .select('wishlist');

  res.status(201).json({
    status: 'success',
    data: wishlist,
  });
});

exports.removeProductFromMyWishlist = catchAsync(async (req, res, next) => {
  if (!req.body.sku)
    return next(
      new AppError('Please provide a product to remove from your wishlist', 400)
    );

  const { sku } = req.body;

  const user = await User.findById(req.params.id)
    .populate({
      path: 'wishlist',
      select: 'name image_main sku',
    })
    .select('wishlist');

  const itemIndex = user.wishlist.findIndex((p) => p.sku === sku);

  if (itemIndex === -1)
    return next(new AppError('Product is not currently in wishlist', 400));

  user.wishlist.splice(itemIndex, 1);

  // user = await user.save().then((t) => t.populate('wishlist').execPopulate());

  res.status(204).send();
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /update-my-password.'
      ),
      400
    );
  }

  const filteredRequestBody = filterObj(req.body, 'name', 'email');

  const updatedUser = await User.findById(req.user.id);

  if (filteredRequestBody.name) updatedUser.name = filteredRequestBody.name;
  if (filteredRequestBody.email) updatedUser.email = filteredRequestBody.email;

  // const updatedUser = await User.findByIdAndUpdate(
  //   req.user.id,
  //   filteredRequestBody,
  //   {
  //     new: true,
  //     runValidators: true,
  //   }
  // );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const me = await User.findById(req.user.id);

  if (!me) {
    return next(new AppError('Authentication failed', 404));
  }

  // await User.findByIdAndUpdate(
  //   req.user.id,
  //   { active: false },
  //   {
  //     new: true,
  //     runValidators: true,
  //   }
  // );

  res.status(204).send();
});

exports.createUser = (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message:
      'This route is obsolete. Please use /signup instead to create a user',
  });
};

exports.getUser = factory.getOne(User, {
  path: 'wishlist',
  select: 'name sku',
});

exports.getAllUsers = factory.getAll(User);

exports.deleteUser = factory.deleteOne(User);
