const express = require('express');
const { register, login, getMe, forgotPw, resetPw, updateUserDetails, updatePassword, logout } = require('../controllers/auths');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async')

const router = express.Router();

router.get('/getme', asyncHandler(protect), asyncHandler(getMe));

router.put('/updatedetails', asyncHandler(protect), asyncHandler(updateUserDetails));

router.put('/updatepassword', asyncHandler(protect), asyncHandler(updatePassword));

router.put('/resetpassword/:resettoken', asyncHandler(resetPw));

router.post('/forgotpw', asyncHandler(forgotPw));

router.post('/register', asyncHandler(register));

router.post('/login', asyncHandler(login));

router.get('/logout', asyncHandler(logout));
module.exports = router;