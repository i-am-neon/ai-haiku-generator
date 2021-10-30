import express from 'express';
import controller from '../controllers/arweaveController';
const router = express.Router();

router.get('/arweave', controller.getArweave);
router.put('/arweave', controller.putArweave);

export = router;