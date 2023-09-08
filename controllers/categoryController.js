const Category = require('../models/category');
const Item = require('../models/item');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.category_list = asyncHandler(async (req, res, next) => {
  const categories = await Category.find()
    .sort({name: 1})
    .exec();
  res.render('category_list', { 
    title: "Categories", 
    categories: categories 
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const [ category, items ] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({category: req.params.id}).exec()
  ]);

  if (category === null) {
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }

  res.render('category_detail', {
    title: 'Category Detail',
    category: category,
    items: items,
  });
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render('category_form', {
    title: "Create Category",
  })
});

exports.category_create_post = [
  body('name', 'Name must not be empty.')
    .trim()
    .isLength({ min: 1})
    .escape(),
  body('description', 'Description must not be empty.')
    .trim()
    .isLength( {min: 3})
    .withMessage('Description must contain at least 3 characters.')
    .escape(),

    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);

      const category = new Category({
        name: req.body.name,
        description: req.body.description
      });

    if (!errors.isEmpty()) {
      res.render('category_form', {
        name: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
      }
      else {
        const categoryExists = await Category.findOne({ name: req.body.name }).exec();
        if (categoryExists) {
          res.redirect(categoryExists.url);
        }
        else {
          await category.save();
          res.redirect(category.url);
        }
      }
  })
]

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [ category, allItems ] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (category === null) {
    res.redirect('/');
  };

  res.render('category_delete', {
    title: "Delete Category",
    category: category,
    items: allItems
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [ category, allItems ] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec()
  ]);

  if (allItems.length > 0) {
    res.render('category_delete', {
      title: 'Delete Category',
      category: category,
      items: allItems, 
    });
    return;
  }
  else {
    await Category.findByIdAndRemove(req.body.categoryid);
    res.redirect('/');
  }
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }

  res.render('category_form', {
    title: "Update Category",
    category: category
  });
});

exports.category_update_post = [
  body('name', 'Name must not be empty.')
    .trim()
    .isLength({ min: 1})
    .escape(),
  body('description', 'Description must not be empty')
    .trim()
    .isLength( {min: 3})
    .withMessage('Description must contain at least 3 characters.')
    .escape(),

    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);

      const category = new Category({
        name: req.body.name,
        description: req.body.description,
        _id: req.params.id,
      });

    if (!errors.isEmpty()) {
      res.render('category_form', {
        name: "Update Category",
        category: category,
        errors: errors.array(),
      });
      return;
      }
      else {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
        res.redirect(updatedCategory.url);
      }
  })
]