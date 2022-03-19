const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require('./categoryModel');

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: Number,
      required: [true, 'A product must have a sku'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      unique: true,
      trim: true,
      minLength: [2, 'A product name must be at least 2 characters long'],
      writable: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    brand: {
      type: String,
      required: [true, 'A product must belong to a brand'],
    },
    reviews_average: {
      type: Number,
      default: 4.5,
      min: [1, 'An average rating must be at least 1.0'],
      max: [5, 'An average rating must be 5.0 or lower'],
      set: (val) => val.toFixed(2),
    },
    reviews_quantity: {
      type: Number,
      default: 0,
    },
    best_seller: {
      type: Boolean,
      default: false,
    },
    regular_price: {
      type: Number,
      required: [true, 'A product must have a regular price'],
    },
    sale_price: {
      type: Number,
      required: [true, 'A product must have a sale price'],
      validate: {
        validator: function (val) {
          return val <= this.regular_price;
        },
        message:
          'Sale_price ({VALUE}) must be lower than or equal to the regular_price',
      },
    },
    in_stock: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A product must have a description'],
    },
    features: [String],
    specs: mongoose.Schema.Types.Mixed,
    image_main: String,
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// custom index
productSchema.index({ price: 1 });

// remove when saving/importing
// productSchema.pre('validate', function (next) {
//   if (this.sku.toString().length < 4 && !this.overrideValidators)
//     throw new Error('Please provide a SKU with at least 4 digits');
//   next();
// });

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

productSchema.pre(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name' });

  next();
});

productSchema.statics.calcCategoryItemCount = async function (categoryId) {
  const stats = await this.aggregate([
    {
      $match: { category: categoryId },
    },
    {
      $group: {
        _id: '$category',
        numProducts: { $sum: 1 },
      },
    },
  ]);

  if (stats.length) {
    await Category.findByIdAndUpdate(categoryId, {
      item_count: stats[0].numProducts,
    });
  } else {
    await Category.findByIdAndUpdate(categoryId, {
      item_count: 0,
    });
  }
};

productSchema.post('save', function () {
  this.constructor.calcCategoryItemCount(this.category);
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
