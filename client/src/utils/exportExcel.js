import * as XLSX from 'xlsx';

export const exportMonthlyExcel = (reportData, month, year, dailyAttendanceRecords = []) => {
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Monthly Summary ---
  const summaryHeaders = [
    ['Vivek Steels Skyline Private Limited'],
    [`Monthly Attendance Summary: ${month}/${year}`],
    [],
    ['Sr.No', 'Employee Name', 'Designation', 'Present Days', 'Half Days', 'Leaves', 'Absent Days', 'Attendance %']
  ];

  const summaryRows = reportData.map((row) => [
    row.srNo,
    row.name,
    row.designation,
    row.present,
    row.halfDay,
    row.leave,
    row.absent,
    `${row.attendancePercentage}%`
  ]);

  const summarySheetData = [...summaryHeaders, ...summaryRows];
  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);

  // Apply some simple styling constraints (width adjustments)
  const scols = [
    { wch: 8 },  // Sr.No
    { wch: 30 }, // Name
    { wch: 15 }, // Designation
    { wch: 15 }, // Present
    { wch: 15 }, // Half Day
    { wch: 12 }, // Leave
    { wch: 12 }, // Absent
    { wch: 15 }  // %
  ];
  wsSummary['!cols'] = scols;

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Monthly Summary');


  // --- Sheet 2: Day-by-Day Detail ---
  // Create days array: [1, 2, ..., totalDays]
  const totalDays = new Date(year, month, 0).getDate();
  const daysHeader = [];
  for (let i = 1; i <= totalDays; i++) {
    daysHeader.push(`Day ${i}`);
  }

  const detailHeaders = [
    ['Vivek Steels Skyline Private Limited'],
    [`Day-by-Day Detailed Attendance Sheet: ${month}/${year}`],
    [],
    ['Sr.No', 'Employee Name', 'Designation', ...daysHeader]
  ];

  // Helper map to quickly find attendance status
  // Key: employeeId_day
  const attendanceMap = {};
  dailyAttendanceRecords.forEach(att => {
    const attDate = new Date(att.date);
    // Parse UTC/local day
    const day = attDate.getDate();
    attendanceMap[`${att.employeeId || att.employee?.id}_${day}`] = att.status;
  });

  const detailRows = reportData.map((emp) => {
    const row = [
      emp.srNo,
      emp.name,
      emp.designation
    ];

    // For each day, append status code
    for (let d = 1; d <= totalDays; d++) {
      const status = attendanceMap[`${emp.employeeId || emp.id}_${d}`];
      let code = '—';
      if (status === 'PRESENT') code = 'P';
      else if (status === 'HALF_DAY') code = 'HD';
      else if (status === 'FULL_LEAVE') code = 'L';
      else if (status === 'ABSENT') code = 'A';
      row.push(code);
    }
    return row;
  });

  const detailSheetData = [...detailHeaders, ...detailRows];
  const wsDetail = XLSX.utils.aoa_to_sheet(detailSheetData);

  // Width adjustments for Sheet 2
  const dcols = [
    { wch: 8 },  // Sr.No
    { wch: 30 }, // Name
    { wch: 15 }, // Designation
  ];
  for (let d = 1; d <= totalDays; d++) {
    dcols.push({ wch: 6 }); // Day columns
  }
  wsDetail['!cols'] = dcols;

  XLSX.utils.book_append_sheet(wb, wsDetail, 'Daily Attendance Grid');

  // Write files
  XLSX.writeFile(wb, `VSS_Attendance_Excel_${month}_${year}.xlsx`);
};

export const exportHistoryExcel = (historyData) => {
  const wb = XLSX.utils.book_new();

  const formatTime = (time) => {
    if (!time) return '—';
    const date = new Date(time);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const headers = [
    ['Vivek Steels Skyline Private Limited'],
    ['Attendance History Report'],
    [],
    ['Date', 'Employee Name', 'Designation', 'Check-In', 'Check-Out', 'Status', 'Notes']
  ];

  const rows = historyData.map(row => [
    row.date,
    row.name,
    row.designation,
    formatTime(row.checkIn),
    formatTime(row.checkOut),
    row.status,
    row.notes || '—'
  ]);

  const sheetData = [...headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 15 }, // Date
    { wch: 30 }, // Name
    { wch: 15 }, // Designation
    { wch: 15 }, // CheckIn
    { wch: 15 }, // CheckOut
    { wch: 15 }, // Status
    { wch: 40 }  // Notes
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Attendance History');
  XLSX.writeFile(wb, `VSS_Attendance_History_${new Date().getTime()}.xlsx`);
};
