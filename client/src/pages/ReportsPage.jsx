import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMonthlyReport } from '../features/reports/reportsSlice';
import { fetchAttendanceByRange } from '../features/attendance/attendanceSlice';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { exportMonthlyPDF } from '../utils/exportPDF';
import { exportMonthlyExcel } from '../utils/exportExcel';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { FileText, FileSpreadsheet, BarChart3, TrendingUp, Filter } from 'lucide-react';
import { format } from 'date-fns';

const ReportsPage = () => {
  const dispatch = useDispatch();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartDesFilter, setChartDesFilter] = useState('ALL'); // 'ALL' | 'STAFF' | 'WORKER' | 'DIRECTOR'
  const [toast, setToast] = useState(null);

  const { reports, totalDays, status } = useSelector((state) => state.reports);
  const { history } = useSelector((state) => state.attendance);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  useEffect(() => {
    dispatch(fetchMonthlyReport({ month: selectedMonth, year: selectedYear }));
    
    // Fetch detailed attendance for line chart trends
    const start = format(new Date(selectedYear, selectedMonth - 1, 1), 'yyyy-MM-dd');
    const end = format(new Date(selectedYear, selectedMonth, 0), 'yyyy-MM-dd');
    dispatch(fetchAttendanceByRange({ start, end }));
  }, [dispatch, selectedMonth, selectedYear]);

  // Bar Chart Data: Filter by designation to make it legible
  const barChartData = useMemo(() => {
    return reports
      .filter((row) => chartDesFilter === 'ALL' || row.designation === chartDesFilter)
      .map((row) => ({
        name: row.name.split(' ')[0], // Show first name only for chart spacing
        Present: row.present,
        Leave: row.leave,
        HalfDay: row.halfDay,
      }));
  }, [reports, chartDesFilter]);

  // Line Chart Data: Count daily trends from history
  const lineChartData = useMemo(() => {
    const days = {};
    for (let d = 1; d <= totalDays; d++) {
      days[d] = { day: `Day ${d}`, Present: 0, Leave: 0, HalfDay: 0, Absent: 0 };
    }

    history.forEach((rec) => {
      const day = new Date(rec.date).getDate();
      if (days[day]) {
        if (rec.status === 'PRESENT') days[day].Present++;
        else if (rec.status === 'FULL_LEAVE') days[day].Leave++;
        else if (rec.status === 'HALF_DAY') days[day].HalfDay++;
        else if (rec.status === 'ABSENT') days[day].Absent++;
      }
    });

    return Object.values(days);
  }, [history, totalDays]);

  const handleExportPDF = () => {
    if (reports.length === 0) {
      setToast({ message: 'No records to export.', type: 'error' });
      return;
    }
    exportMonthlyPDF(reports, selectedMonth, selectedYear);
    setToast({ message: 'Monthly PDF exported successfully!', type: 'success' });
  };

  const handleExportExcel = () => {
    if (reports.length === 0) {
      setToast({ message: 'No records to export.', type: 'error' });
      return;
    }
    // Pass history records to grid backfill detailed sheet
    exportMonthlyExcel(reports, selectedMonth, selectedYear, history);
    setToast({ message: 'Monthly Excel file exported successfully!', type: 'success' });
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Reports & Analytics</h2>
          <p className="text-xs text-slate-400 font-medium">Export and visualize company-wide monthly trends</p>
        </div>

        {/* Exporters */}
        <div className="flex items-center space-x-3 select-none">
          <Button
            onClick={handleExportPDF}
            variant="secondary"
            icon={FileText}
          >
            Export Summary PDF
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="secondary"
            icon={FileSpreadsheet}
          >
            Export Summary Excel
          </Button>
        </div>
      </div>

      {/* Select Month Control */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex flex-col space-y-1 w-full sm:w-48">
          <label className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-1 w-full sm:w-48">
          <label className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Visualization Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Present vs Leave Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="text-blue-500" size={18} />
              <h3 className="text-slate-800 font-bold text-sm tracking-wide">Present vs Leave (Monthly)</h3>
            </div>
            
            {/* Filter tab for legibility */}
            <select
              value={chartDesFilter}
              onChange={(e) => setChartDesFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-500 focus:outline-none select-none"
            >
              <option value="ALL">All (Scrollable)</option>
              <option value="STAFF">Staff Only</option>
              <option value="WORKER">Worker Only</option>
              <option value="DIRECTOR">Director Only</option>
            </select>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 500 }} />
                <Bar dataKey="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Leave" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="HalfDay" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Attendance Count Trend Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-blue-500" size={18} />
            <h3 className="text-slate-800 font-bold text-sm tracking-wide">Daily Attendance Count Trend</h3>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 500 }} />
                <Line type="monotone" dataKey="Present" stroke="#10B981" strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="HalfDay" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Leave" stroke="#EF4444" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Monthly Summary Table */}
      <div className="table-container">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-slate-800 font-bold text-sm tracking-wide">Monthly Summary Metrics Table</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sr.No</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present Days</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Half Days</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leaves</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent Days</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' ? (
              <tr>
                <td colSpan="8" className="text-center py-20 text-slate-400 text-xs font-semibold">
                  Loading report...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-20 text-slate-400 text-xs font-semibold">
                  No records to display.
                </td>
              </tr>
            ) : (
              reports.map((row) => (
                <tr key={row.employeeId} className="table-row">
                  <td className="table-cell font-semibold text-slate-500">{row.srNo}</td>
                  <td className="table-cell font-bold text-slate-800">{row.name}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.designation === 'DIRECTOR' ? 'bg-purple-100 text-purple-700' :
                      row.designation === 'STAFF' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {row.designation}
                    </span>
                  </td>
                  <td className="table-cell font-semibold text-emerald-600">{row.present}</td>
                  <td className="table-cell font-semibold text-amber-500">{row.halfDay}</td>
                  <td className="table-cell font-semibold text-rose-500">{row.leave}</td>
                  <td className="table-cell font-semibold text-slate-400">{row.absent}</td>
                  <td className="table-cell font-bold text-slate-800">{row.attendancePercentage}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
