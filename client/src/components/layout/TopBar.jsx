import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, Calendar, User } from 'lucide-react';

const TopBar = () => {
  const { admin } = useSelector((state) => state.auth);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Capitalize name for greeting
  const adminName = admin?.username 
    ? admin.username.charAt(0).toUpperCase() + admin.username.slice(1) 
    : 'Dharmendra';

  const formattedDate = time.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm fixed top-0 right-0 left-64 z-10">
      {/* Greeting */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
          {adminName.charAt(0)}
        </div>
        <div>
          <h2 className="text-slate-800 font-semibold text-sm leading-tight">
            {getGreeting()}, {adminName}
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">Vivek Steels Skyline Portal</p>
        </div>
      </div>

      {/* Date and Ticking Time */}
      <div className="flex items-center space-x-6 text-sm text-slate-600">
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <Calendar size={16} className="text-blue-500" />
          <span className="font-medium text-xs text-slate-600">{formattedDate}</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 min-w-[110px]">
          <Clock size={16} className="text-blue-500" />
          <span className="font-semibold text-xs text-slate-700 tracking-wider tabular-nums">{formattedTime}</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
