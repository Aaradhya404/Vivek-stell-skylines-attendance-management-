import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDailyAttendance, 
  markAttendanceRecord,
  fetchAttendanceByRange 
} from '../features/attendance/attendanceSlice';
import { fetchEmployees } from '../features/employees/employeesSlice';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/attendance/StatusBadge';
import Toast from '../components/ui/Toast';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  CalendarX, 
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Check
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const [toast, setToast] = useState(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Redux selectors
  const { dailyAttendance, history, status } = useSelector((state) => state.attendance);
  const { employees } = useSelector((state) => state.employees);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchDailyAttendance(todayStr));
    
    // Fetch last 10 days of range for activity log
    const startDate = format(subDays(new Date(), 10), 'yyyy-MM-dd');
    dispatch(fetchAttendanceByRange({ start: startDate, end: todayStr }));
  }, [dispatch, todayStr]);

  // Statistics calculations
  const totalEmployeesCount = employees.filter(e => e.isActive).length;
  
  // Count counts from dailyAttendance
  const presentCount = dailyAttendance.filter(r => r.status === 'PRESENT').length;
  const leaveCount = dailyAttendance.filter(r => r.status === 'FULL_LEAVE').length;
  const halfDayCount = dailyAttendance.filter(r => r.status === 'HALF_DAY').length;
  const absentCount = dailyAttendance.filter(r => r.status === 'ABSENT').length;

  // Recent activity: get history, sort by markedAt descending, take top 10
  const recentActivities = [...history]
    .filter(h => h.markedAt)
    .sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt))
    .slice(0, 10);

  // Quick mark a single employee
  const handleQuickMark = async (employeeId, statusVal) => {
    const record = {
      employeeId,
      date: todayStr,
      status: statusVal,
      checkIn: statusVal === 'PRESENT' || statusVal === 'HALF_DAY' ? '09:00' : null,
      checkOut: statusVal === 'PRESENT' || statusVal === 'HALF_DAY' ? '17:00' : null,
      leaveType: statusVal === 'HALF_DAY' ? 'HALF_DAY' : statusVal === 'FULL_LEAVE' ? 'FULL_DAY' : null,
      notes: `Quick marked as ${statusVal}`
    };

    try {
      await dispatch(markAttendanceRecord(record)).unwrap();
      dispatch(fetchDailyAttendance(todayStr));
      // Refresh activity log
      const startDate = format(subDays(new Date(), 10), 'yyyy-MM-dd');
      dispatch(fetchAttendanceByRange({ start: startDate, end: todayStr }));
      setToast({ message: 'Attendance marked successfully', type: 'success' });
    } catch (err) {
      setToast({ message: err || 'Failed to mark attendance', type: 'error' });
    }
  };

  // Bulk mark all active employees as present
  const handleMarkAllPresent = async () => {
    const unmarkedRecords = dailyAttendance
      .filter(r => r.status === 'ABSENT' && !r.isMarked) // Mark those not marked
      .map(r => ({
        employeeId: r.employeeId,
        date: todayStr,
        status: 'PRESENT',
        checkIn: '09:00',
        checkOut: '17:00',
        notes: 'Bulk marked Present'
      }));

    if (unmarkedRecords.length === 0) {
      setToast({ message: 'All employees are already marked for today.', type: 'error' });
      return;
    }

    try {
      await dispatch(markAttendanceRecord({ records: unmarkedRecords })).unwrap();
      dispatch(fetchDailyAttendance(todayStr));
      
      const startDate = format(subDays(new Date(), 10), 'yyyy-MM-dd');
      dispatch(fetchAttendanceByRange({ start: startDate, end: todayStr }));
      setToast({ message: `Successfully marked ${unmarkedRecords.length} employees as Present.`, type: 'success' });
    } catch (err) {
      setToast({ message: err || 'Bulk action failed', type: 'error' });
    }
  };

  const getDesignationBadge = (des) => {
    if (des === 'DIRECTOR') return 'bg-purple-100 text-purple-700';
    if (des === 'STAFF') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-700';
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

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Dashboard</h2>
        <p className="text-xs text-slate-400 font-medium">Real-time attendance monitor and quick-controls</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Active Employees" value={totalEmployeesCount} icon={Users} color="blue" delay={0} />
        <StatCard title="Present Today" value={presentCount} icon={CheckCircle} color="emerald" delay={1} />
        <StatCard title="Half Day Today" value={halfDayCount} icon={Clock} color="amber" delay={2} />
        <StatCard title="On Leave Today" value={leaveCount} icon={CalendarX} color="rose" delay={3} />
        <StatCard title="Absent Today" value={absentCount} icon={AlertCircle} color="slate" delay={4} />
      </div>

      {/* Main Grid: Quick Mark Panel & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Quick Mark Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-[550px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-800 font-bold text-sm tracking-wide">Today's Quick Mark Panel</h3>
              <p className="text-[11px] text-slate-400 font-medium">Single-click today's status updates</p>
            </div>
            <button
              onClick={handleMarkAllPresent}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white rounded-lg text-xs font-bold shadow-sm"
            >
              <Check size={14} />
              <span>Mark All Present</span>
            </button>
          </div>

          {/* Quick Mark Table Container */}
          <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sr.No</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Quick Mark</th>
                </tr>
              </thead>
              <tbody>
                {status === 'loading' && dailyAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400 text-xs font-semibold">
                      Loading employee records...
                    </td>
                  </tr>
                ) : dailyAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400 text-xs font-semibold">
                      No active employees found.
                    </td>
                  </tr>
                ) : (
                  dailyAttendance.map((row) => (
                    <tr key={row.employeeId} className="border-b border-slate-50 hover:bg-blue-50/10">
                      <td className="px-4 py-2.5 text-xs font-semibold text-slate-500">{row.srNo}</td>
                      <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{row.name}</td>
                      <td className="px-4 py-2.5 text-xs">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getDesignationBadge(row.designation)}`}>
                          {row.designation}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-2.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleQuickMark(row.employeeId, 'PRESENT')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded text-[10px] font-bold border border-emerald-200 transition-colors"
                          title="Mark Present"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleQuickMark(row.employeeId, 'HALF_DAY')}
                          className="px-2 py-1 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded text-[10px] font-bold border border-amber-200 transition-colors"
                          title="Mark Half Day"
                        >
                          Half Day
                        </button>
                        <button
                          onClick={() => handleQuickMark(row.employeeId, 'FULL_LEAVE')}
                          className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-[10px] font-bold border border-rose-200 transition-colors"
                          title="Mark Leave"
                        >
                          Leave
                        </button>
                        <button
                          onClick={() => handleQuickMark(row.employeeId, 'ABSENT')}
                          className="px-2 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded text-[10px] font-bold border border-slate-200 transition-colors"
                          title="Mark Absent"
                        >
                          Absent
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Activity Log (1/3 width) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-[550px]">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="text-blue-500" size={18} />
            <div>
              <h3 className="text-slate-800 font-bold text-sm tracking-wide">Recent Activity Log</h3>
              <p className="text-[11px] text-slate-400 font-medium">Last 10 attendance logs taken</p>
            </div>
          </div>

          {/* Log List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {recentActivities.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-xs font-semibold">
                No recent actions recorded yet.
              </div>
            ) : (
              recentActivities.map((act, index) => {
                const markTime = new Date(act.markedAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });
                return (
                  <div key={act.id || index} className="flex items-start space-x-3 p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      act.status === 'PRESENT' ? 'bg-emerald-500' :
                      act.status === 'HALF_DAY' ? 'bg-amber-500' :
                      act.status === 'FULL_LEAVE' ? 'bg-rose-500' : 'bg-slate-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{act.name}</h4>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">{markTime}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Marked <span className="font-bold text-slate-700">{act.status.replace('_', ' ')}</span> on {act.date}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
