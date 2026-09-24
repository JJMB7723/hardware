const traceabilityService = require('../services/traceabilityService');

const search = async (req, res) => {
  try {
    const result = await traceabilityService.searchTraceability(req.query.q);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const traceProduct = async (req, res) => {
  try {
    const trace = await traceabilityService.traceProduct(req.params.productId);
    res.json({ success: true, data: trace });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const traceComponent = async (req, res) => {
  try {
    const trace = await traceabilityService.traceComponent(req.params.componentId);
    res.json({ success: true, data: trace });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const traceBatch = async (req, res) => {
  try {
    const trace = await traceabilityService.traceBatch(req.params.batchId);
    res.json({ success: true, data: trace });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const traceAssembly = async (req, res) => {
  try {
    const trace = await traceabilityService.traceAssembly(req.params.assemblyId);
    res.json({ success: true, data: trace });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 100);
    const events = await traceabilityService.getAllEvents(limit);
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  search,
  traceProduct,
  traceComponent,
  traceBatch,
  traceAssembly,
  getEvents
};
