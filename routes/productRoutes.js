const express = require('express');
const productController = require('../controllers/productController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:productId/reviews', reviewRouter);

router
  .route('/top-10-cheap')
  .get(
    productController.aliasTopProductsCheap,
    productController.getAllProducts
  );

router
  .route('/top-10-rated')
  .get(
    productController.aliasTopProductsRated,
    productController.getAllProducts
  );

router
  .route('/')
  .get(productController.formatBrandParam, productController.getAllProducts)
  .post(productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
