"use client";
import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/users";
import { Role } from "@/lib/session";

interface UserStats {
  total: number;
  active: number;
  submitters: number;
  reviewers: number;
  approvers: number;
  admins: number;
}

export default function UnifiedUserRoleManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    submitters: 0,
    reviewers: 0,
    approvers: 0,
    admins: 0
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'pending' | 'roles'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 loadData called - refreshing all data...');
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadPendingUsers(),
        loadStats()
      ]);
      console.log('✅ loadData completed successfully');
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users/");
      const data = await res.json();
      if (data.ok) {
        // The API now returns UserProfile objects, no need to convert
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const loadPendingUsers = async () => {
    try {
      console.log('🔄 loadPendingUsers called...');
      const res = await fetch("/api/admin/pending-users/");
      const data = await res.json();
      if (data.success) {
        // The API already returns UserProfile objects, no need to convert
        console.log('📋 Loaded pending users:', data.users);
        console.log('📋 User IDs and types:', data.users.map((u: any) => ({ id: u.id, idType: typeof u.id })));
        console.log('📋 Pending users count:', data.users.length);
        setPendingUsers(data.users || []);
      } else {
        console.log('❌ Failed to load pending users:', data);
      }
    } catch (error) {
      console.error("Failed to load pending users:", error);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/api/admin/users/");
      const data = await res.json();
      if (data.ok) {
        setStats(data.stats || {
          total: 0,
          active: 0,
          submitters: 0,
          reviewers: 0,
          approvers: 0,
          admins: 0
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}/role/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await res.json();

      if (result.ok) {
        setMessage({ type: 'success', text: result.message });
        loadData(); // Reload all data
        setEditingUser(null);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to change role' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleApproveUser = async (userId: string) => {
    console.log('🚀 Approve button clicked for user ID:', userId);
    setMessage(null);

    try {
      const apiUrl = `/api/admin/users/${userId}/approve`;
      console.log('📡 Making API call to:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API response status:', res.status);
      console.log('📡 API response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        console.error('❌ API response not OK:', res.status, res.statusText);
        const errorText = await res.text();
        console.error('❌ Error response body:', errorText);
        setMessage({ type: 'error', text: `API Error: ${res.status} ${res.statusText}` });
        return;
      }

      const result = await res.json();
      console.log('📡 API response data:', result);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        console.log('✅ User approved successfully, reloading data...');
        
        // Force a more aggressive refresh
        setTimeout(async () => {
          console.log('🔄 Starting aggressive data refresh...');
          
          // First, try to remove the user from pending state immediately
          setPendingUsers(prev => {
            console.log('🔄 Updating pending users state directly...');
            const updated = prev.filter(user => user.id !== userId);
            console.log('🔄 Updated pending users count:', updated.length);
            return updated;
          });
          
          // Force a complete UI re-render
          setLoading(true);
          setTimeout(() => setLoading(false), 50);
          
          await loadData();
          
          // Force re-render by updating state
          setActiveTab(activeTab);
          
          // Double-check by reloading pending users specifically
          setTimeout(async () => {
            console.log('🔄 Double-checking pending users...');
            await loadPendingUsers();
          }, 200);
        }, 100);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to approve user' });
        console.log('❌ Approval failed:', result.message);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleRejectUser = async (userId: string) => {
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "POST",
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadData(); // Reload all data
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to reject user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleReactivateUser = async (userId: string) => {
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}/reactivate`, {
        method: "POST",
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadData(); // Reload all data
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to reactivate user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    console.log('🗑️ Delete button clicked for user ID:', userId);
    
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      console.log('🗑️ Delete cancelled by user');
      return;
    }

    setMessage(null);

    try {
      console.log('🗑️ Making DELETE request to:', `/api/admin/users/${userId}`);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      console.log('🗑️ DELETE response status:', res.status);
      const result = await res.json();
      console.log('🗑️ DELETE response data:', result);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        console.log('🗑️ Delete successful, reloading data...');
        
        // Force immediate UI update
        setUsers(prev => {
          console.log('🗑️ Removing user from UI state immediately');
          return prev.filter(user => user.id !== userId);
        });
        
        // Then reload all data
        setTimeout(() => {
          loadData();
        }, 100);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete user' });
        console.log('🗑️ Delete failed:', result.message);
      }
    } catch (error) {
      console.error('🗑️ Delete error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleCleanupTestAccounts = async () => {
    if (!confirm('This will remove all test accounts created during debugging. Are you sure?')) {
      return;
    }

    setMessage(null);

    try {
      console.log('🧹 Cleaning up test accounts...');
      const res = await fetch('/api/cleanup-test-accounts', {
        method: 'POST',
      });

      const result = await res.json();
      console.log('🧹 Cleanup result:', result);

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ Cleanup completed! Removed ${result.removedAccounts?.length || 0} test accounts.` 
        });
        
        // Reload data to show updated user list
        setTimeout(() => {
          loadData();
        }, 100);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to cleanup test accounts' });
      }
    } catch (error) {
      console.error('🧹 Cleanup error:', error);
      setMessage({ type: 'error', text: 'Network error during cleanup.' });
    }
  };

  const handleClearSampleData = async () => {
    if (!confirm('This will clear all sample data that may be causing user mismatches. Are you sure?')) {
      return;
    }

    setMessage(null);

    try {
      console.log('🧹 Clearing sample data...');
      const res = await fetch('/api/clear-sample-data', {
        method: 'POST',
      });

      const result = await res.json();
      console.log('🧹 Clear sample data result:', result);

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: '✅ Sample data cleared successfully! You can now create fresh submissions.' 
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to clear sample data' });
      }
    } catch (error) {
      console.error('🧹 Clear sample data error:', error);
      setMessage({ type: 'error', text: 'Network error during sample data clearing.' });
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case "submitter": return "bg-blue-100 text-blue-800";
      case "reviewer": return "bg-yellow-100 text-yellow-800";
      case "approver": return "bg-green-100 text-green-800";
      case "admin": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDescription = (role: Role) => {
    switch (role) {
      case "submitter": return "Can submit data and view own submissions";
      case "reviewer": return "Can review and edit submitted data (Max: 3)";
      case "approver": return "Can approve/reject reviewed data (Max: 3)";
      case "admin": return "Full system access and user management";
      default: return "";
    }
  };

  const getAvailableRoles = (currentRole: Role): Role[] => {
    const allRoles: Role[] = ["submitter", "reviewer", "approver"];
    return allRoles.filter(role => role !== currentRole);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading user management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">User & Role Management</h1>
        <p className="text-blue-100 mt-2">Comprehensive user management and role assignment system</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg shadow-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {message.text}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'All Users', icon: '👥' },
              { id: 'pending', label: 'Pending Approval', icon: '⏳' },
              { id: 'roles', label: 'Role Management', icon: '🔐' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.id === 'pending' && pendingUsers.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {pendingUsers.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-400 rounded-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-blue-100 text-sm">Total Users</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-400 rounded-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-green-100 text-sm">Active Users</p>
                      <p className="text-2xl font-bold">{stats.active}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-400 rounded-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-yellow-100 text-sm">Pending Approval</p>
                      <p className="text-2xl font-bold">{pendingUsers.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-400 rounded-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-purple-100 text-sm">Reviewers</p>
                      <p className="text-2xl font-bold">{stats.reviewers}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Distribution */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor("submitter")} mb-2`}>
                      SUBMITTER
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.submitters}</p>
                    <p className="text-sm text-gray-500">Data Submitters</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor("reviewer")} mb-2`}>
                      REVIEWER
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.reviewers}</p>
                    <p className="text-sm text-gray-500">Data Reviewers</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor("approver")} mb-2`}>
                      APPROVER
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.approvers}</p>
                    <p className="text-sm text-gray-500">Data Approvers</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor("admin")} mb-2`}>
                      ADMIN
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                    <p className="text-sm text-gray-500">System Admins</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearSampleData}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Clear Sample Data
                  </button>
                  <button
                    onClick={handleCleanupTestAccounts}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Cleanup Test Accounts
                  </button>
                  <button
                    onClick={loadData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>

              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name || user.email || 'Unknown User'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {!user.isActive && (
                              <button 
                                onClick={() => handleReactivateUser(user.id)}
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                Reactivate
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pending Users Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Pending User Approvals</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      console.log('🔄 Manual refresh clicked');
                      loadPendingUsers();
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    🔄 Refresh
                  </button>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {pendingUsers.length} pending
                  </span>
                </div>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending users</h3>
                  <p className="mt-1 text-sm text-gray-500">All users have been processed.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="bg-white border rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-lg font-medium text-gray-700">
                                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-lg font-medium text-gray-900">{user.name || user.email || 'Unknown User'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                {user.role.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              console.log('🖱️ Approve button clicked for user:', user);
                              handleApproveUser(user.id);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center cursor-pointer"
                            type="button"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Role Management Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {/* Role Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Descriptions & Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor("submitter")}`}>
                        SUBMITTER
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{getRoleDescription("submitter")}</p>
                    <div className="text-xs text-gray-500">
                      <strong>Permissions:</strong> Submit data, view own submissions, edit drafts
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor("reviewer")}`}>
                        REVIEWER
                      </span>
                      <span className="ml-2 text-xs text-gray-500">(Max: 3)</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{getRoleDescription("reviewer")}</p>
                    <div className="text-xs text-gray-500">
                      <strong>Permissions:</strong> Review submissions, edit data, add comments
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor("approver")}`}>
                        APPROVER
                      </span>
                      <span className="ml-2 text-xs text-gray-500">(Max: 3)</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{getRoleDescription("approver")}</p>
                    <div className="text-xs text-gray-500">
                      <strong>Permissions:</strong> Approve/reject data, final decisions, export reports
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Change Interface */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Change User Roles</h3>
                  <p className="text-sm text-gray-600">Select a user to change their role and permissions</p>
                </div>
                <div className="p-6">
                  <div className="grid gap-4">
                    {users.filter(user => user.role !== 'admin').map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name || user.email || 'Unknown User'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </span>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Change Role
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Change Role for {editingUser.name || editingUser.email || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Current role: <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(editingUser.role)}`}>
                  {editingUser.role.toUpperCase()}
                </span>
              </p>
              
              <div className="space-y-3">
                {getAvailableRoles(editingUser.role).map(role => (
                  <div key={role} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                        {role.toUpperCase()}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{getRoleDescription(role)}</p>
                    </div>
                    <button
                      onClick={() => handleRoleChange(editingUser.id, role)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Change
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
