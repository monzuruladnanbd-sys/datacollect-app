"use client";
import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/users";
import { Role } from "@/lib/session";

export default function RoleManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<Role>("submitter");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users/");
      const data = await res.json();
      if (data.ok) {
        // Filter out admin users (they can't be managed)
        const manageableUsers = data.users.filter((user: UserProfile) => user.role !== "admin");
        setUsers(manageableUsers);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
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

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadUsers(); // Reload users
        setEditingUser(null);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to change role' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
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
        <div className="text-lg">Loading role management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        <p className="text-gray-600">Change user roles and permissions</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Role Information */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Descriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor("submitter")}`}>
                SUBMITTER
              </span>
            </div>
            <p className="text-sm text-gray-600">{getRoleDescription("submitter")}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor("reviewer")}`}>
                REVIEWER
              </span>
            </div>
            <p className="text-sm text-gray-600">{getRoleDescription("reviewer")}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor("approver")}`}>
                APPROVER
              </span>
            </div>
            <p className="text-sm text-gray-600">{getRoleDescription("approver")}</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Manage User Roles</h2>
          <p className="text-sm text-gray-600">Click on a user to change their role</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Change Role for {editingUser.name}
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
