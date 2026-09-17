import React, { useEffect, useState } from 'react';
import { fetchReportSummary } from './ReportingDashboardLogic';

export const ReportingDashboard: React.FC<{ apiService?: any }> = ({ apiService }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportSummary({}, apiService).then(summary => {
      setData(summary);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading dashboard reports...</div>;
  if (!data) return <div>Failed to load report data.</div>;

  return (
    <div data-testid="admin-dashboard-root" className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Campus Maintenance Analytics & Reports</h2>

      {/* KPI Cards */}
      <div data-testid="kpi-cards" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow border">
          <span className="text-sm text-gray-500">Total Volume</span>
          <div data-testid="kpi-total" className="text-2xl font-bold text-gray-800">{data.totalComplaints}</div>
        </div>
        <div className="p-4 bg-white rounded shadow border">
          <span className="text-sm text-gray-500">Resolved Tickets</span>
          <div data-testid="kpi-resolved" className="text-2xl font-bold text-green-600">{data.resolvedCount}</div>
        </div>
        <div className="p-4 bg-white rounded shadow border">
          <span className="text-sm text-gray-500">Avg Satisfaction</span>
          <div data-testid="kpi-rating" className="text-2xl font-bold text-yellow-500">★ {data.averageRating}</div>
        </div>
        <div className="p-4 bg-white rounded shadow border">
          <span className="text-sm text-gray-500">Pending Actions</span>
          <div data-testid="kpi-pending" className="text-2xl font-bold text-amber-500">{data.pendingCount || 0}</div>
        </div>
      </div>

      {/* Tables / Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div data-testid="category-table" className="p-4 bg-white rounded shadow border">
          <h3 className="font-bold text-gray-700 mb-3">Volume by Category</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">Category</th>
                <th className="py-2">Complaints</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.byCategory || {}).map(([cat, count]: any) => (
                <tr key={cat} className="border-b">
                  <td className="py-2 font-medium">{cat}</td>
                  <td className="py-2 font-bold">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div data-testid="location-table" className="p-4 bg-white rounded shadow border">
          <h3 className="font-bold text-gray-700 mb-3">Recurring Location Hot-Spots</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">Location</th>
                <th className="py-2">Incident Count</th>
              </tr>
            </thead>
            <tbody>
              {(data.byLocation || []).map((loc: any) => (
                <tr key={loc.location} className="border-b">
                  <td className="py-2">{loc.location}</td>
                  <td className="py-2 font-bold text-red-600">{loc.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
