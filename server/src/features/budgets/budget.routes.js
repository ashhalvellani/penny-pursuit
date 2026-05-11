const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const validate = require('../../middleware/validate');
const { upsertBudgetSchema, copyBudgetsSchema } = require('./budget.schema');
const ctrl = require('./budget.controller');

const router = Router();

router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', validate(upsertBudgetSchema), ctrl.upsert);
router.post('/copy-from', validate(copyBudgetsSchema), ctrl.copyFrom);
router.delete('/:id', ctrl.remove);

module.exports = router;
