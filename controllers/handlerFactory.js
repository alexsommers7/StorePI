const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    // const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).send();
  });

exports.updateOne = (Model, ...popOptions) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    // const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(req.body)) {
      if (doc[key]) {
        doc[key] = value;
      } else {
        return next(
          new AppError(`${key} is not a valid product property`, 400)
        );
      }
    }

    if (popOptions) {
      popOptions.forEach(async (option) => {
        await doc.populate(option);
      });
    }

    doc.overrideValidators = true;
    if (!req.body.slug) doc.slug = undefined;

    await doc.execPopulate();
    await doc.validate();

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = (Model, ...popOptions) =>
  catchAsync(async (req, res, next) => {
    const doc = await new Model(req.body);
    // const doc = await Model.create(req.body);

    if (popOptions) {
      popOptions.forEach(async (option) => {
        await doc.populate(option);
      });
    }

    await doc.execPopulate();
    await doc.validate();

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, ...popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions)
      popOptions.forEach((option) => {
        query = query.populate(option);
      });

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter;

    // hacky way to allow for nested routes
    if (req.params.productId) filter = { product: req.params.productId };
    else if (req.params.categoryId)
      filter = { category: req.params.categoryId };
    else if (req.params.userId) filter = { user: req.params.userId };
    else if (req.body.brandFormatted)
      filter = { brand: { $regex: req.body.brandFormatted, $options: 'i' } };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .project()
      .paginate();
    const docs = await features.query;
    const total = await Model.countDocuments({});

    res.status(200).json({
      status: 'success',
      results: docs.length,
      total,
      data: docs,
    });
  });

exports.getMine = (Model, singleItem = false, ...popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = singleItem
      ? Model.find({ user: req.params.id })
      : Model.findOne({ user: req.params.id });

    if (popOptions)
      popOptions.forEach((option) => {
        query = query.populate(option);
      });

    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .project()
      .paginate();
    const docs = await features.query;

    if (!docs) {
      return next(
        new AppError('No documents found belonging to this user', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs,
    });
  });
