const dashboardService = require('../services/dashboardService');

const getMetrics = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMetrics
};
