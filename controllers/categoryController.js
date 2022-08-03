var async = require('async');
var { body, validationResult } = require('express-validator');
var Category = require('../models/category');
var Item = require('../models/item');

exports.categoryList = function (req, res, next) {
  Category.find({})
    .sort({ name: 1 })
    .exec(function (err, result) {
      if (err) {
        return next(err);
      }
      res.render('category_list', {
        title: 'Categories',
        category_list: result,
      });
    });
};

exports.categoryDetail = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items: function (callback) {
        Item.find({ category: { $elemMatch: { $eq: req.params.id } } })
          .sort({ name: 1 })
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        var err = new Error('Category not found');
        err.status = 404;
        return next(err);
      }
      res.render('category_detail', {
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

exports.categoryCreateGet = function (req, res, next) {
  res.render('category_form', { title: 'Create Category' });
};

exports.categoryCreatePost = [
  body('name', 'Please provide name').trim().isLength({ min: 1 }).escape(),
  body('description', 'Please provide description')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    var category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: 'Create Category',
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      Category.findOne({ name: category.name }).exec(function (err, result) {
        if (err) {
          return next(err);
        }
        if (result) {
          res.redirect(result.url);
        } else {
          category.save(function (err) {
            if (err) {
              return next(err);
            }
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

exports.categoryUpdateGet = function (req, res, next) {
  Category.findById(req.params.id).exec(function (err, result) {
    if (err) {
      return next(err);
    }
    res.render('category_form', { title: 'Update Category', category: result });
  });
};

exports.categoryUpdatePost = [
  body('name', 'Please provide name').trim().isLength({ min: 1 }).escape(),
  body('description', 'Please provide description')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    var category = new Category({
      _id: req.params.id,
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: 'Update Category',
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      Category.findOne({ name: category.name }).exec(function (err, result) {
        if (err) {
          return next(err);
        }
        if (result) {
          res.redirect(result.url);
        } else {
          Category.findByIdAndUpdate(
            req.params.id,
            category,
            {},
            function (err, updatedCategory) {
              if (err) {
                return next(err);
              }
              res.redirect(updatedCategory.url);
            }
          );
        }
      });
    }
  },
];

exports.categoryDeleteGet = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items: function (callback) {
        Item.find({ category: { $elemMatch: { $eq: req.params.id } } })
          .sort({ name: 1 })
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        var error = new Error('Category not found');
        error.status = 404;
        return next(error);
      }
      res.render('category_delete', {
        title: 'Delete Category',
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

exports.categoryDeletePost = function (req, res, next) {
  Category.findByIdAndRemove(req.body.categoryId, function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/groceries/categories');
  });
};
