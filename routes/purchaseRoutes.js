const express = require('express');
const purchaseController = require('../controllers/purchaseController');

const router = express.Router();

router
  .route('/')
  .get(purchaseController.getAllPurchases)
  .post(purchaseController.createPurchase);

router.route('/:id').get(purchaseController.getPurchase);

module.exports = router;
