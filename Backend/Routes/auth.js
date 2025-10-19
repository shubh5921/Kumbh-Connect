const express = require('express');
const { handleSignUp, handleSignIn, handleSignOut, handleSendVerificationCode, handleVerifyCode } = require('../Controllers/auth');

const router = express.Router();

router.post("/sign-up",handleSignUp);
router.post("/sign-in",handleSignIn);
router.post("/sign-out",handleSignOut);
router.post("/send-code",handleSendVerificationCode);
router.post("/verify-code",handleVerifyCode);

module.exports = router;