const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const { aiLimiter } = require('../../middleware/rateLimit');
const { uploadImage } = require('../../middleware/upload');
const ctrl = require('./ai.controller');

const router = Router();

router.use(requireAuth);
router.use(aiLimiter);

router.post('/categorize', ctrl.categorize);
router.post('/receipt', uploadImage.single('image'), ctrl.receipt);
router.get('/insights', ctrl.insights);

module.exports = router;
