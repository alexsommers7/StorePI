const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllCarts = factory.getAll(Cart);

exports.getCart = factory.getOne(Cart);

exports.addProductToMyCart = catchAsync(async (req, res, next) => {
  const { sku, quantity } = req.body;
  const product = await Product.findOne({ sku });
  let cart = await Cart.findOne({ user: req.params.id });

  if (quantity <= 0) {
    return next(new AppError('Quantity must be greater than 0', 400));
  }

  if (!product) {
    return next(new AppError('No product found with that SKU', 400));
  }

  if (!product.in_stock) {
    return next(
      new AppError(
        'This product is out of stock and cannot be added to a cart',
        400
      )
    );
  }

  // if (!cart) {
  //   const newCart = await Cart.create({
  //     user: req.params.id,
  //     products: [{ item: product._id, quantity, sku }],
  //   }).then((t) => t.populate('item').execPopulate());

  //   return res.status(201).json({
  //     status: 'success',
  //     newCart,
  //   });
  // }

  const itemIndex = cart.products.findIndex((p) => p.item.sku === sku);

  if (itemIndex > -1) {
    const overridingQuantity = req.query.override_quantity === 'true';
    const productItem = cart.products[itemIndex];

    productItem.quantity = overridingQuantity
      ? (productItem.quantity = quantity)
      : (productItem.quantity += quantity);

    cart.products[itemIndex] = productItem;
  } else cart.products.push({ item: product._id, quantity, sku });

  cart = await cart
    .populate({
      path: 'products',
      populate: {
        path: 'item',
        select:
          '-category image_main name brand slug sale_price sku regular_price',
      },
    })
    .execPopulate();

  // cart = await cart.save().then((t) => t.populate('item').execPopulate());

  res.status(201).json({
    status: 'success',
    data: cart,
  });
});

exports.removeProductFromMyCart = catchAsync(async (req, res, next) => {
  if (!req.body.sku)
    return next(
      new AppError('Please provide a product to remove from your cart', 400)
    );

  const { sku } = req.body;

  const cart = await Cart.findOne({ user: req.params.id });
  const itemIndex = cart.products.findIndex((p) => p.item.sku === sku);

  if (itemIndex === -1)
    return next(new AppError('Product is not currently in cart', 400));

  cart.products.splice(itemIndex, 1);

  // cart = await cart.save().then((t) => t.populate('item').execPopulate());

  res.status(204).send();
});

exports.getMyCart = factory.getMine(Cart, true);

exports.createCart = factory.createOne(
  Cart,
  { path: 'user', select: 'name' },
  {
    path: 'products',
    populate: {
      path: 'item',
      select:
        '-category image_main name brand slug sale_price sku regular_price',
    },
  }
);

exports.deleteCart = factory.deleteOne(Cart);
