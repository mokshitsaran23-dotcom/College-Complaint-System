import React, { useState } from 'react';
import { Complaint, Department, ReportSummary, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';

interface AdminDashboardProps {
  user: User;
  complaints: Complaint[];
  reportSummary: ReportSummary | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onComplaintUpdated: (c: Complaint) => void;
}

const DEPARTMENTS: Department[] = ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Facilities', 'Sanitation'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  complaints,
  reportSummary,
  activeTab,
  setActiveTab,
  onComplaintUpdated
}) => {
  const [selectedDepts, setSelectedDepts] = useState<Record<string, Department>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<Record<string, string>>({});
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'all' && c.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const handleAssign = async (complaintId: string) => {
    const chosenDept = selectedDepts[complaintId];
    if (!chosenDept) {
      setAssignError(prev => ({ ...prev, [complaintId]: 'Please select a department' }));
      return;
    }

    setAssigningId(complaintId);
    setAssignError(prev => { const n = { ...prev }; delete n[complaintId]; return n; });

    try {
      const updated = await api.assignComplaint(complaintId, chosenDept);
      onComplaintUpdated(updated);
      setAssignSuccess(`Ticket assigned to ${chosenDept} successfully.`);
      setTimeout(() => setAssignSuccess(null), 3500);
    } catch (err: any) {
      setAssignError(prev => ({ ...prev, [complaintId]: err.message || 'Assignment failed' }));
    } finally {
      setAssigningId(null);
    }
  };

  const downloadReportCsv = () => {
    if (!reportSummary) return;
    let csv = 'Metric,Value\n';
    csv += `Total Complaints,${reportSummary.totalComplaints}\n`;
    csv += `Resolved Count,${reportSummary.resolvedCount}\n`;
    csv += `Average Rating,${reportSummary.averageRating}\n`;
    csv += `Avg Resolution Duration (Hours),${reportSummary.averageResolutionHours}\n\n`;
    csv += 'Category,Count\n';
    Object.entries(reportSummary.byCategory).forEach(([k, v]) => {
      csv += `${k},${v}\n`;
    });
    csv += '\nLocation,Incidents\n';
    reportSummary.byLocation.forEach(loc => {
      csv += `"${loc.location}",${loc.count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {assignSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl animate-in fade-in">
          ✓ {assignSuccess}
        </div>
      )}

      {activeTab === 'queue' ? (
        /* Triage Queue */
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Departmental Triage & Assignment Queue</h2>
              <p className="text-xs text-slate-500">
                Review submitted issues and dispatch work orders to responsible maintenance teams.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">All States ({complaints.length})</option>
                <option value="open">Open Only</option>
                <option value="assigned">Assigned</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Ticket Ref</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Location & Detail</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Target Department</th>
                  <th className="py-3 px-3 text-right">Routing Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      No complaints match the filter.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">
                        {item.referenceId}
                        <div className="text-[10px] text-slate-400 font-normal font-sans">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{item.category}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{item.location}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{item.description}</div>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={selectedDepts[item.id] || item.assignedDepartment || ''}
                          onChange={(e) =>
                            setSelectedDepts((prev) => ({ ...prev, [item.id]: e.target.value as Department }))
                          }
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Choose Department</option>
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        {assignError[item.id] && (
                          <div className="text-[10px] text-red-600 mt-1 font-semibold">{assignError[item.id]}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleAssign(item.id)}
                          disabled={assigningId === item.id}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition disabled:opacity-50"
                        >
                          {assigningId === item.id
                            ? 'Assigning...'
                            : item.assignedDepartment
                            ? 'Reassign'
                            : 'Assign Dept'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Analytics & Reporting Tab */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Campus Facilities Analytics & Reporting</h2>
              <p className="text-xs text-slate-500">
                Data-driven overview of recurring maintenance issues, resolution turnaround, and satisfaction KPIs.
              </p>
            </div>
            <button
              onClick={downloadReportCsv}
              className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2"
            >
              <span>📥</span>
              <span>Export CSV Report</span>
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Work Orders</span>
              <div className="text-2xl font-black text-slate-800 mt-1">{reportSummary?.totalComplaints || 0}</div>
              <span className="text-[10px] text-blue-600 font-semibold">Across campus grounds</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved Tickets</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{reportSummary?.resolvedCount || 0}</div>
              <span className="text-[10px] text-emerald-700 font-semibold">Turnaround complete</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Satisfaction</span>
              <div className="text-2xl font-black text-amber-500 mt-1">★ {reportSummary?.averageRating || 0} / 5</div>
              <span className="text-[10px] text-slate-500 font-medium">Verified student ratings</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Resolution Time</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">{reportSummary?.averageResolutionHours || 0} hrs</div>
              <span className="text-[10px] text-indigo-500 font-semibold">SLA compliance nominal</span>
            </div>
          </div>

          {/* Category & Location Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Volume by Issue Category</h3>
              <div className="space-y-3">
                {Object.entries(reportSummary?.byCategory || {}).map(([cat, count]) => {
                  const percent = Math.round((count / (reportSummary?.totalComplaints || 1)) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{cat}</span>
                        <span className="text-slate-500">
                          {count} tickets ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recurring Hot-Spot Locations */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Recurring Defect Hot-Spots</h3>
              <div className="divide-y divide-slate-100">
                {(reportSummary?.byLocation || []).map((loc, idx) => (
                  <div key={loc.location} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-800">{loc.location}</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-red-50 text-red-700 font-bold rounded-full text-[11px] border border-red-100">
                      {loc.count} incidents
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
