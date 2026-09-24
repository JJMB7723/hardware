const employeeService = require('../services/employeeService');

const getAll = async (req, res) => {
  try {
    const { department, status } = req.query;
    const employees = await employeeService.getAllEmployees(department, status);
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await employeeService.deleteEmployee(req.params.id);
    res.json({ success: true, data: employee, message: 'Employee deactivated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteEmployee
};
