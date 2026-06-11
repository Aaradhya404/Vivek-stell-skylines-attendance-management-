import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutAdmin } from '../../features/auth/authSlice';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  History, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Building2
} from 'lucide-react';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Mark Attendance', path: '/attendance/mark', icon: CalendarCheck },
    { name: 'Attendance History', path: '/attendance/history', icon: History },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-lg z-20">
      {/* Header / Brand */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide uppercase text-blue-400">Vivek Steel</h1>
          <p className="text-xs text-slate-400 font-medium">Skylines Pvt. Ltd.</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
