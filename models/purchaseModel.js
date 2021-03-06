const mongoose = require('mongoose');
const priceFormat = require('../utils/priceFormat');
const randomDate = require('../utils/randomDate');

const purchaseSchema = new mongoose.Schema(
  {
    products: [
      {
        item: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
      },
    ],
    date: {
      type: Date,
      default: () => randomDate(),
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

purchaseSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'products',
    populate: {
      path: 'item',
      select:
        '-category image_main name brand slug sale_price sku regular_price',
    },
  });

  next();
});

purchaseSchema.post('save', function () {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'products',
    populate: {
      path: 'item',
      select:
        '-category image_main name brand slug sale_price sku regular_price',
    },
  });
});

purchaseSchema.virtual('total').get(function () {
  if (!this.products) return null;

  const totalCost = this.products.reduce(
    (total, cur) => cur.item.sale_price * cur.quantity + total,
    0
  );

  return priceFormat.numericPrice(totalCost);
});

purchaseSchema.virtual('total_pretty').get(function () {
  if (!this.products) return null;

  const totalCost = this.products.reduce(
    (total, cur) => cur.item.sale_price * cur.quantity + total,
    0
  );

  return priceFormat.prettyPrice(totalCost);
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
