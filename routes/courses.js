const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const AsyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const courseRouter = express.Router({ mergeParams: true});

courseRouter.route('/')
    .get(advancedResults(Course, {
        path: 'bootcamp',
        select: 'name description'
    }), AsyncHandler(getCourses))
    .post(AsyncHandler(protect), AsyncHandler(addCourse));

courseRouter.route('/:id')
    .get(AsyncHandler(getCourse))
    .put(AsyncHandler(protect), authorize('publisher', 'admin'), AsyncHandler(updateCourse))
    .delete(AsyncHandler(protect), authorize('publisher', 'admin'), AsyncHandler(deleteCourse));
    
module.exports = courseRouter;