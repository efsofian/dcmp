const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const Review = require('./models/Review');
const { connectDB, closeDB } = require('./utils/db');
const User = require('./models/User')


const bootcamps = JSON.parse(fs.readFileSync(path.join(__dirname, '_data', 'bootcamps.json'), 'utf-8'));
const courses = JSON.parse(fs.readFileSync(path.join(__dirname, '_data', 'courses.json'), 'utf-8'));
const users = JSON.parse(fs.readFileSync(path.join(__dirname, '_data', 'users.json'), 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(path.join(__dirname, '_data', 'reviews.json'), 'utf-8'));

const importData = async () => {
    try {
        connectDB(process.env.MONGO_URL);
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews);
        console.log('data imported...');
        closeDB();
        process.exit();
    } catch (e) {
        console.log(e);
    }
}

const deleteData = async () => {
    try {
        connectDB(process.env.MONGO_URL);
        await Bootcamp.deleteMany({});
        await Course.deleteMany({});
        await User.deleteMany({});
        await Review.deleteMany({});
        console.log('data deleted...');
        closeDB();
        process.exit();
    } catch (e) {
        console.log(e);
    }   
}

if (process.argv[2] === 'import') {
    importData();
    
} else if (process.argv[2] === 'delete') {
    deleteData();
    
} else {
    console.log('Please, type: node seeder import // to get new bootcamps in database');
    console.log('or');
    console.log('Please, type: node seeder delete // to delete all bootcamps in database');
    process.exit();
}