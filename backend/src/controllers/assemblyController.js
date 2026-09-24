const assemblyService = require('../services/assemblyService');

const getAssemblies = async (req, res) => {
  try {
    const { status } = req.query;
    const assemblies = await assemblyService.getAssemblies(status);
    res.json({ success: true, data: assemblies });
  } 
  catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAssemblyById = async (req, res) => {
  try {
    const assembly = await assemblyService.getAssemblyById(req.params.id);
    res.json({ success: true, data: assembly });
  } 
  catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const checkAvailability = async (req, res) => {
  try {
    const result = await assemblyService.checkComponentAvailability();
    res.json({ success: true, data: result });
  }
  catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const executeAssembly = async (req, res) => {
  try {
    const assembly = await assemblyService.createAndExecuteAssembly(req.body);
    res.status(201).json({ success: true, data: assembly, message: 'Finished product units assembled and serialized.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAssemblies,
  getAssemblyById,
  checkAvailability,
  executeAssembly
};
