const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const ctrl = require('./dashboard.controller');

const router = Router();

router.use(requireAuth);
router.get('/summary', ctrl.summary);

module.exports = router;
