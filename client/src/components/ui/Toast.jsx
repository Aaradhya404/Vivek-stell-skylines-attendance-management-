import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      icon: <CheckCircle className="text-emerald-500" size={18} />,
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: <XCircle className="text-red-500" size={18} />,
    },
  };

  const current = config[type] || config.success;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-lg ${current.bg} ${current.text} max-w-sm`}
      >
        <div>{current.icon}</div>
        <p className="text-xs font-semibold flex-1 leading-snug">{message}</p>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-200/50"
        >
          <X size={14} />
        </button>
      </motion.div>
    </div>
  );
};

export default Toast;
