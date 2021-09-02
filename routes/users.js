const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async')
const { getAllUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/users');
const User = require('../models/User')
const advancedResults = require('../middleware/advancedResults');
const router = express.Router();

router.use(asyncHandler(protect));
router.use(asyncHandler(authorize('admin')));

router.route('/')
    .get(advancedResults(User), asyncHandler(getAllUsers))
    .post(asyncHandler(createUser));

router.route('/:id')
    .get(asyncHandler(getUser))
    .put(asyncHandler(updateUser))
    .delete(asyncHandler(deleteUser));
module.exports = router;