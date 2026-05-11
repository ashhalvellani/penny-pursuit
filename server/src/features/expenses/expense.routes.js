const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const validate = require('../../middleware/validate');
const { createExpenseSchema, updateExpenseSchema } = require('./expense.schema');
const ctrl = require('./expense.controller');

const router = Router();

router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/export.csv', ctrl.exportCsv);
router.post('/', validate(createExpenseSchema), ctrl.create);
router.delete('/', ctrl.removeAll);
router.get('/:id', ctrl.get);
router.patch('/:id', validate(updateExpenseSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
