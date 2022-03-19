const Product = require('../models/productModel');
const User = require('../models/userModel');
const Purchase = require('../models/purchaseModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  // if there is an alert param in the URL, we need to let base.pug know so it can add it as a data attribute to the body
  if (alert === 'purchase')
    res.locals.alert =
      "Your purchase was successful! Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later.";

  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get product data from collection
  const products = await Product.find();

  // 2) Build template (occurs in PUG file)

  // 3) Render that template using the product data from step 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;"
    )
    .render('overview', {
      title: 'All products',
      products,
    });

  next();
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!product) {
    return next(new AppError('There is no product with that name.', 404));
  }

  // 2) Build template (occurs in PUG file)

  // 3) Render that template using the product data from step 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;"
    )
    .render('product', {
      title: `${product.name} product`,
      product,
    });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyPurchases = catchAsync(async (req, res) => {
  let purchases = await Purchase.find({ user: req.user.id });

  if (!purchases) purchases = [];

  res.status(200).render('overview', {
    title: 'Your purchases',
    purchases,
  });
});

exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      // explicitly defining the properties here prevents hackers from adding their own fields
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // re-render the account page so the new user data shows
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
