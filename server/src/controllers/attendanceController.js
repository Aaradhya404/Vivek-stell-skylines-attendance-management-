const Joi = require('joi');
const prisma = require('../config/db');

// Validation schemas
const attendanceRecordSchema = Joi.object({
  employeeId: Joi.number().integer().required(),
  date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(), // YYYY-MM-DD
  checkIn: Joi.string().allow(null, ''), // HH:MM or ISO
  checkOut: Joi.string().allow(null, ''), // HH:MM or ISO
  status: Joi.string().valid('PRESENT', 'HALF_DAY', 'FULL_LEAVE', 'ABSENT').required(),
  leaveType: Joi.string().valid('HALF_DAY', 'FULL_DAY').allow(null, ''),
  notes: Joi.string().allow(null, '')
});

const bulkAttendanceSchema = Joi.object({
  records: Joi.array().items(attendanceRecordSchema).required()
});

// Helper to parse date string YYYY-MM-DD safely into JS Date
const parseDateString = (dateStr) => {
  return new Date(`${dateStr}T00:00:00.000Z`);
};

// Helper to format ISO time or simple HH:MM to JS Date for checkIn/checkOut
const parseTime = (dateStr, timeStr) => {
  if (!timeStr) return null;
  // If timeStr is already a full ISO string, return it
  if (timeStr.includes('T')) return new Date(timeStr);
  
  // If timeStr is HH:MM, merge with dateStr
  return new Date(`${dateStr}T${timeStr}:00.000Z`);
};

exports.getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required (YYYY-MM-DD)' });
    }

    const parsedDate = parseDateString(date);

    // Fetch all employees and join with their attendance for this date
    // This allows the frontend to show all employees, even those with no marked attendance yet.
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { srNo: 'asc' },
      include: {
        attendance: {
          where: { date: parsedDate }
        }
      }
    });

    // Format the response
    const data = employees.map(emp => {
      const att = emp.attendance[0] || null;
      return {
        employeeId: emp.id,
        srNo: emp.srNo,
        name: emp.name,
        designation: emp.designation,
        isActive: emp.isActive,
        attendanceId: att ? att.id : null,
        date: date,
        status: att ? att.status : 'ABSENT', // Default to ABSENT if not marked
        checkIn: att ? att.checkIn : null,
        checkOut: att ? att.checkOut : null,
        leaveType: att ? att.leaveType : null,
        notes: att ? att.notes : '',
        isMarked: att !== null
      };
    });

    res.status(200).json({
      success: true,
      data,
      message: 'Attendance list retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceByEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employeeId = parseInt(id);
    if (isNaN(employeeId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID' });
    }

    const history = await prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: history,
      message: 'Employee attendance history retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceByRange = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required' });
    }

    const history = await prisma.attendance.findMany({
      where: {
        date: {
          gte: parseDateString(start),
          lte: parseDateString(end)
        }
      },
      include: {
        employee: true
      },
      orderBy: [
        { date: 'desc' },
        { employee: { srNo: 'asc' } }
      ]
    });

    const data = history.map(h => ({
      id: h.id,
      employeeId: h.employeeId,
      name: h.employee.name,
      designation: h.employee.designation,
      date: h.date.toISOString().split('T')[0],
      status: h.status,
      checkIn: h.checkIn,
      checkOut: h.checkOut,
      leaveType: h.leaveType,
      notes: h.notes,
      markedAt: h.markedAt
    }));

    res.status(200).json({
      success: true,
      data,
      message: 'Attendance history range retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Handles both single upsert and bulk upsert
exports.markAttendance = async (req, res, next) => {
  try {
    // Determine if bulk or single
    const isBulk = Array.isArray(req.body.records);
    const schema = isBulk ? bulkAttendanceSchema : attendanceRecordSchema;
    
    const { error, value } = schema.validate(req.body);
    if (error) return next(error);

    const records = isBulk ? value.records : [value];
    const results = [];

    for (const record of records) {
      const parsedDate = parseDateString(record.date);
      const parsedCheckIn = parseTime(record.date, record.checkIn);
      const parsedCheckOut = parseTime(record.date, record.checkOut);

      // Perform upsert
      const result = await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: record.employeeId,
            date: parsedDate
          }
        },
        update: {
          checkIn: parsedCheckIn,
          checkOut: parsedCheckOut,
          status: record.status,
          leaveType: record.leaveType || null,
          notes: record.notes || null,
          markedAt: new Date()
        },
        create: {
          employeeId: record.employeeId,
          date: parsedDate,
          checkIn: parsedCheckIn,
          checkOut: parsedCheckOut,
          status: record.status,
          leaveType: record.leaveType || null,
          notes: record.notes || null
        }
      });
      results.push(result);
    }

    res.status(200).json({
      success: true,
      data: isBulk ? results : results[0],
      message: 'Attendance marked successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attId = parseInt(id);
    if (isNaN(attId)) {
      return res.status(400).json({ success: false, message: 'Invalid attendance ID' });
    }

    const { error, value } = attendanceRecordSchema.validate(req.body);
    if (error) return next(error);

    const parsedDate = parseDateString(value.date);
    const parsedCheckIn = parseTime(value.date, value.checkIn);
    const parsedCheckOut = parseTime(value.date, value.checkOut);

    const updated = await prisma.attendance.update({
      where: { id: attId },
      data: {
        checkIn: parsedCheckIn,
        checkOut: parsedCheckOut,
        status: value.status,
        leaveType: value.leaveType || null,
        notes: value.notes || null,
        markedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Attendance record updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attId = parseInt(id);
    if (isNaN(attId)) {
      return res.status(400).json({ success: false, message: 'Invalid attendance ID' });
    }

    await prisma.attendance.delete({
      where: { id: attId }
    });

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
