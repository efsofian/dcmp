const express = require('express');
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampWithinRadius, photoUploadBootcamp } = require('../controllers/bootcamps');
const router = express.Router();
const asyncHandler = require('../middleware/async');
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');
const advancedResults = require('../middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp');
const { protect, authorize } = require('../middleware/auth');

router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), asyncHandler(getBootcamps))
    .post(asyncHandler(protect), authorize('publisher', 'admin'), asyncHandler(createBootcamp));

router.route('/:id')
    .get(asyncHandler(getBootcamp))
    .put(asyncHandler(protect), authorize('publisher', 'admin'), asyncHandler(updateBootcamp))
    .delete(asyncHandler(protect), authorize('publisher', 'admin'), asyncHandler(deleteBootcamp));

router.route('/radius/:zipcode/:distance')
    .get(asyncHandler(getBootcampWithinRadius));

router.route('/:id/photo')
    .put(asyncHandler(protect), authorize('publisher', 'admin'), asyncHandler(photoUploadBootcamp));

module.exports = router;