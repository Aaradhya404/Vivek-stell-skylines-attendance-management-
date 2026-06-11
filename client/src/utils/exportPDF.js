import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportMonthlyPDF = (reportData, month, year) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('en-IN');

  // Header Title
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175); // `#1E40AF`
  doc.setFont('Helvetica', 'bold');
  doc.text('Vivek Steels Skyline Private Limited', 14, 20);

  // Subheader
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFont('Helvetica', 'normal');
  doc.text(`Monthly Attendance Summary: ${month}/${year}`, 14, 28);
  doc.text(`Generated Date: ${dateStr}`, 14, 34);

  // Table Columns
  const tableColumns = [
    { title: 'Sr.No', dataKey: 'srNo' },
    { title: 'Employee Name', dataKey: 'name' },
    { title: 'Designation', dataKey: 'designation' },
    { title: 'Present', dataKey: 'present' },
    { title: 'Half Days', dataKey: 'halfDay' },
    { title: 'Leaves', dataKey: 'leave' },
    { title: 'Absent', dataKey: 'absent' },
    { title: 'Att. %', dataKey: 'attendancePercentage' },
  ];

  // Table Rows formatting
  const tableRows = reportData.map((row) => ({
    srNo: row.srNo,
    name: row.name,
    designation: row.designation,
    present: row.present,
    halfDay: row.halfDay,
    leave: row.leave,
    absent: row.absent,
    attendancePercentage: `${row.attendancePercentage}%`,
  }));

  // AutoTable Config
  doc.autoTable({
    startY: 40,
    columns: tableColumns,
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235], // `#2563EB`
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [239, 246, 255], // `#EFF6FF`
    },
    margin: { top: 40 },
  });

  // Footer: Admin signature line
  const finalY = doc.lastAutoTable.finalY + 30;
  
  // Page check so signature is not cut off
  const pageHeight = doc.internal.pageSize.height;
  let signatureY = finalY;
  if (finalY > pageHeight - 30) {
    doc.addPage();
    signatureY = 40;
  }

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont('Helvetica', 'normal');
  
  // Signature line on the right side
  doc.line(130, signatureY, 190, signatureY);
  doc.text('Authorized Signature', 142, signatureY + 5);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Dharmendra Singh Sisodiya (Admin)', 136, signatureY + 10);

  // Save the PDF
  doc.save(`VSS_Attendance_Summary_${month}_${year}.pdf`);
};

export const exportHistoryPDF = (historyData, filterTitle = '') => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('en-IN');

  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175); // `#1E40AF`
  doc.setFont('Helvetica', 'bold');
  doc.text('Vivek Steels Skyline Private Limited', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Attendance History Log ${filterTitle}`, 14, 28);
  doc.text(`Generated Date: ${dateStr}`, 14, 34);

  const tableColumns = [
    { title: 'Date', dataKey: 'date' },
    { title: 'Employee Name', dataKey: 'name' },
    { title: 'Designation', dataKey: 'designation' },
    { title: 'Check In', dataKey: 'checkIn' },
    { title: 'Check Out', dataKey: 'checkOut' },
    { title: 'Status', dataKey: 'status' },
    { title: 'Notes', dataKey: 'notes' },
  ];

  const formatTime = (time) => {
    if (!time) return '—';
    const date = new Date(time);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const tableRows = historyData.map((row) => ({
    date: row.date,
    name: row.name,
    designation: row.designation,
    checkIn: formatTime(row.checkIn),
    checkOut: formatTime(row.checkOut),
    status: row.status,
    notes: row.notes || '—',
  }));

  doc.autoTable({
    startY: 40,
    columns: tableColumns,
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [239, 246, 255],
    },
    margin: { top: 40 },
  });

  doc.save(`VSS_Attendance_History_${new Date().getTime()}.pdf`);
};
