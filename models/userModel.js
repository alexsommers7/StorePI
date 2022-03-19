const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator'); // string validator plugin: https://github.com/validatorjs/validator.js/
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    match: [
      new RegExp(/^[a-zA-Z\s]+$/),
      '{VALUE} is not valid. Please use only letters',
    ],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: [8, 'A password must be at least 8 characters long'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Please enter matching passwords',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  wishlist: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
  ],
});

// middleware to encrypt (aka 'hash') passwords - very important functionality for security
// userSchema.pre('save', async function (next) {
//   // only run this function if the password was actually modified
//   if (!this.isModified('password')) return next();

//   // encrypt passwords using bcryptjs npm package
//   // second parameter is the salt length to generate. Higher the #, the more CPU-intensive the operation will be. Default is 10
//   this.password = await bcrypt.hash(this.password, 12);

//   // password confirmation is only needed for validation. Dont store it in DB
//   // passwordConfirm is required, but that means it's a required input, not that it's required to be persisted into the DB
//   this.passwordConfirm = undefined;

//   next();
// });

// // middleware to update the user's passwordChangedAt timestamp when creating/resetting password
// userSchema.pre('save', function (next) {
//   if (!this.isModified('password') || this.isNew) return next();

//   this.passwordChangedAt = Date.now() - 1000; // subtracting a second is just a hack to ensure the JWT is created AFTER the password has been changed
//   next();
// });

// middleware to filter out only active users when using .find()
// this is an example of query middleware
userSchema.pre(/^find/, async function (next) {
  // using $ne: false instead of just true cause of the edge case of older users not having any active key set at all
  this.find({ active: { $ne: false } });
  next();
});

// instance method - a method that's available on all documents in a certain collection
// using this instance method to check if password matches when user tries to log in (in authController.js)
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// another instance method
// this one is to check if user changed password after the JWT was issued
// it is used in the authController in the last stage of the protect method
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // if this returns true, that means they have changed their password since their JWT was issued
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// another instance method
// this one is to generate a random password reset token to send to their email in the /forgot-password route
userSchema.methods.createPasswordResetToken = function () {
  // use built-in crypto library to create a random string 32 characters long
  const resetToken = crypto.randomBytes(32).toString('hex');

  // encrypt it
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // set it to expire in 10 mins
  // note that this just alters the value for the user, it doesn't actually save it
  // the .save() method is called after this function is called in the authController
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // return the plain-text token so we can use it to send to them in an email
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
