const router = require('express').Router();
const {isAuthenticated, isAdmin} = require('../Middlewares/auth');
const {handleAddCategory, handleUpdateCategory, handleDeleteCategory, handleGetCategories} = require("../Controllers/category");


router.get('/', handleGetCategories);
router.post('/', isAuthenticated, isAdmin, handleAddCategory);
router.put('/:id', isAuthenticated, isAdmin, handleUpdateCategory);
router.delete('/:id', isAuthenticated, isAdmin, handleDeleteCategory);


module.exports = router;