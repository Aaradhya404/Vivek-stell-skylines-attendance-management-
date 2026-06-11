import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchEmployees, 
  addEmployee, 
  updateEmployee, 
  toggleEmployeeActive 
} from '../features/employees/employeesSlice';
import EmployeeModal from '../components/employees/EmployeeModal';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { UserPlus, Pencil, ShieldAlert, ShieldCheck, Search } from 'lucide-react';

const EmployeesPage = () => {
  const dispatch = useDispatch();
  const { employees, status } = useSelector((state) => state.employees);

  const [searchQuery, setSearchQuery] = useState('');
  const [desFilter, setDesFilter] = useState('ALL');
  
  // Modal controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (formData) => {
    try {
      if (editingEmployee) {
        // Edit mode
        await dispatch(
          updateEmployee({ id: editingEmployee.id, employeeData: formData })
        ).unwrap();
        setToast({ message: 'Employee updated successfully.', type: 'success' });
      } else {
        // Add mode
        await dispatch(addEmployee(formData)).unwrap();
        setToast({ message: 'Employee added successfully.', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      setToast({ message: err || 'Failed to save employee data.', type: 'error' });
    }
  };

  const handleToggleStatus = async (id, name, currentActive) => {
    try {
      await dispatch(toggleEmployeeActive(id)).unwrap();
      setToast({ 
        message: `${name} is now ${currentActive ? 'Deactivated' : 'Activated'}.`, 
        type: 'success' 
      });
    } catch (err) {
      setToast({ message: err || 'Failed to update employee status.', type: 'error' });
    }
  };

  // Filter calculations
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDes = desFilter === 'ALL' || emp.designation === desFilter;
    return matchesSearch && matchesDes;
  });

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={editingEmployee}
        onSave={handleSaveEmployee}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Employee Database</h2>
          <p className="text-xs text-slate-400 font-medium">Manage all workers, staff, and directors in the registry</p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          variant="primary"
          icon={UserPlus}
        >
          Add New Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search employee registry by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200/50 select-none">
          {['ALL', 'STAFF', 'WORKER', 'DIRECTOR'].map((tab) => (
            <button
              key={tab}
              onClick={() => setDesFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${
                desFilter === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Database Registry Grid */}
      <div className="table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sr.No</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">PF No</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">UAN</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">TIC</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' && filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-20 text-slate-400 text-xs font-semibold">
                  Loading records...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-20 text-slate-400 text-xs font-semibold">
                  No registered employees match the filters.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="table-row">
                  <td className="table-cell font-semibold text-slate-500">{emp.srNo}</td>
                  <td className="table-cell font-bold text-slate-800">{emp.name}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.designation === 'DIRECTOR' ? 'bg-purple-100 text-purple-700' :
                      emp.designation === 'STAFF' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {emp.designation}
                    </span>
                  </td>
                  <td className="table-cell font-mono text-xs">{emp.pfNumber || <span className="text-slate-400">—</span>}</td>
                  <td className="table-cell font-mono text-xs">{emp.uan || <span className="text-slate-400">—</span>}</td>
                  <td className="table-cell font-mono text-xs">{emp.tic || <span className="text-slate-400">—</span>}</td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      emp.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(emp)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                      title="Edit Details"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(emp.id, emp.name, emp.isActive)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        emp.isActive
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={emp.isActive ? 'Deactivate (Soft Delete)' : 'Activate'}
                    >
                      {emp.isActive ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesPage;
