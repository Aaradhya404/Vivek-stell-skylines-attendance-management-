import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendanceByRange } from '../features/attendance/attendanceSlice';
import StatusBadge from '../components/attendance/StatusBadge';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { exportHistoryPDF } from '../utils/exportPDF';
import { exportHistoryExcel } from '../utils/exportExcel';
import { 
  FileText, 
  FileSpreadsheet, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Filter 
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const AttendanceHistoryPage = () => {
  const dispatch = useDispatch();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [desFilter, setDesFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);

  const { history, historyStatus } = useSelector((state) => state.attendance);

  const itemsPerPage = 20;

  // Years array (from 2020 to current year + 2)
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
    // Calculate start and end date for the selected month
    const start = format(new Date(selectedYear, selectedMonth - 1, 1), 'yyyy-MM-dd');
    const end = format(new Date(selectedYear, selectedMonth, 0), 'yyyy-MM-dd'); // day 0 gets last day of previous month
    dispatch(fetchAttendanceByRange({ start, end }));
    setCurrentPage(1); // Reset page on filter changes
  }, [dispatch, selectedMonth, selectedYear]);

  // Filter history records
  const filteredHistory = history.filter((row) => {
    const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDes = desFilter === 'ALL' || row.designation === desFilter;
    const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter;
    return matchesSearch && matchesDes && matchesStatus;
  });

  // Paginated records
  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleExportPDF = () => {
    if (filteredHistory.length === 0) {
      setToast({ message: 'No records to export.', type: 'error' });
      return;
    }
    const filterTitle = `(${months.find(m => m.value === selectedMonth).name} ${selectedYear})`;
    exportHistoryPDF(filteredHistory, filterTitle);
    setToast({ message: 'PDF exported successfully!', type: 'success' });
  };

  const handleExportExcel = () => {
    if (filteredHistory.length === 0) {
      setToast({ message: 'No records to export.', type: 'error' });
      return;
    }
    exportHistoryExcel(filteredHistory);
    setToast({ message: 'Excel file exported successfully!', type: 'success' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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

      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Attendance History Log</h2>
          <p className="text-xs text-slate-400 font-medium">Browse, filter, and export historical logs</p>
        </div>

        {/* Exporters */}
        <div className="flex items-center space-x-3 select-none">
          <Button
            onClick={handleExportPDF}
            variant="secondary"
            icon={FileText}
          >
            Export as PDF
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="secondary"
            icon={FileSpreadsheet}
          >
            Export as Excel
          </Button>
        </div>
      </div>

      {/* Month & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        
        {/* Month & Year Select */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-1">
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

          <div className="flex flex-col space-y-1">
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

          {/* Search bar */}
          <div className="flex flex-col space-y-1 sm:col-span-2">
            <label className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Search Employee</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="E.g. Shailesh Namdev..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 w-full"
              />
            </div>
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center space-x-4 pt-2 border-t border-slate-50">
          <div className="flex items-center space-x-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filters:</span>
          </div>

          {/* Designation */}
          <select
            value={desFilter}
            onChange={(e) => setDesFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 focus:outline-none"
          >
            <option value="ALL">All Designations</option>
            <option value="STAFF">Staff</option>
            <option value="WORKER">Worker</option>
            <option value="DIRECTOR">Director</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="FULL_LEAVE">Full Leave</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-In</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-Out</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leave Type</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody>
            {historyStatus === 'loading' ? (
              <tr>
                <td colSpan="8" className="text-center py-20 text-slate-400 text-xs font-semibold">
                  Loading records...
                </td>
              </tr>
            ) : paginatedHistory.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-20 text-slate-400 text-xs font-semibold">
                  No attendance history matching the filters.
                </td>
              </tr>
            ) : (
              paginatedHistory.map((row, idx) => (
                <tr key={row.id || idx} className="table-row">
                  <td className="table-cell font-semibold text-slate-500">{row.date}</td>
                  <td className="table-cell font-bold text-slate-800">{row.name}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.designation === 'DIRECTOR' ? 'bg-purple-100 text-purple-700' :
                      row.designation === 'STAFF' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {row.designation}
                    </span>
                  </td>
                  <td className="table-cell">{formatTime(row.checkIn)}</td>
                  <td className="table-cell">{formatTime(row.checkOut)}</td>
                  <td className="table-cell">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="table-cell">
                    {row.leaveType ? (
                      <span className="text-slate-600 font-semibold text-xs">{row.leaveType.replace('_', ' ')}</span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="table-cell max-w-xs truncate" title={row.notes || ''}>
                    <span className="text-slate-500 text-xs">{row.notes || '—'}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50 select-none">
            <span className="text-xs text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to <span className="font-bold text-slate-700">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="font-bold text-slate-700">{totalItems}</span> items
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded-lg border border-slate-200 hover:bg-white transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg border border-slate-200 hover:bg-white transition-colors disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistoryPage;
