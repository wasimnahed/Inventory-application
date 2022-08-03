var async = require('async');
var Item = require('../models/item');
var Category = require('../models/category');
var { body, validationResult } = require('express-validator');

exports.index = function (req, res, next) {
  async.parallel(
    {
      items: function (callback) {
        Item.countDocuments({}, callback);
      },
      categories: function (callback) {
        Category.countDocuments({}, callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render('index', {
        title: 'Inventory Application',
        total_items: results.items,
        total_categories: results.categories,
        total_suppliers: results.suppliers,
      });
    }
  );
};

exports.itemList = function (req, res, next) {
  Item.find({})
    .sort({ name: 1 })
    .exec(function (err, result) {
      if (err) {
        return next(err);
      }
      res.render('item_list', { title: 'Items', items_list: result });
    });
};

exports.itemDetail = function (req, res, next) {
  Item.findById(req.params.id)
    .populate('category')
    .exec(function (err, result) {
      if (err) {
        return next(err);
      }
      //No results.
      if (result == null) {
        var error = new Error('Item not found');
        err.status = 404;
        return next(error);
      }
      res.render('item_detail', { title: 'Item Detail', item: result });
    });
};

exports.itemCreateGet = function (req, res, next) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}).sort({ name: 1 }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render('item_form', {
        title: 'Create Item',
        categories: results.categories,
      });
    }
  );
};

exports.itemCreatePost = [
  //Converting category into array.
  (req, res, next) => {
    if (!req.body.category instanceof Array) {
      if (typeof req.body.category === undefined) {
        req.body.category = [];
      } else {
        req.body.category = new Array(req.body.category);
      }
    }
    next();
  },

  body('name', 'Please provide name').trim().isLength({ min: 1 }).escape(),
  body('description', 'Please provide description')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('price', 'Please provide price').trim().isLength({ min: 1 }).escape(),
  body('number_in_stock', 'Please provide number in stock')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('category.*').escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    var item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          categories: function (callback) {
            Category.find({}).sort({ name: 1 }).exec(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
          for (let i = 0; i < results.categories.length; i++) {
            if (item.category.indexOf(results.categories[i]._id) > -1) {
              results.categories[i].checked = 'true';
            }
          }
          res.render('item_form', {
            title: 'Create Item',
            item: item,
            categories: results.categories,
            errors: errors.array(),
          });
          return;
        }
      );
    } else {
      item.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect(item.url);
      });
    }
  },
];

exports.itemUpdateGet = function (req, res, next) {
  async.parallel(
    {
      item: function (callback) {
        Item.findById(req.params.id).exec(callback);
      },
      categories: function (callback) {
        Category.find({}).sort({ name: 1 }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        var err = new Error('Item not found');
        err.status = 404;
        return next(err);
      }
      for (let i = 0; i < results.categories.length; i++) {
        for (let j = 0; j < results.item.category.length; j++) {
          if (
            results.categories[i]._id.toString() ===
            results.item.category[j]._id.toString()
          ) {
            results.categories[i].checked = 'true';
          }
        }
      }
      res.render('item_form', {
        title: 'Update Item',
        item: results.item,
        categories: results.categories,
      });
    }
  );
};

exports.itemUpdatePost = [
  //Converting category into array.
  (req, res, next) => {
    if (!req.body.category instanceof Array) {
      if (typeof req.body.category === undefined) {
        req.body.category = [];
      } else {
        req.body.category = new Array(req.body.category);
      }
    }
    next();
  },

  body('name', 'Please provide name').trim().isLength({ min: 1 }).escape(),
  body('description', 'Please provide description')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('price', 'Please provide price').trim().isLength({ min: 1 }).escape(),
  body('number_in_stock', 'Please provide number in stock')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('category.*').escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    var item = new Item({
      _id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          suppliers: function (callback) {
            Supplier.find({}).sort({ name: 1 }).exec(callback);
          },
          categories: function (callback) {
            Category.find({}).sort({ name: 1 }).exec(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
          for (let i = 0; i < results.categories.length; i++) {
            if (item.category.indexOf(results.categories[i]._id) > -1) {
              results.categories[i].checked = 'true';
            }
          }
          res.render('item_form', {
            title: 'Update Item',
            item: item,
            categories: results.categories,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      Item.findByIdAndUpdate(
        req.params.id,
        item,
        {},
        function (err, updatedItem) {
          if (err) {
            return next(err);
          }
          res.redirect(updatedItem.url);
        }
      );
    }
  },
];

exports.itemDeleteGet = function (req, res, next) {
  Item.findById(req.params.id).exec(function (err, result) {
    if (err) {
      return next(err);
    }
    if (result == null) {
      res.redirect('/groceries/items');
      return;
    }
    res.render('item_delete', { title: 'Delete Item', item: result });
  });
};

exports.itemDeletePost = function (req, res, next) {
  Item.findByIdAndRemove(req.body.itemId, function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/groceries/items');
  });
};
