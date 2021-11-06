import express from 'express';
import controller from '../controllers/authController';

const router = express.Router();

router.get('/nonce/:address', controller.getNonce);
router.post('/login', controller.login);

export = router;