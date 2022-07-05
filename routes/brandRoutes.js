const express = require('express');
const brandController = require('../controllers/brandController');
const productRouter = require('./productRoutes');

const router = express.Router({ mergeParams: true });

router.use(
  '/:brandName/products',
  brandController.formatBrandBody,
  productRouter
);

router.route('/').get(brandController.getAllBrands);

module.exports = router;
