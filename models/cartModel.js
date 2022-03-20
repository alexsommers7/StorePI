const mongoose = require('mongoose');
const priceFormat = require('../utils/priceFormat');
// const Product = require('./productModel');

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A cart must belong to a user'],
    },
    products: [
      {
        item: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: [true, 'An item must be specified'],
        },
        quantity: {
          type: Number,
          min: [1, 'Quantity must be greater than 0'],
        },
      },
    ],
    created_at: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ensure only one combination of user and cart
cartSchema.index({ cart: 1, user: 1 }, { unique: true });

// remove when saving/importing
// cartSchema.pre('validate', function (next) {
//   if (this.products.length < 1 && !this.overrideValidators)
//     throw new Error('products array must contain at least one item');

//   this.products = this.products.filter(
//     (e, i) => this.products.findIndex((a) => a.item === e.item) === i
//   );

//   next();
// });

cartSchema.pre(/^find/, function (next) {
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

cartSchema.post('save', function () {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'products',
    populate: {
      path: 'item',
      select:
        '-category image_main name brand slug sale_price sku regular_price',
    },
  });
});

cartSchema.virtual('total').get(function () {
  if (!this.products) return null;

  const totalCost = this.products.reduce(
    (total, cur) => cur.item.sale_price * cur.quantity + total,
    0
  );

  return priceFormat.numericPrice(totalCost);
});

cartSchema.virtual('total_pretty').get(function () {
  if (!this.products) return null;

  const totalCost = this.products.reduce(
    (total, cur) => cur.item.sale_price * cur.quantity + total,
    0
  );

  return priceFormat.prettyPrice(totalCost);
});

cartSchema.virtual('item_count').get(function () {
  return this.products.reduce((total, cur) => total + cur.quantity, 0);
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
