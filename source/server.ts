import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import mongoose, { CallbackError } from 'mongoose';
import arweaveRoutes from './routes/arweaveRoutes';
import authRoutes from './routes/authRoutes';
import { MONGO_CONNECTION_STRING } from './utils/secrets';
import { generateHaiku } from './utils/generator';
import openAiRoutes from './routes/openAiRoutes';

/** Connect to MongoDB */
mongoose.connect(MONGO_CONNECTION_STRING!, (error: CallbackError) => {
    if (error) throw new Error(error.message); else console.log('Connected to MongoDB');
});

generateHaiku(
    "Flower Petals",
    "Lone flower petal\nFloats through open window\nInto another room "
);

const router: Express = express();

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
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, X-JWT-Token');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', '*');
        return res.status(200).json({});
    }
    next();
});

/** Routes */
router.use('/', authRoutes);
router.use('/', openAiRoutes);
router.use('/', arweaveRoutes);

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 6060;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));