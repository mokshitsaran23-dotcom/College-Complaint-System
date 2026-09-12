import React from 'react';
import { filterComplaintsForStaff } from './StaffQueueLogic';

export interface StaffQueueProps {
  staffUser: { collegeId: string; name: string; department: string };
  complaints: Array<{
    id: string;
    referenceId: string;
    category: string;
    location: string;
    status: string;
    assignedDepartment: string;
  }>;
}

export const StaffQueue: React.FC<StaffQueueProps> = ({ staffUser, complaints }) => {
  const departmentComplaints = filterComplaintsForStaff(complaints, staffUser);

  return (
    <div className="p-6 bg-white rounded-lg shadow border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Assigned Work Orders</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 font-medium rounded-full text-sm">
          Dept: {staffUser.department}
        </span>
      </div>

      {departmentComplaints.length === 0 ? (
        <p data-testid="empty-queue-msg" className="text-gray-500 py-4">No work orders currently assigned to {staffUser.department}.</p>
      ) : (
        <div data-testid="staff-complaints-list" className="space-y-3">
          {departmentComplaints.map(item => (
            <div key={item.id} data-testid={"item-" + item.id} className="p-4 border rounded hover:border-blue-300">
              <div className="flex justify-between">
                <span className="font-mono font-bold text-blue-600">{item.referenceId}</span>
                <span className="font-semibold text-sm">{item.status}</span>
              </div>
              <p className="text-gray-700 mt-1">Location: {item.location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
