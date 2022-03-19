const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Purchase = require('../models/purchaseModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/categories.json`, 'utf-8')
);
const products = JSON.parse(
  fs.readFileSync(`${__dirname}/products.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const carts = JSON.parse(fs.readFileSync(`${__dirname}/carts.json`, 'utf-8'));
const purchases = JSON.parse(
  fs.readFileSync(`${__dirname}/purchases.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Category.create(categories);
    await Product.create(products);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false }); // to bypass validation error. Also need to turn off password encryption in the userModel since the passwords are already encrypted
    await Cart.create(carts);
    await Purchase.create(purchases);

    console.log('Data successfully imported!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();
    await Purchase.deleteMany();

    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);

// to import - comment out the cartSchema pre-validation middleware (cartModel.js) and comment out theproductSchema pre-validation middleware (productModel.js)
// also turn off password validation in the userModel (pre-save middleware)
// to run this script, in terminal: node ./dev-data/import-dev-data.js --delete, then run node ./dev-data/import-dev-data.js --import
