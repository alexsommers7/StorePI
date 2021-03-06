const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const properCase = (str) =>
  str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('-');

exports.createProduct = factory.createOne(Product, {
  path: 'category',
  select: 'name',
});

exports.getProduct = factory.getOne(
  Product,
  { path: 'reviews' },
  { path: 'category' }
);

exports.getAllProducts = factory.getAll(Product);

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);

exports.aliasTopProductsCheap = catchAsync(async (req, res, next) => {
  req.query.limit = '10';
  req.query.sort = 'sale_price,-reviews_average,-reviews_quantity';
  req.query.fields =
    'name,sku,sale_price,reviews_average,reviews_quantity,image_main';

  next();
});

exports.aliasTopProductsRated = catchAsync(async (req, res, next) => {
  req.query.limit = '10';
  req.query.sort = '-reviews_average,-reviews_quantity,sale_price';
  req.query.fields =
    'name,reviews_average,reviews_quantity,sku,sale_price,image_main';

  next();
});

exports.formatBrandParam = (req, res, next) => {
  if (req.query.brand) {
    req.query.brand = Array.isArray(req.query.brand)
      ? req.query.brand.map((brand) => properCase(brand).split('-').join(' '))
      : properCase(req.query.brand).split('-').join(' ');
  }

  next();
};
