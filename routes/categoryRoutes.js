const express = require('express');
const categoryController = require('../controllers/categoryController');
const productRouter = require('./productRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:categoryId/products', productRouter);

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);

router
  .route('/:id')
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
