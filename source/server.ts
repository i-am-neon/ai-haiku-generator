import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import mongoose, { CallbackError } from 'mongoose';
import dotenv from 'dotenv';
import passportLocal from 'passport-local';
import passport from 'passport';
import bcrypt from 'bcrypt';
import routes from './routes/arweaveRoutes';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import User, { UserInterface } from './models/User';

dotenv.config();

if (!process.env.NODE_ENV || !process.env.SESSION_SECRET || !process.env.MONGO_CONNECTION_STRING) {
    throw new Error("please set all env variables")
}

/** Connect to MongoDB */
mongoose.connect(process.env.MONGO_CONNECTION_STRING, (error: CallbackError) => {
    if (error) console.error(error);
    console.log('Connected to MongoDB');
});

const router: Express = express();

router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

router.use(cookieParser(process.env.SESSION_SECRET));

/** Logging */
router.use(morgan('dev'));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

/** RULES OF OUR API */
router.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN);
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', '*');
        return res.status(200).json({});
    }
    next();
});

/** Routes */
router.use('/', routes);

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});

router.use(passport.initialize());
router.use(passport.session);
require('./passportConfig')(passport);

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 6060;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));