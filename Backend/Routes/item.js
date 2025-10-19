const { storage } = require('../Storage/storage');
const multer = require('multer');
const upload = multer({ storage });
const router = require('express').Router();
const {isAuthenticated, isAdmin} = require('../Middlewares/auth');
const {
    handleAddItem, 
    handleUpdateItem, 
    handleUpdateItemStatus, 
    handleDeleteItem,
    handleGetItems,
    handleGetItemsByCategory,
    handleGetItemsOfACategory,
    handleGetItemofUser,
    handleGetItemById,
    handleGetItemByQuery,
} = require("../Controllers/item");


router.get('/id/:id', handleGetItemById);
router.get('/', handleGetItems);
router.get('/q', handleGetItemByQuery);
router.get('/category/:id', handleGetItemsOfACategory);
router.get('/category', handleGetItemsByCategory);
router.get('/user',isAuthenticated, handleGetItemofUser);
router.post('/', isAuthenticated, upload.array('images', 5), handleAddItem);
router.put('/status/:id', isAuthenticated, isAdmin, handleUpdateItemStatus);
router.put('/:id', isAuthenticated, isAdmin, handleUpdateItem);
router.delete('/:id', isAuthenticated, handleDeleteItem);

module.exports = router;