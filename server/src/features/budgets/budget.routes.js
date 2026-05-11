const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const validate = require('../../middleware/validate');
const { upsertBudgetSchema } = require('./budget.schema');
const ctrl = require('./budget.controller');

const router = Router();

router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', validate(upsertBudgetSchema), ctrl.upsert);
router.delete('/:id', ctrl.remove);

module.exports = router;
