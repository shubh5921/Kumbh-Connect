const router = require("express").Router();
const {handleGetProfile, handleUpdateUser, handleGetUsersByQuery, handleGetUsers} = require("../Controllers/user");
const {isAuthenticated, isAdmin} = require("../Middlewares/auth");


router.get('/q',isAuthenticated,isAdmin, handleGetUsersByQuery);
router.get('/all',isAuthenticated,isAdmin, handleGetUsers);
router.get('/',isAuthenticated, handleGetProfile);
router.put('/',isAuthenticated, handleUpdateUser);

module.exports = router;