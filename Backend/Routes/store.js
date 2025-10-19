const router = require('express').Router();
const { handleGetStores, handleAddStore } = require('../Controllers/store');
const {isAuthenticated, isAdmin} = require('../Middlewares/auth');


router.get('/', handleGetStores);
router.post('/', isAuthenticated, isAdmin, handleAddStore);

module.exports = router;