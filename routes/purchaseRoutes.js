const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(
  '/checkout-session/:productId',
  authController.protect,
  purchaseController.getCheckoutSession
);

router
  .route('/')
  .get(purchaseController.getAllPurchases)
  .post(purchaseController.createPurchase);

router
  .route('/:id')
  .get(purchaseController.getPurchase)
  .delete(purchaseController.deletePurchase);

module.exports = router;
