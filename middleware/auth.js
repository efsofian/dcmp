const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

async function protect(req, res, next) {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
     } // else if (req.cookies.token) {
    //     token = req.cookies.token;  // same thing as below, but without using cookieParser
    // }
    if (!token) {
        next(new ErrorResponse('Not authorize to access this route', 401));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = await User.findById(decoded.id);
        next();
    } catch (e) {
        next(new ErrorResponse('Not authorize to access this route', 401));
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            next(new ErrorResponse(`User role: ${req.user.role} is not authorized to access this route`, 403));
        }
        next();
    }
}

module.exports = { protect , authorize };