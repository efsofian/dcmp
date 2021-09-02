const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');

async function getReviews(req, res, next) {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });
        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
        // all resources
    } else {
        res.status(200).json(res.advancedResults);
    }

}

async function getReview(req, res, next) {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });
    if (!review) {
        return next(new ErrorResponse(`No review found with the id: ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: review
    });
}

async function addReview(req, res, next) {
    req.body.user = req.user.id;
    req.body.bootcamp = req.params.bootcampId;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with this id: ${req.params.bootcampId}`, 404));
    }
    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    });
}

async function updateReview(req, res, next) {
    let review = await Review.findById(req.params.id);
    console.log(req.user);
    if (!review) {
        return next(new ErrorResponse(`No review with this id: ${req.params.id}`, 404));
    }
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to update this review: ${req.params.id}`, 404));
    }
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: review
    });
}

async function deleteReview(req, res, next) {
    const review = await Review.findById(req.params.id);
    if (!review) {
        return next(new ErrorResponse(`No review with this id: ${req.params.id}`, 404));
    }
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to update this review: ${req.params.id}`, 404));
    }

    await review.remove();
    res.status(200).json({
        success: true,
        data: review
    });
}

module.exports = {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview
};