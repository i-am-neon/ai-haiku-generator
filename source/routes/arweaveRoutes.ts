import express from 'express';
import passport from 'passport';
import controller from '../controllers/arweaveController';
const router = express.Router();

router.get('/nonce/:address', controller.getNonce);
router.post('/login', controller.login);
// router.post('/login', passport.authenticate('web3'), controller.login);
router.get('/arweave', controller.getArweave);
router.put('/arweave', controller.putArweave);

export = router;