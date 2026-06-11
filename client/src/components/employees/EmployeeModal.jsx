import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const EmployeeModal = ({ isOpen, onClose, employee, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    designation: 'STAFF',
    pfNumber: '',
    uan: '',
    tic: '',
    isActive: true,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        designation: employee.designation || 'STAFF',
        pfNumber: employee.pfNumber || '',
        uan: employee.uan || '',
        tic: employee.tic || '',
        isActive: employee.isActive ?? true,
      });
    } else {
      setFormData({
        name: '',
        designation: 'STAFF',
        pfNumber: '',
        uan: '',
        tic: '',
        isActive: true,
      });
    }
    setError('');
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Employee name is required.');
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Edit Employee Details' : 'Add New Employee'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="flex flex-col space-y-1">
          <label className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="E.g. Ashish Chokare"
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Designation */}
        <div className="flex flex-col space-y-1">
          <label className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Designation</label>
          <select
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="STAFF">Staff</option>
            <option value="WORKER">Worker</option>
            <option value="DIRECTOR">Director</option>
          </select>
        </div>

        {/* PF Number */}
        <div className="flex flex-col space-y-1">
          <label className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">PF Number (Optional)</label>
          <input
            type="text"
            name="pfNumber"
            value={formData.pfNumber}
            onChange={handleChange}
            placeholder="E.g. 10025"
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* UAN */}
        <div className="flex flex-col space-y-1">
          <label className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">UAN (Optional)</label>
          <input
            type="text"
            name="uan"
            value={formData.uan}
            onChange={handleChange}
            placeholder="E.g. 101823878948"
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* TIC */}
        <div className="flex flex-col space-y-1">
          <label className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">TIC (Optional)</label>
          <input
            type="text"
            name="tic"
            value={formData.tic}
            onChange={handleChange}
            placeholder="E.g. 1817064190"
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status toggler (Active/Inactive) */}
        {employee && (
          <div className="flex items-center space-x-2.5 pt-2">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <label htmlFor="isActive" className="text-slate-700 font-semibold text-xs select-none">
              Employee is Active
            </label>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Employee
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeModal;
