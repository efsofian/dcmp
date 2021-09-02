const { listenerCount } = require('cluster');
const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');



async function getBootcamps(req, res, next) {
        res.status(200).json(res.advancedResults);
}

async function getBootcamp(req, res, next) {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) { 
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)); // need new feature to test if its valid ObjectId but not in db.
        }
        res.status(200).json({ success: true, data: bootcamp});
}

async function createBootcamp(req, res, next) {
        // add user to req.body for relationship
        req.body.user = req.user;
        // check for published bootcamps
        const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
        if (publishedBootcamp && req.user.role !== 'admin') {
                return next(new ErrorResponse(`The user with ID: ${req.user.id} has already published a bootcamp`, 400));
        }
        const bootcamp = new Bootcamp(req.body);
        await bootcamp.save();
        res.status(201).json({ success: true, data: bootcamp });  
}

async function updateBootcamp(req, res, next) {
        let bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
                return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)); // need new feature to test if its valid ObjectId but not in db.
        }
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrorResponse(`User: ${req.user.id} is not authorized to update this bootcamp`, 401))
        }
        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
                returnOriginal: false,
                runValidators: true
        });
        res.status(200).json({ success: true, data: bootcamp});  
}

async function deleteBootcamp(req, res, next) {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
             return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)); // need new feature to test if its valid ObjectId but not in db.
        }
         if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrorResponse(`User: ${req.user.id} is not authorized to update this bootcamp`, 401))
        }
        await bootcamp.remove();
        res.status(200).json({ success: true, data: bootcamp});
}

async function getBootcampWithinRadius(req, res, next) {
        const { zipcode, distance } = req.params;
        const loc = await geocoder.geocode(zipcode);
        const lat = loc[0].latitude;
        const lng = loc[0].longitude

        // earth radius: 3963 miles or 6358km
        const radius = distance / 3963;
        console.log(`lat: ${lat} - long: ${lng} - radius: ${radius} - distance: ${distance}`)
        const bootcamps = await Bootcamp.find({
                location: {
                        $geoWithin: {
                                $centerSphere: [[lng, lat], radius]
                        }
                }
        });
        res.status(200).json({
                success: true,
                count: bootcamps.length,
                data: bootcamps
        });



}

async function photoUploadBootcamp(req, res, next) {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
             return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)); // need new feature to test if its valid ObjectId but not in db.
        }
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrorResponse(`User: ${req.user.id} is not authorized to update this bootcamp`, 401))
        }
        if (!req.files) {
                return next(new ErrorResponse(`Please, upload a file ...!`, 400));
        }
        const file = req.files.file;
        console.log('files: ', req.files);
        console.log('file: ', file);
        // photo validation
        if (!file.mimetype.startsWith('image')) {
                return next(new ErrorResponse(`Please, upload an image file ...!`, 400));
        }
        // size validation
        if (file.size > parseInt(process.env.MAX_FILE_UPLOAD)) {
                return next(new ErrorResponse(`Please, upload an imageless than ${process.env.MAX_FILE_UPLOAD / 1000000}Mo ...!`, 400));
        }
        // create custom filename
        file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
        console.log(file.name);
        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
                if (err) {
                        console.error(err);
                        return next(new ErrorResponse(`Problem with file upload`, 500));
                }
        });
        await Bootcamp.findByIdAndUpdate(req.params.id, {
                photo: file.name
        });
        res.status(201).json({ success: true, data: file.name});
}

module.exports = {
        getBootcamps,
        getBootcamp,
        createBootcamp,
        updateBootcamp,
        deleteBootcamp,
        getBootcampWithinRadius,
        photoUploadBootcamp
};