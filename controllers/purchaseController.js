const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Purchase = require('../models/purchaseModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/my-products?alert=purchase`,
    cancel_url: `${req.protocol}://${req.get('host')}/product/${product.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.productId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(product.sale_price) * 100, // dollars to cents
          product_data: {
            name: `${product.name} product`,
            description: product.description,
            images: [
              `${req.protocol}://${req.get('host')}/img/products/${
                product.image_main
              }`,
            ],
          },
        },
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

const createPurchaseCheckout = async (session) => {
  const product = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))._id;
  const price = session.amount_total / 100; // cents to dollars
  await Purchase.create({ product, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createPurchaseCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};

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

exports.deletePurchase = factory.deleteOne(Purchase);
