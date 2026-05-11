const service = require('./dashboard.service');

async function summary(req, res) {
  const { month } = req.query;
  const data = await service.getSummary(req.user._id, month);
  res.json(data);
}

module.exports = { summary };
