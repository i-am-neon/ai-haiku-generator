import express from 'express';
import controller from '../controllers/openAiController';
import { requireJwtMiddleware } from '../middleware/jwtMiddleware';

const router = express.Router();

// all following routes protected by JWT middleware
router.use(requireJwtMiddleware)

router.put('/haiku', controller.putHaikusFromTitle);

export = router;