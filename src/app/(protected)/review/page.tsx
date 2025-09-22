"use client";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  section: string;
  level: string;
  label: string;
  value: string;
  unit: string;
  frequency: string;
  period: string;
  year: string;
  quarter: string;
  responsible: string;
  disaggregation: string;
  notes: string;
  status: string;
  savedAt: string;
  submitterMessage: string;
  reviewerMessage: string;
  approverMessage: string;
  user: string;
  assignedReviewer?: string;
  assignedApprover?: string;
  // User tracking fields
  submittedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  deletedBy?: string;
  restoredBy?: string;
  editedBy?: string;
  // Timestamp fields for each operation
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  deletedAt?: string;
  restoredAt?: string;
  editedAt?: string;
};

export default function ReviewPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [allItems, setAllItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Row>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed' | 'rejected' | 'approved' | 'deleted'>('pending');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    loadUserRole();
    loadItems();
  }, []);

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const loadUserRole = async () => {
    try {
      const res = await fetch("/api/user/");
      const data = await res.json();
      if (data.ok) {
        setUserRole(data.user.role);
      }
    } catch (error) {
      console.error("Failed to load user role:", error);
    }
  };

  const loadItems = async (status?: string) => {
    setLoading(true);
    try {
      // First try without any parameters to see what we get
      const url = `/api/list/`;
      console.log('Review page calling API:', url, 'with activeTab:', activeTab);
      const res = await fetch(url);
      
      if (!res.ok) {
        console.error('API response not ok:', res.status, res.statusText);
        return;
      }
      
      const allData = await res.json();
      console.log('Review page loaded data:', allData);
      console.log('Data length:', allData.length);
      console.log('Items with submitted status:', allData.filter((item: any) => item.status === 'submitted'));
      setAllItems(allData);
      
      // Filter by active tab
      const filtered = allData.filter((item: Row) => {
        if (activeTab === 'pending') return item.status === 'submitted';
        if (activeTab === 'reviewed') return item.status === 'reviewed';
        if (activeTab === 'rejected') return item.status === 'rejected';
        if (activeTab === 'approved') return item.status === 'approved';
        if (activeTab === 'deleted') return item.status === 'deleted';
        return false;
      });
      console.log('Filtered items for activeTab', activeTab, ':', filtered);
      setItems(filtered);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: Row) => {
    setEditingId(item.id);
    setEditData({
      value: item.value,
      unit: item.unit,
      frequency: item.frequency,
      period: item.period,
      responsible: item.responsible,
      disaggregation: item.disaggregation,
      notes: item.notes,
    });
  };

  const saveEdit = async (id: string) => {
    setProcessingId(id);
    setMessage(null);
    
    try {
      const res = await fetch("/api/review/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "update",
          data: editData,
        }),
      });
      
      const result = await res.json();
      
      if (result.ok) {
        setMessage({ type: 'success', text: 'Successfully updated submission' });
        setEditingId(null);
        setEditData({});
        loadItems(); // Reload the list
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update submission' });
      }
    } catch (error) {
      console.error("Failed to save edit:", error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProcessingId(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const decide = async (id: string, decision: "reviewed" | "rejected" | "approved") => {
    const note = prompt(
      decision === "reviewed" ? "Please provide a message for this review:" : 
      decision === "approved" ? "Please provide a message for this approval:" : 
      "Please provide a reason for rejection:"
    );
    
    // If user cancels the prompt or enters empty message, don't proceed
    if (note === null || note.trim() === "") {
      if (note === null) {
        setMessage({ type: 'error', text: `${decision} cancelled` });
      } else {
        setMessage({ type: 'error', text: 'Message is required for this action' });
      }
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    setProcessingId(id);
    setMessage(null);
    
    try {
      const endpoint = decision === "approved" ? "/api/approve" : "/api/review";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decision, note }),
      });
      
      const result = await res.json();
      
      if (result.ok) {
        setMessage({ 
          type: 'success', 
          text: `Successfully ${decision} submission with message: "${note.trim()}"` 
        });
        
        loadItems(); // Reload the list
        
        // Auto-switch to the correct tab after action (slight delay to ensure data is refreshed)
        setTimeout(() => {
          if (decision === "reviewed") {
            setActiveTab("reviewed");
          } else if (decision === "rejected") {
            setActiveTab("rejected");
          } else if (decision === "approved") {
            setActiveTab("approved");
          }
        }, 500);
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || `Failed to ${decision} submission` 
        });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      setMessage({ 
        type: 'error', 
        text: "Network error. Please try again." 
      });
    } finally {
      setProcessingId(null);
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Helper function to format user tracking information
  const formatUserTracking = (item: Row) => {
    const tracking = [];
    
    if (item.submittedBy && item.submittedAt) {
      tracking.push(`👤 Submitted by ${item.submittedBy} on ${new Date(item.submittedAt).toLocaleDateString()}`);
    }
    if (item.reviewedBy && item.reviewedAt) {
      tracking.push(`👨‍💼 Reviewed by ${item.reviewedBy} on ${new Date(item.reviewedAt).toLocaleDateString()}`);
    }
    if (item.approvedBy && item.approvedAt) {
      tracking.push(`👑 Approved by ${item.approvedBy} on ${new Date(item.approvedAt).toLocaleDateString()}`);
    }
    if (item.rejectedBy && item.rejectedAt) {
      tracking.push(`❌ Rejected by ${item.rejectedBy} on ${new Date(item.rejectedAt).toLocaleDateString()}`);
    }
    if (item.deletedBy && item.deletedAt) {
      tracking.push(`🗑️ Deleted by ${item.deletedBy} on ${new Date(item.deletedAt).toLocaleDateString()}`);
    }
    if (item.restoredBy && item.restoredAt) {
      tracking.push(`↩️ Restored by ${item.restoredBy} on ${new Date(item.restoredAt).toLocaleDateString()}`);
    }
    if (item.editedBy && item.editedAt) {
      tracking.push(`✏️ Edited by ${item.editedBy} on ${new Date(item.editedAt).toLocaleDateString()}`);
    }
    
    return tracking;
  };

  const deleteRecord = async (item: Row) => {
    if (!confirm(`Are you sure you want to delete this record: ${item.label}?`)) {
      return;
    }

    setProcessingId(item.id);
    setMessage(null);
    
    try {
      const res = await fetch("/api/delete-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          savedAt: item.savedAt
        }),
      });
      
      const result = await res.json();
      
      if (result.ok) {
        setMessage({ type: 'success', text: 'Record deleted successfully' });
        loadItems(); // Reload the list
        setTimeout(() => setActiveTab("deleted"), 500); // Auto-switch to deleted tab
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete record' });
      }
    } catch (error) {
      console.error("Failed to delete record:", error);
      setMessage({ type: 'error', text: 'Failed to delete record' });
    } finally {
      setProcessingId(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {userRole === 'approver' ? 'Review & Approve Submissions' : 'Review Submissions'}
      </h1>
      
      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending ({allItems.filter(item => item.status === 'submitted').length})
          </button>
          <button
            onClick={() => setActiveTab('reviewed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviewed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reviewed ({allItems.filter(item => item.status === 'reviewed').length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rejected'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rejected ({allItems.filter(item => item.status === 'rejected').length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'approved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Approved ({allItems.filter(item => item.status === 'approved').length})
          </button>
          <button
            onClick={() => setActiveTab('deleted')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'deleted'
                ? 'border-gray-500 text-gray-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Deleted ({allItems.filter(item => item.status === 'deleted').length})
          </button>
        </nav>
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
      
      {items.length === 0 && (
        <div className="p-4 bg-white border rounded">No records to review.</div>
      )}
      
      {items.map(item => (
        <div key={item.id} className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm text-gray-500">{item.id} • {item.section} • {item.level}</div>
              <div className="font-medium text-lg">{item.label}</div>
              <div className="text-xs text-gray-500">Submitted: {new Date(item.savedAt).toLocaleString()}</div>
              {item.assignedReviewer && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    👨‍💼 Assigned to: {item.assignedReviewer}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {item.status === 'submitted' && (
                <>
                  {/* Both reviewer and approver can edit */}
                  {(userRole === 'reviewer' || userRole === 'approver') && (
                    <button
                      onClick={() => startEdit(item)}
                      className="btn btn-outline"
                      disabled={processingId === item.id}
                    >
                      Edit
                    </button>
                  )}
                  {/* Only reviewer can mark as reviewed */}
                  {userRole === 'reviewer' && (
                    <button
                      onClick={() => decide(item.id, "reviewed")}
                      className="btn btn-primary"
                      disabled={processingId === item.id}
                    >
                      {processingId === item.id ? "Processing..." : "Mark Reviewed"}
                    </button>
                  )}
                  {/* Both reviewer and approver can reject */}
                  {(userRole === 'reviewer' || userRole === 'approver') && (
                    <button
                      onClick={() => decide(item.id, "rejected")}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={processingId === item.id}
                    >
                      {processingId === item.id ? "Processing..." : "Reject"}
                    </button>
                  )}
                  {/* Reviewers can only delete submitted (unreviewed) records */}
                  {userRole === 'reviewer' && item.status === 'submitted' && (
                    <button
                      onClick={() => deleteRecord(item)}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={processingId === item.id}
                    >
                      {processingId === item.id ? "Processing..." : "Delete"}
                    </button>
                  )}
                </>
              )}
              {item.status === 'reviewed' && (
                <>
                  {/* Only approver can approve reviewed items */}
                  {userRole === 'approver' && (
                    <button
                      onClick={() => decide(item.id, "approved")}
                      className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={processingId === item.id}
                    >
                      {processingId === item.id ? "Processing..." : "Approve"}
                    </button>
                  )}
                  {userRole === 'reviewer' && (
                    <div className="text-sm text-green-600 font-medium">
                      ✓ Reviewed
                    </div>
                  )}
                </>
              )}
              {item.status === 'approved' && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Approved
                </div>
              )}
              {item.status === 'rejected' && (
                <div className="text-sm text-red-600 font-medium">
                  ✗ Rejected
                </div>
              )}
            </div>
          </div>

          {editingId === item.id ? (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Edit Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="text"
                    value={editData.value || ""}
                    onChange={(e) => setEditData({ ...editData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editData.unit || ""}
                    onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={editData.frequency || ""}
                    onChange={(e) => setEditData({ ...editData, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <input
                    type="text"
                    value={editData.period || ""}
                    onChange={(e) => setEditData({ ...editData, period: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsible</label>
                  <input
                    type="text"
                    value={editData.responsible || ""}
                    onChange={(e) => setEditData({ ...editData, responsible: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disaggregation</label>
                  <input
                    type="text"
                    value={editData.disaggregation || ""}
                    onChange={(e) => setEditData({ ...editData, disaggregation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editData.notes || ""}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => saveEdit(item.id)}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditData({});
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 space-y-2">
              <div><strong>Value:</strong> {item.value}</div>
              <div><strong>Unit:</strong> {item.unit}</div>
              <div><strong>Frequency:</strong> {item.frequency}</div>
              <div><strong>Period:</strong> {item.period}</div>
              <div><strong>Responsible:</strong> {item.responsible}</div>
              <div><strong>Disaggregation:</strong> {item.disaggregation}</div>
              {item.notes && <div><strong>Submitter's Notes:</strong> {item.notes}</div>}
            </div>
          )}
          
          {/* User Tracking History */}
          {formatUserTracking(item).length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Operation History</h4>
              <div className="space-y-1">
                {formatUserTracking(item).map((tracking, index) => (
                  <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {tracking}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Message History */}
          {(item.submitterMessage || item.reviewerMessage || item.approverMessage) && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Message History</h4>
              <div className="space-y-2">
                {item.submitterMessage && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="text-xs text-blue-600 font-medium mb-1">Submitter Message</div>
                    <div className="text-sm text-gray-800">{item.submitterMessage}</div>
                  </div>
                )}
                {item.reviewerMessage && (
                  <div className="bg-yellow-50 p-3 rounded-md">
                    <div className="text-xs text-yellow-600 font-medium mb-1">Reviewer Message</div>
                    <div className="text-sm text-gray-800">{item.reviewerMessage}</div>
                  </div>
                )}
                {item.approverMessage && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <div className="text-xs text-green-600 font-medium mb-1">Approver Message</div>
                    <div className="text-sm text-gray-800">{item.approverMessage}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


