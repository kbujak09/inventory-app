const Item = require('../models/item');
const Category = require('../models/category');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }
  
  const category = await Category.findById(item.category).exec();
  
  res.render('item_detail', {
    title: "Item Detail",
    item: item,
    category: category,
  })
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  res.render('item_form', {
    title: 'Create Item',
    category: category
  })
});

exports.item_create_post = [
  body('name', 'Name must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('description', 'Description must not be empty.')
    .trim()
    .isLength( {min: 3})
    .withMessage('Description must contain at least 3 characters.')
    .escape(),
  body('price', 'Price must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('count', 'Count must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = await Category.findById(req.params.id).exec();

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      count: req.body.count,
      category: category.id,
    });


    if (!errors.isEmpty()) {
      res.render('item_form', {
        name: "Create Item",
        item: item,
        errors: errors.array(),
      });
      return
    }
    else {
      const itemExists = await Item.findOne({ name: req.body.name }).exec();
      if (itemExists) {
        res.redirect(itemExists.url);
      }
      else {
        await item.save();
        const category = await Category.findById(req.params.id).exec();
        res.redirect(category.url + item.url)
      }
    }
  })
]

exports.item_delete_get = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).exec();
    const category = await Category.findById(item.category).exec();

  if (item === null) {
    res.redirect('/');
  };

  res.render('item_delete', {
    title: 'Delete Item',
    item: item,
    category: category,
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();
  const category = await Category.findById(item.category).exec();

  await Item.findByIdAndRemove(req.body.itemid);
  res.redirect(category.url);
});

exports.item_update_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();
  const category = await Category.findById(item.category).exec();

  if (item === null) {
    const err = new Error('Item not found');
    err.status = 404;
    return next(err);
  };

  res.render('item_form', {
    title: 'Update Item',
    item: item,
    category: category,
  });
});

exports.item_update_post = [
  body('name', 'Name must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('description', 'Description must not be empty.')
    .trim()
    .isLength( {min: 3})
    .withMessage('Description must contain at least 3 characters.')
    .escape(),
  body('price', 'Price must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('count', 'Count must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const prevItem = await Item.findById(req.params.id).exec()
    const category = await Category.findById(prevItem.category).exec();

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      count: req.body.count,
      _id: prevItem._id,
      category: category.id
    });


    if (!errors.isEmpty()) {
      res.render('item_form', {
        name: "Update Item",
        item: item,
        errors: errors.array(),
      });
      return;
    }
    else {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      const category = await Category.findById(updatedItem.category).exec();
      res.redirect(category.url + item.url);
      }
    })
]