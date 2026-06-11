import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../features/auth/authSlice';
import { fetchHolidays, addHoliday, removeHoliday } from '../features/attendance/attendanceSlice';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { Lock, Calendar, Trash2, Building2, ShieldAlert } from 'lucide-react';

const SettingsPage = () => {
  const dispatch = useDispatch();

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Holiday states
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [hLoading, setHLoading] = useState(false);

  const { holidays, holidaysStatus } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchHolidays());
  }, [dispatch]);

  // Handle password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ message: 'All fields are required.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: 'New passwords do not match.', type: 'error' });
      return;
    }

    setPwLoading(true);
    try {
      await dispatch(changePassword({ currentPassword, newPassword, confirmPassword })).unwrap();
      setToast({ message: 'Password updated successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setToast({ message: err || 'Failed to update password.', type: 'error' });
    } finally {
      setPwLoading(false);
    }
  };

  // Handle holiday submit
  const handleHolidaySubmit = async (e) => {
    e.preventDefault();
    if (!holidayName.trim() || !holidayDate) {
      setToast({ message: 'Holiday name and date are required.', type: 'error' });
      return;
    }

    setHLoading(true);
    try {
      const response = await dispatch(addHoliday({ name: holidayName, date: holidayDate })).unwrap();
      setToast({ message: 'Holiday added & leave applied to active staff.', type: 'success' });
      setHolidayName('');
      setHolidayDate('');
    } catch (err) {
      setToast({ message: err || 'Failed to add holiday.', type: 'error' });
    } finally {
      setHLoading(false);
    }
  };

  // Handle holiday removal
  const handleRemoveHoliday = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove the holiday "${name}"?`)) return;

    try {
      await dispatch(removeHoliday(id)).unwrap();
      setToast({ message: `Holiday "${name}" removed.`, type: 'success' });
    } catch (err) {
      setToast({ message: err || 'Failed to remove holiday.', type: 'error' });
    }
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
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Portal Settings</h2>
        <p className="text-xs text-slate-400 font-medium">Configure credentials, holiday calendars, and organization profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Change Password */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Lock className="text-blue-500" size={18} />
              <h3 className="text-slate-800 font-bold text-sm tracking-wide">Change Security Password</h3>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 w-full"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 w-full"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 w-full"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={pwLoading}
                className="w-full mt-2 py-2.5 rounded-xl font-bold"
              >
                Update Password
              </Button>
            </form>
          </div>

          {/* Company details display */}
          <div className="pt-6 border-t border-slate-100 flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
              <Building2 size={24} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Vivek Steels Skyline Pvt. Ltd.</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">
                Headquarters: India <br />
                System Operator Role: Single Portal Master Admin
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Public Holidays Calendar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-[520px]">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="text-blue-500" size={18} />
            <div>
              <h3 className="text-slate-800 font-bold text-sm tracking-wide">Public Holiday Calendar</h3>
              <p className="text-[11px] text-slate-400 font-medium">Holidays auto-record leave days for all staff</p>
            </div>
          </div>

          {/* Add Holiday Form inline */}
          <form onSubmit={handleHolidaySubmit} className="flex gap-3 mb-4 select-none">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Holiday label (e.g. Independence Day)"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 w-full"
              />
            </div>
            <div className="w-36">
              <input
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:bg-white w-full"
              />
            </div>
            <Button type="submit" variant="primary" loading={hLoading} className="py-2 px-4 rounded-xl">
              Add
            </Button>
          </form>

          {/* Holiday List */}
          <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl pr-1 divide-y divide-slate-50">
            {holidaysStatus === 'loading' ? (
              <div className="text-center py-20 text-slate-400 text-xs font-semibold">
                Loading holidays...
              </div>
            ) : holidays.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-xs font-semibold">
                No holidays recorded yet.
              </div>
            ) : (
              holidays.map((hol) => (
                <div key={hol.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{hol.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{hol.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveHoliday(hol.id, hol.name)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                    title="Remove Holiday"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
