const prisma = require('../config/db');
const { startOfMonth, endOfMonth, eachDayOfInterval, format } = require('date-fns');

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month (1-12) and Year parameters are required' });
    }

    const m = parseInt(month) - 1; // JS date months are 0-11
    const y = parseInt(year);

    if (isNaN(m) || m < 0 || m > 11 || isNaN(y)) {
      return res.status(400).json({ success: false, message: 'Invalid Month or Year value' });
    }

    const startDate = new Date(Date.UTC(y, m, 1));
    const endDate = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));

    // Get all employees
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { srNo: 'asc' }
    });

    // Get all attendance for the month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Build map for quick access
    // key: employeeId_day
    const attendanceMap = {};
    attendanceRecords.forEach(att => {
      const day = att.date.getUTCDate();
      attendanceMap[`${att.employeeId}_${day}`] = att;
    });

    const totalDaysInMonth = endDate.getUTCDate();
    const reports = employees.map(emp => {
      let present = 0;
      let halfDay = 0;
      let leave = 0;
      let absent = 0;

      for (let d = 1; d <= totalDaysInMonth; d++) {
        const att = attendanceMap[`${emp.id}_${d}`];
        if (att) {
          if (att.status === 'PRESENT') present++;
          else if (att.status === 'HALF_DAY') halfDay++;
          else if (att.status === 'FULL_LEAVE') leave++;
          else if (att.status === 'ABSENT') absent++;
        } else {
          // If no record exists in the DB, it's counted as absent
          absent++;
        }
      }

      const totalMarked = present + halfDay + leave + absent;
      const attendancePercentage = totalMarked > 0
        ? Math.round(((present + (halfDay * 0.5)) / totalMarked) * 100)
        : 0;

      return {
        employeeId: emp.id,
        srNo: emp.srNo,
        name: emp.name,
        designation: emp.designation,
        present,
        halfDay,
        leave,
        absent,
        attendancePercentage
      };
    });

    res.status(200).json({
      success: true,
      data: {
        reports,
        totalDays: totalDaysInMonth
      },
      message: 'Monthly report generated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Excel CSV Export endpoint
exports.exportExcel = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).send('Month and Year are required');
    }

    const m = parseInt(month) - 1;
    const y = parseInt(year);
    const startDate = new Date(Date.UTC(y, m, 1));
    const endDate = new Date(Date.UTC(y, m + 1, 0));
    const totalDays = endDate.getUTCDate();

    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { srNo: 'asc' }
    });

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    });

    const attendanceMap = {};
    attendanceRecords.forEach(att => {
      const day = att.date.getUTCDate();
      attendanceMap[`${att.employeeId}_${day}`] = att;
    });

    // Create CSV content
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += `Vivek Steel Skylines — Attendance Report for ${month}/${year}\n`;
    csv += 'Sr.No,Name,Designation,Present,Half Day,Leave,Absent,Attendance %\n';

    employees.forEach(emp => {
      let present = 0;
      let halfDay = 0;
      let leave = 0;
      let absent = 0;

      for (let d = 1; d <= totalDays; d++) {
        const att = attendanceMap[`${emp.id}_${d}`];
        if (att) {
          if (att.status === 'PRESENT') present++;
          else if (att.status === 'HALF_DAY') halfDay++;
          else if (att.status === 'FULL_LEAVE') leave++;
          else if (att.status === 'ABSENT') absent++;
        } else {
          absent++;
        }
      }

      const totalMarked = present + halfDay + leave + absent;
      const pct = totalMarked > 0 ? Math.round(((present + (halfDay * 0.5)) / totalMarked) * 100) : 0;

      csv += `${emp.srNo},"${emp.name.replace(/"/g, '""')}",${emp.designation},${present},${halfDay},${leave},${absent},${pct}%\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=VSS_Attendance_Report_${month}_${year}.csv`);
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};

// PDF CSV Export endpoint (alternative simple response or JSON)
exports.exportPDF = async (req, res, next) => {
  // Let's redirect to JSON response, since the frontend generates the PDF using jspdf.
  // Or send HTML report that prints beautifully.
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).send('Month and Year are required');
    }

    const m = parseInt(month) - 1;
    const y = parseInt(year);
    const startDate = new Date(Date.UTC(y, m, 1));
    const endDate = new Date(Date.UTC(y, m + 1, 0));
    const totalDays = endDate.getUTCDate();

    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { srNo: 'asc' }
    });

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    });

    const attendanceMap = {};
    attendanceRecords.forEach(att => {
      const day = att.date.getUTCDate();
      attendanceMap[`${att.employeeId}_${day}`] = att;
    });

    let html = `
      <html>
        <head>
          <title>Attendance Report - ${month}/${year}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { color: #1E40AF; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #2563EB; color: white; }
            tr:nth-child(even) { background-color: #EFF6FF; }
          </style>
        </head>
        <body onload="window.print()">
          <h1>Vivek Steels Skyline Private Limited</h1>
          <p><strong>Attendance Summary for:</strong> ${month}/${year}</p>
          <table>
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Present</th>
                <th>Half Day</th>
                <th>Leave</th>
                <th>Absent</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
    `;

    employees.forEach(emp => {
      let present = 0;
      let halfDay = 0;
      let leave = 0;
      let absent = 0;

      for (let d = 1; d <= totalDays; d++) {
        const att = attendanceMap[`${emp.id}_${d}`];
        if (att) {
          if (att.status === 'PRESENT') present++;
          else if (att.status === 'HALF_DAY') halfDay++;
          else if (att.status === 'FULL_LEAVE') leave++;
          else if (att.status === 'ABSENT') absent++;
        } else {
          absent++;
        }
      }

      const totalMarked = present + halfDay + leave + absent;
      const pct = totalMarked > 0 ? Math.round(((present + (halfDay * 0.5)) / totalMarked) * 100) : 0;

      html += `
        <tr>
          <td>${emp.srNo}</td>
          <td>${emp.name}</td>
          <td>${emp.designation}</td>
          <td>${present}</td>
          <td>${halfDay}</td>
          <td>${leave}</td>
          <td>${absent}</td>
          <td>${pct}%</td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (err) {
    next(err);
  }
};
