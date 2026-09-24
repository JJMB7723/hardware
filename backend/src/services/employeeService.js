const prisma = require('../config/prisma');

const getAllEmployees = async (department = null, status = null) => {
  const where = {};
  if (department && department !== 'ALL') {
    where.department = department;
  }
  if (status && status !== 'ALL') {
    where.status = status;
  }

  return await prisma.employee.findMany({
    where,
    orderBy: { id: 'asc' }
  });
};

const getEmployeeById = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: { id }
  });
  if (!employee) {
    throw new Error(`Employee ${id} not found`);
  }
  return employee;
};

const createEmployee = async (data) => {
  const count = await prisma.employee.count();
  const id = data.id || `EMP-${String(count + 1).padStart(3, '0')}`;

  return await prisma.employee.create({
    data: {
      id,
      name: data.name,
      email: data.email,
      phone: data.phone || 'N/A',
      department: data.department || 'Administration',
      role: data.role || 'Staff Member',
      status: data.status || 'ACTIVE',
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date()
    }
  });
};

const updateEmployee = async (id, data) => {
  return await prisma.employee.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      department: data.department,
      role: data.role,
      status: data.status
    }
  });
};

const deleteEmployee = async (id) => {
  // Non-destructive deactivation if related records exist, or deletion
  return await prisma.employee.update({
    where: { id },
    data: { status: 'INACTIVE' }
  });
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
