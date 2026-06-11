import React from 'react';

const StatusBadge = ({ status }) => {
  const configs = {
    PRESENT: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      label: 'Present',
    },
    HALF_DAY: {
      bg: 'bg-amber-50 text-amber-700 border-amber-100',
      label: 'Half Day',
    },
    FULL_LEAVE: {
      bg: 'bg-rose-50 text-rose-700 border-rose-100',
      label: 'Full Leave',
    },
    ABSENT: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      label: 'Absent',
    },
  };

  const current = configs[status] || configs.ABSENT;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'PRESENT' ? 'bg-emerald-500' :
        status === 'HALF_DAY' ? 'bg-amber-500' :
        status === 'FULL_LEAVE' ? 'bg-rose-500' : 'bg-slate-400'
      }`} />
      {current.label}
    </span>
  );
};

export default StatusBadge;
