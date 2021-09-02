const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const bootcampsRouter = require('./routes/bootcamps');
const coursesRouter = require('./routes/courses');
const authsRouter = require('./routes/auths');
const usersRouter = require('./routes/users');
const reviewsRouter = require('./routes/reviews');
const errorHandler = require('./middleware/error');
const { connectDB } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'devlopment') {
    app.use(morgan('dev'));
}

app.use(helmet());
app.use(rateLimit({
    windowMs: 10 * 60 * 1000, // 10mins
    max: 50, // max nbs of req by windowMs
}));
app.use(hpp());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());
app.use(fileupload());

app.use(express.static(path.join(__dirname, 'public')));

connectDB(process.env.MONGO_URL);
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/bootcamps', bootcampsRouter);
app.use('/api/v1/courses', coursesRouter);
app.use('/api/v1/auth', authsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);

app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`server running in ${process.env.NODE_ENV} mode, on port: ${PORT}`)
});

server.on('unhandledRejection', (err, promise) => {
    console.log(`un handled rejection: ${err.message}`);
    server.close(() => process.exit(1));
});