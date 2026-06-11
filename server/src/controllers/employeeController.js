const Joi = require('joi');
const prisma = require('../config/db');

const employeeSchema = Joi.object({
  name: Joi.string().required(),
  designation: Joi.string().valid('STAFF', 'WORKER', 'DIRECTOR').required(),
  pfNumber: Joi.string().allow(null, ''),
  uan: Joi.string().allow(null, ''),
  tic: Joi.string().allow(null, ''),
  isActive: Joi.boolean().default(true),
});

exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { srNo: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: employees,
      message: 'Employees retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const { error, value } = employeeSchema.validate(req.body);
    if (error) return next(error);

    // Calculate next srNo
    const maxSrNoEmp = await prisma.employee.findFirst({
      orderBy: { srNo: 'desc' }
    });
    const nextSrNo = maxSrNoEmp ? maxSrNoEmp.srNo + 1 : 1;

    const employee = await prisma.employee.create({
      data: {
        srNo: nextSrNo,
        name: value.name,
        designation: value.designation,
        pfNumber: value.pfNumber || null,
        uan: value.uan || null,
        tic: value.tic || null,
        isActive: value.isActive
      }
    });

    res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee created successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = employeeSchema.validate(req.body);
    if (error) return next(error);

    const employeeId = parseInt(id);
    if (isNaN(employeeId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID' });
    }

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        name: value.name,
        designation: value.designation,
        pfNumber: value.pfNumber || null,
        uan: value.uan || null,
        tic: value.tic || null,
        isActive: value.isActive
      }
    });

    res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employeeId = parseInt(id);
    if (isNaN(employeeId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID' });
    }

    const currentEmployee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!currentEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        isActive: !currentEmployee.isActive
      }
    });

    res.status(200).json({
      success: true,
      data: updatedEmployee,
      message: `Employee ${updatedEmployee.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (err) {
    next(err);
  }
};
