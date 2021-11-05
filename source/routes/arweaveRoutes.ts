import express from 'express';
import controller from '../controllers/arweaveController';
import { requireJwtMiddleware } from '../middleware/jwtMiddleware';

const router = express.Router();

router.get('/nonce/:address', controller.getNonce);
router.post('/login', controller.login);

// all following routes protected by JWT middleware
router.use(requireJwtMiddleware)

router.get('/arweave', controller.getArweave);
router.put('/arweave', controller.putArweave);

export = router;