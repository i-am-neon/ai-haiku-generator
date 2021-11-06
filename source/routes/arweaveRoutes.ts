import express from 'express';
import controller from '../controllers/arweaveController';
import { requireJwtMiddleware } from '../middleware/jwtMiddleware';

const router = express.Router();

// all following routes protected by JWT middleware
router.use(requireJwtMiddleware)

router.get('/arweave', controller.getArweave);
router.put('/arweave', controller.putArweave);
router.get('/arweave/status/:txnId', controller.getStatusForArweaveTxn);

export = router;