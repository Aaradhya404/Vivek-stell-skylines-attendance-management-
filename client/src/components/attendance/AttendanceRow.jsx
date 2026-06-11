import React from 'react';
import { Check, Save } from 'lucide-react';
import TimePicker from './TimePicker';

const AttendanceRow = ({ row, onSaveRow, onLocalChange }) => {
  const {
    srNo,
    name,
    designation,
    status,
    checkIn,
    checkOut,
    leaveType,
    notes,
    isDirty,
    isMarked
  } = row;

  // Handle status update
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const updates = { status: newStatus };

    // Default checkIn/checkOut times if changing to PRESENT or HALF_DAY
    if (newStatus === 'PRESENT' || newStatus === 'HALF_DAY') {
      if (!checkIn) updates.checkIn = '09:00';
      if (!checkOut) updates.checkOut = '17:00';
    } else {
      updates.checkIn = null;
      updates.checkOut = null;
    }

    // Default leaveType
    if (newStatus === 'HALF_DAY') {
      updates.leaveType = 'HALF_DAY';
    } else if (newStatus === 'FULL_LEAVE') {
      updates.leaveType = 'FULL_DAY';
    } else {
      updates.leaveType = null;
    }

    onLocalChange(row.employeeId, updates);
  };

  const handleFieldChange = (field, value) => {
    onLocalChange(row.employeeId, { [field]: value });
  };

  const showTime = status === 'PRESENT' || status === 'HALF_DAY';
  const showLeave = status === 'HALF_DAY' || status === 'FULL_LEAVE';

  return (
    <tr className={`table-row ${isDirty ? 'bg-amber-50/40 hover:bg-amber-50/60' : ''}`}>
      <td className="table-cell font-semibold text-slate-500 w-16">{srNo}</td>
      <td className="table-cell font-bold text-slate-800">{name}</td>
      <td className="table-cell">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          designation === 'DIRECTOR' ? 'bg-purple-100 text-purple-700' :
          designation === 'STAFF' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
        }`}>
          {designation}
        </span>
      </td>
      <td className="table-cell">
        <select
          value={status}
          onChange={handleStatusChange}
          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
        >
          <option value="PRESENT">Present</option>
          <option value="HALF_DAY">Half Day</option>
          <option value="FULL_LEAVE">Full Leave</option>
          <option value="ABSENT">Absent</option>
        </select>
      </td>
      <td className="table-cell min-w-[100px]">
        {showTime ? (
          <TimePicker
            value={checkIn}
            onChange={(val) => handleFieldChange('checkIn', val)}
          />
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </td>
      <td className="table-cell min-w-[100px]">
        {showTime ? (
          <TimePicker
            value={checkOut}
            onChange={(val) => handleFieldChange('checkOut', val)}
          />
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </td>
      <td className="table-cell min-w-[120px]">
        {showLeave ? (
          <select
            value={leaveType || ''}
            onChange={(e) => handleFieldChange('leaveType', e.target.value)}
            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="HALF_DAY">Half Day</option>
            <option value="FULL_DAY">Full Day</option>
          </select>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </td>
      <td className="table-cell">
        <input
          type="text"
          value={notes || ''}
          placeholder="Add optional notes..."
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 w-44"
        />
      </td>
      <td className="table-cell text-right">
        {isDirty ? (
          <button
            onClick={() => onSaveRow(row)}
            className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center space-x-1"
            title="Save Row"
          >
            <Save size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider px-1">Save</span>
          </button>
        ) : isMarked ? (
          <div className="flex items-center justify-end text-emerald-600 space-x-1 font-semibold text-xs pr-4 select-none">
            <Check size={16} />
            <span>Saved</span>
          </div>
        ) : (
          <span className="text-slate-400 text-xs pr-6 select-none">Unmarked</span>
        )}
      </td>
    </tr>
  );
};

export default AttendanceRow;
