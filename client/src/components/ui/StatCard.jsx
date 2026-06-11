import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color = 'blue', delay = 0 }) => {
  const colorConfigs = {
    blue: {
      bg: 'bg-blue-50 border-blue-100',
      iconBg: 'bg-blue-500',
      text: 'text-blue-600',
      iconText: 'text-white',
    },
    emerald: {
      bg: 'bg-emerald-50 border-emerald-100',
      iconBg: 'bg-emerald-500',
      text: 'text-emerald-600',
      iconText: 'text-white',
    },
    amber: {
      bg: 'bg-amber-50 border-amber-100',
      iconBg: 'bg-amber-500',
      text: 'text-amber-600',
      iconText: 'text-white',
    },
    rose: {
      bg: 'bg-rose-50 border-rose-100',
      iconBg: 'bg-rose-500',
      text: 'text-rose-600',
      iconText: 'text-white',
    },
    slate: {
      bg: 'bg-slate-100 border-slate-200',
      iconBg: 'bg-slate-500',
      text: 'text-slate-600',
      iconText: 'text-white',
    },
  };

  const current = colorConfigs[color] || colorConfigs.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      className={`border rounded-2xl p-5 flex items-center justify-between shadow-sm bg-white hover:shadow transition-shadow duration-200`}
    >
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
      </div>
      <div className={`${current.iconBg} ${current.iconText} p-3 rounded-xl shadow-inner`}>
        <Icon size={20} />
      </div>
    </motion.div>
  );
};

export default StatCard;
