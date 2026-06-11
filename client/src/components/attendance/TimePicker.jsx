import React from 'react';

const TimePicker = ({ label, value, onChange }) => {
  // Convert full date/ISO to HH:MM for HTML input type="time"
  const getDisplayTime = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && val.includes('T')) {
      const date = new Date(val);
      const hrs = String(date.getUTCHours()).padStart(2, '0');
      const mins = String(date.getUTCMinutes()).padStart(2, '0');
      return `${hrs}:${mins}`;
    }
    return val; // Assume HH:MM
  };

  return (
    <div className="flex flex-col space-y-0.5">
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>}
      <input
        type="time"
        value={getDisplayTime(value)}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all select-none"
      />
    </div>
  );
};

export default TimePicker;
