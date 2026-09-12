import React, { useState } from 'react';
import { validateAssignment, assignDepartment } from './AdminQueueLogic';

export interface ComplaintItem {
  id: string;
  referenceId: string;
  category: string;
  location: string;
  status: string;
  assignedDepartment: string | null;
}

export const AdminQueue: React.FC<{ initialComplaints?: ComplaintItem[] }> = ({ initialComplaints = [] }) => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>(initialComplaints);
  const [selectedDepts, setSelectedDepts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDeptSelect = (id: string, dept: string) => {
    setSelectedDepts(prev => ({ ...prev, [id]: dept }));
    setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleAssign = async (complaintId: string) => {
    const dept = selectedDepts[complaintId];
    const res = await assignDepartment(complaintId, dept);
    if (!res.success) {
      setErrors(prev => ({ ...prev, [complaintId]: res.error || 'Assignment failed' }));
      return;
    }

    setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: 'Assigned', assignedDepartment: dept } : c));
    setSuccessMsg(`Complaint assigned to ${dept} successfully!`);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow border">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Complaint Queue & Routing</h2>
      {successMsg && <div data-testid="success-banner" className="p-3 bg-green-50 text-green-700 rounded mb-4">{successMsg}</div>}
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Ref ID</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-left">Location</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Assign Department</th>
            <th className="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map(item => (
            <tr key={item.id} data-testid={"row-" + item.id} className="border-b">
              <td className="px-4 py-2 font-mono">{item.referenceId}</td>
              <td className="px-4 py-2">{item.category}</td>
              <td className="px-4 py-2">{item.location}</td>
              <td className="px-4 py-2 font-semibold">{item.status}</td>
              <td className="px-4 py-2">
                <select
                  data-testid={"select-dept-" + item.id}
                  value={selectedDepts[item.id] || item.assignedDepartment || ''}
                  onChange={e => handleDeptSelect(item.id, e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="">Choose Dept</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Carpentry">Carpentry</option>
                </select>
                {errors[item.id] && <p data-testid={"error-" + item.id} className="text-red-500 text-xs mt-1">{errors[item.id]}</p>}
              </td>
              <td className="px-4 py-2">
                <button
                  data-testid={"btn-assign-" + item.id}
                  onClick={() => handleAssign(item.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                >
                  Assign
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
