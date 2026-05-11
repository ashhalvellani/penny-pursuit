const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

module.exports = router;
