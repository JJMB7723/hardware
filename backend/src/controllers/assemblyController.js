const assemblyService = require('../services/assemblyService');

class AssemblyController {
  async getAssemblies(req, res) {
    try {
      const { status } = req.query;
      const assemblies = await assemblyService.getAssemblies(status);
      res.json({ success: true, data: assemblies });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAssemblyById(req, res) {
    try {
      const assembly = await assemblyService.getAssemblyById(req.params.id);
      res.json({ success: true, data: assembly });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async checkAvailability(req, res) {
    try {
      const result = await assemblyService.checkComponentAvailability();
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async executeAssembly(req, res) {
    try {
      const assembly = await assemblyService.createAndExecuteAssembly(req.body);
      res.status(201).json({ success: true, data: assembly, message: 'Finished product units assembled and serialized.' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new AssemblyController();
