const express = require('express');
const AsyncHandler = require('../middleware/async');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const { getReviews, getReview, addReview, updateReview, deleteReview } = require('../controllers/reviews');
const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

router.route('/').get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
}), AsyncHandler(getReviews))
    .post(protect, authorize('user', 'admin'), AsyncHandler(addReview));

router.route('/:id')
    .get(AsyncHandler(getReview))
    .put(AsyncHandler(protect), authorize('user', 'admin'), AsyncHandler(updateReview))
    .delete(AsyncHandler(protect), authorize('user', 'admin'), AsyncHandler(deleteReview));
    

module.exports = router;