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

router
  .route('/current')
  .get(authController.protect, userController.getMe, userController.getUser)
  .patch(authController.protect, userController.updateMe)
  .delete(
    authController.protect,
    userController.getMe,
    userController.deleteMe
  );

router
  .route('/current/wishlist')
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
  .route('/current/cart')
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
  .route('/current/purchases')
  .get(
    authController.protect,
    userController.getMe,
    purchaseController.getMyPurchases
  );

router
  .route('/current/reviews')
  .get(
    authController.protect,
    userController.getMe,
    reviewController.getMyReviews
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
