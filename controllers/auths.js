const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

async function register(req, res, next) {
    const { name, email, password, role } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        role
    });
    const token = user.getSignJWT();
    sendTokenResponse(user, 200, res);
}



async function login(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email & password', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('Invalide credentials', 401));
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalide credentials', 401));
    }
    sendTokenResponse(user, 200, res);
}

async function logout(req, res, next) {
    res.cookie('token', 'null', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
        res.status(200).json({succes: true, data: {}})   
}


function sendTokenResponse(user, statusCode, res) {
    const token = user.getSignJWT();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        options.secure = true // https mode
    }
    console.log('cookie sent');
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    })
}

async function getMe(req, res, next) {
        const user = await User.findById(req.user.id);
        res.status(200).json({succes: true, data: user})   
}

async function forgotPw(req, res, next) {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorResponse(`No user with this email`, 404));
    }

    const resetToken = user.getResetTokenPassword();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `You received this email because you or someone else has requested the reset of your password.
    Please make a Put request  to: \n\n${resetUrl}`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset token',
            message
        });
        res.status(200).json({ succes: true, data: 'email sent !' })
    } catch (e) {
        console.log(e);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorResponse(`email coulnt be sent`, 500));
    }
    
}

async function resetPw(req, res, next) {
    const resetPasswordToken = crypto.createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');
    
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
        return next(new ErrorResponse('invalid token', 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
}

async function updateUserDetails(req, res, next) {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
        });
    res.status(200).json({succes: true, data: user})   
}

async function updatePassword(req, res, next) {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse(`Password is incorrect`, 401))
    }
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
}

module.exports = {
    register,
    login,
    logout,
    getMe,
    forgotPw,
    resetPw,
    updateUserDetails,
    updatePassword
};