var express = require('express');
var router = express.Router();

var itemControler = require('../controllers/itemController');
var categoryController = require('../controllers/categoryController');

/** Item Routes **/
router.get('/', itemControler.index);

router.get('/item/create', itemControler.itemCreateGet);
router.post('/item/create', itemControler.itemCreatePost);

router.get('/item/:id/update', itemControler.itemUpdateGet);
router.post('/item/:id/update', itemControler.itemUpdatePost);

router.get('/item/:id/delete', itemControler.itemDeleteGet);
router.post('/item/:id/delete', itemControler.itemDeletePost);

router.get('/item/:id', itemControler.itemDetail);
router.get('/items', itemControler.itemList);

/** Category Routes **/
router.get('/category/create', categoryController.categoryCreateGet);
router.post('/category/create', categoryController.categoryCreatePost);

router.get('/category/:id/update', categoryController.categoryUpdateGet);
router.post('/category/:id/update', categoryController.categoryUpdatePost);

router.get('/category/:id/delete', categoryController.categoryDeleteGet);
router.post('/category/:id/delete', categoryController.categoryDeletePost);

router.get('/category/:id', categoryController.categoryDetail);
router.get('/categories', categoryController.categoryList);

module.exports = router;
