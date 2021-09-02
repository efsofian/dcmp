const User = require('../models/User');

async function getAllUsers(req, res, next) {
    res.status(200).json(res.advancedResults);
}

async function getUser(req, res, next) {
    const user = await User.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: user,
    });
}

async function createUser(req, res, next) {
    const user = await User.create(req.body);
    res.status(201).json({
        success: true,
        data: user,
    });
}

async function updateUser(req, res, next) {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        data: user,
    });
}

async function deleteUser(req, res, next) {
    await User.findByIdAndRemove(req.params.id);
    res.status(200).json({
        success: true,
        data: {},
    });
}


module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};