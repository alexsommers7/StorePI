const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const slugToString = require('../utils/slugToString');

exports.getAllBrands = catchAsync(async (req, res, next) => {
  const products = await Product.find({}, 'brand');
  const brands = products.map((item) => item.brand);
  const brandsUnique = Array.from(new Set(brands));
  const brandsSorted = brandsUnique.sort((a, b) => a.localeCompare(b));

  res.status(200).json({
    status: 'success',
    results: brandsSorted.length,
    data: brandsSorted,
  });
});

exports.formatBrandBody = (req, res, next) => {
  const brand = req.params.brandName;
  req.body.brandFormatted = slugToString(brand);

  next();
};
