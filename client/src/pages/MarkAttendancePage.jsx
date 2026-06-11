import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDailyAttendance, 
  markAttendanceRecord,
  updateLocalAttendanceRow,
  resetDailyStatus
} from '../features/attendance/attendanceSlice';
import AttendanceRow from '../components/attendance/AttendanceRow';
import Toast from '../components/ui/Toast';
import Button from '../components/ui/Button';
import { Search, Save, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';

const MarkAttendancePage = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'STAFF' | 'WORKER' | 'DIRECTOR'
  const [toast, setToast] = useState(null);

  const { dailyAttendance, status, error } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchDailyAttendance(selectedDate));
  }, [dispatch, selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Capture local unsaved edits in redux slice
  const handleLocalRowChange = (employeeId, changes) => {
    dispatch(updateLocalAttendanceRow({ employeeId, changes }));
  };

  // Save a single row to the server
  const handleSaveRow = async (row) => {
    const record = {
      employeeId: row.employeeId,
      date: selectedDate,
      status: row.status,
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      leaveType: row.leaveType,
      notes: row.notes
    };

    try {
      await dispatch(markAttendanceRecord(record)).unwrap();
      dispatch(fetchDailyAttendance(selectedDate));
      setToast({ message: `${row.name}'s attendance saved.`, type: 'success' });
    } catch (err) {
      setToast({ message: err || 'Failed to save attendance', type: 'error' });
    }
  };

  // Save all dirty/edited rows globally
  const handleSaveAll = async () => {
    const dirtyRows = dailyAttendance.filter((r) => r.isDirty);
    
    if (dirtyRows.length === 0) {
      setToast({ message: 'No unsaved changes to record.', type: 'error' });
      return;
    }

    const records = dirtyRows.map((row) => ({
      employeeId: row.employeeId,
      date: selectedDate,
      status: row.status,
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      leaveType: row.leaveType,
      notes: row.notes
    }));

    try {
      await dispatch(markAttendanceRecord({ records })).unwrap();
      dispatch(fetchDailyAttendance(selectedDate));
      setToast({ message: `Successfully saved ${records.length} changes.`, type: 'success' });
    } catch (err) {
      setToast({ message: err || 'Failed to save bulk changes', type: 'error' });
    }
  };

  // Filter records based on active designation tab and search query
  const filteredRows = dailyAttendance.filter((row) => {
    const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'ALL' || row.designation === activeTab;
    return matchesSearch && matchesTab;
  });

  const dirtyCount = dailyAttendance.filter((r) => r.isDirty).length;

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Mark Daily Attendance</h2>
          <p className="text-xs text-slate-400 font-medium">Record working times and leaves for any day</p>
        </div>
        
        {/* Date Picker */}
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm max-w-xs select-none">
          <Calendar size={16} className="text-blue-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="text-xs font-semibold text-slate-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search employees by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200/50 self-start md:self-auto select-none">
          {['ALL', 'STAFF', 'WORKER', 'DIRECTOR'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bulk Save Actions */}
        <div className="flex items-center space-x-3 self-end md:self-auto">
          {dirtyCount > 0 && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 select-none animate-pulse">
              {dirtyCount} unsaved row(s)
            </span>
          )}
          <Button
            onClick={handleSaveAll}
            variant={dirtyCount > 0 ? 'primary' : 'secondary'}
            disabled={dirtyCount === 0 || status === 'loading'}
            icon={Save}
          >
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="table-container max-h-[60vh] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sr.No</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-In</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-Out</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leave Type</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' && filteredRows.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-20 text-slate-400 text-xs font-semibold">
                  Loading attendance records...
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-20 text-slate-400 text-xs font-semibold">
                  No matching employees found.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <AttendanceRow
                  key={row.employeeId}
                  row={row}
                  onSaveRow={handleSaveRow}
                  onLocalChange={handleLocalRowChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarkAttendancePage;
