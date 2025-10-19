const router = require('express').Router();
const {isAuthenticated, isAdmin} = require('../Middlewares/auth');
const {
    handleGetClaims,
    handleClaimItem,
    handleClaimVerification,
    handleUserClaims,
    handleGetAClaim
} = require("../Controllers/claimItem");


router.post('/', isAuthenticated, handleClaimItem);
router.put('/verify',isAuthenticated, isAdmin, handleClaimVerification);
router.get('/:id',isAuthenticated, isAdmin, handleGetAClaim);
router.get('/',isAuthenticated, isAdmin, handleGetClaims);
router.get('/u/', isAuthenticated, handleUserClaims);

module.exports = router;