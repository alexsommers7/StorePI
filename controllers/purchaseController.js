const Purchase = require('../models/purchaseModel');
const factory = require('./handlerFactory');

exports.getMyPurchases = factory.getMine(Purchase);

exports.createPurchase = factory.createOne(
  Purchase,
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

exports.getPurchase = factory.getOne(Purchase);

exports.getAllPurchases = factory.getAll(Purchase);
