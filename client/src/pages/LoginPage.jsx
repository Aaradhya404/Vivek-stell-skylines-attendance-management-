import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, clearAuthError } from '../features/auth/authSlice';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { Building2, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setToastMessage({ message: error, type: 'error' });
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setToastMessage({ message: 'Please enter both username/email and password.', type: 'error' });
      return;
    }
    dispatch(loginAdmin({ username, password }));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
      >
        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20 shadow-inner">
            <Building2 size={36} className="text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">VIVEK STEEL SKYLINES</h2>
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mt-1">Attendance Management</p>
        </div>

        {/* Form area */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h3 className="text-slate-800 font-extrabold text-lg">Admin Authentication</h3>
            <p className="text-slate-400 text-xs mt-1">Please sign in to manage operations</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Username or Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="dharmendra"
                  disabled={status === 'loading'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={status === 'loading'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              loading={status === 'loading'}
              className="w-full py-3 rounded-xl text-sm mt-4 font-bold shadow-lg shadow-blue-500/20"
            >
              Sign In
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            © {new Date().getFullYear()} Vivek Steels Skyline Private Limited.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
