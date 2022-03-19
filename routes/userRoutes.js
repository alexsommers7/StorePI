const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const cartController = require('../controllers/cartController');
const purchaseController = require('../controllers/purchaseController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);

router
  .route('/my-wishlist')
  .get(
    authController.protect,
    userController.getMe,
    userController.getMyWishlist
  )
  .patch(
    authController.protect,
    userController.getMe,
    userController.addProductToMyWishlist
  )
  .delete(
    authController.protect,
    userController.getMe,
    userController.removeProductFromMyWishlist
  );

router
  .route('/my-cart')
  .get(authController.protect, userController.getMe, cartController.getMyCart)
  .patch(
    authController.protect,
    userController.getMe,
    cartController.addProductToMyCart
  )
  .delete(
    authController.protect,
    userController.getMe,
    cartController.removeProductFromMyCart
  );

router
  .route('/my-purchases')
  .get(
    authController.protect,
    userController.getMe,
    purchaseController.getMyPurchases
  );

router
  .route('/my-reviews')
  .get(
    authController.protect,
    userController.getMe,
    reviewController.getMyReviews
  );

router.patch('/update-me', authController.protect, userController.updateMe);
router.delete(
  '/delete-me',
  authController.protect,
  userController.getMe,
  userController.deleteMe
);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = router;
