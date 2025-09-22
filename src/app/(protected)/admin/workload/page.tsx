"use client";
import { useState, useEffect } from "react";

interface WorkloadStats {
  userEmail: string;
  role: string;
  pendingCount: number;
  completedToday: number;
  lastAssigned: Date | null;
}

interface DashboardData {
  reviewers: WorkloadStats[];
  approvers: WorkloadStats[];
  totalPending: number;
  totalCompletedToday: number;
}

interface RoundRobinConfig {
  enabled: boolean;
  assignmentStrategy: 'round_robin' | 'least_loaded' | 'random';
  maxWorkloadPerUser: number;
  resetDaily: boolean;
}

export default function WorkloadDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    reviewers: [],
    approvers: [],
    totalPending: 0,
    totalCompletedToday: 0
  });
  const [config, setConfig] = useState<RoundRobinConfig>({
    enabled: true,
    assignmentStrategy: 'least_loaded',
    maxWorkloadPerUser: 10,
    resetDaily: true
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/round-robin/dashboard');
      const result = await res.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setConfig(result.config);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to load dashboard data' });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadColor = (pendingCount: number, maxWorkload: number) => {
    const percentage = (pendingCount / maxWorkload) * 100;
    if (percentage >= 80) return 'text-red-600 bg-red-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'round_robin': return '🔄';
      case 'least_loaded': return '⚖️';
      case 'random': return '🎲';
      default: return '⚖️';
    }
  };

  if (loading) return <div className="p-4">Loading workload dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Round-Robin Workload Dashboard</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {message && (
        <div className={`px-4 py-2 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Configuration Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">⚙️ Round-Robin Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">{config.enabled ? '✅' : '❌'}</div>
            <div className="text-sm text-gray-600">Status</div>
            <div className="font-medium">{config.enabled ? 'Enabled' : 'Disabled'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">{getStrategyIcon(config.assignmentStrategy)}</div>
            <div className="text-sm text-gray-600">Strategy</div>
            <div className="font-medium capitalize">{config.assignmentStrategy.replace('_', ' ')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm text-gray-600">Max Workload</div>
            <div className="font-medium">{config.maxWorkloadPerUser} per user</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">{config.resetDaily ? '🔄' : '📅'}</div>
            <div className="text-sm text-gray-600">Reset</div>
            <div className="font-medium">{config.resetDaily ? 'Daily' : 'Manual'}</div>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-blue-600">{dashboardData.totalPending}</div>
          <div className="text-gray-600">Total Pending</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-green-600">{dashboardData.totalCompletedToday}</div>
          <div className="text-gray-600">Completed Today</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-purple-600">
            {dashboardData.reviewers.length + dashboardData.approvers.length}
          </div>
          <div className="text-gray-600">Active Staff</div>
        </div>
      </div>

      {/* Reviewers Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">👨‍💼 Reviewers Workload</h2>
        {dashboardData.reviewers.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No active reviewers found</div>
        ) : (
          <div className="space-y-4">
            {dashboardData.reviewers.map((reviewer, index) => (
              <div key={reviewer.userEmail} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{reviewer.userEmail}</div>
                  <div className="text-sm text-gray-600">
                    Last assigned: {reviewer.lastAssigned 
                      ? new Date(reviewer.lastAssigned).toLocaleString()
                      : 'Never'
                    }
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getWorkloadColor(reviewer.pendingCount, config.maxWorkloadPerUser)
                    }`}>
                      {reviewer.pendingCount} pending
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {reviewer.completedToday}
                    </div>
                    <div className="text-xs text-gray-600">today</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approvers Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">👑 Approvers Workload</h2>
        {dashboardData.approvers.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No active approvers found</div>
        ) : (
          <div className="space-y-4">
            {dashboardData.approvers.map((approver, index) => (
              <div key={approver.userEmail} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{approver.userEmail}</div>
                  <div className="text-sm text-gray-600">
                    Last assigned: {approver.lastAssigned 
                      ? new Date(approver.lastAssigned).toLocaleString()
                      : 'Never'
                    }
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getWorkloadColor(approver.pendingCount, config.maxWorkloadPerUser)
                    }`}>
                      {approver.pendingCount} pending
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {approver.completedToday}
                    </div>
                    <div className="text-xs text-gray-600">today</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">📊 Workload Legend</h3>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-600 rounded"></div>
            <span>Low workload (&lt;60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-600 rounded"></div>
            <span>Medium workload (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-600 rounded"></div>
            <span>High workload (&gt;80%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
