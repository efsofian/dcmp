const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const ErrorResponse = require('../utils/errorResponse');

async function getCourses(req, res, next) {
    // courses for spe bootcamp
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
        // all courses
    } else {
        res.status(200).json(res.advancedResults);
    }
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    })
}

async function getCourse(req, res, next) {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });
    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: course
    });
}

async function addCourse(req, res, next) {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    console.log(req.body.bootcamp);
    console.log(req.body.user);
    console.log(bootcamp.user.toString());
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404));
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User: ${req.user.id} is not authorized to add a course the bootcamp id: ${req.params.bootcampId}`, 401))
    }
    const course = await Course.create(req.body);
    res.status(201).json({
        success: true,
        data: course
    })
}

async function updateCourse(req, res, next) {
    let course = await Course.findById(req.params.id);
    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.bootcampId}`, 404));
    }
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User: ${req.user.id} is not authorized to update the course id: ${course._id}`, 401))
    }
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: course
    })
}

async function deleteCourse(req, res, next) {
    let course = await Course.findById(req.params.id);
    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.bootcampId}`, 404));
    }
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User: ${req.user.id} is not authorized to delete the course id: ${course._id}`, 401))
    }
    await course.remove();
    res.status(200).json({
        success: true,
        data: course
    })
}

module.exports = {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
};