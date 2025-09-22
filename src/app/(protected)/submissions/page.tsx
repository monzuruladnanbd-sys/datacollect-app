"use client";
import { useState, useEffect } from "react";
import { UserConsistencyClient } from "@/lib/user-consistency-client";

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

export default function SubmissionsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [allItems, setAllItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected' | 'deleted'>('draft');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Row>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const loadItems = async () => {
    setLoading(true);
    try {
      // First, get current user
      let currentUserEmail = '';
      try {
        const userRes = await fetch('/api/user/');
        const userData = await userRes.json();
        currentUserEmail = userData.user?.email || 'submitter@submit.com';
        setCurrentUser(currentUserEmail);
      } catch (error) {
        console.warn('Failed to get user, using default:', error);
        currentUserEmail = 'submitter@submit.com';
        setCurrentUser(currentUserEmail);
      }
      
      // Load from both server API and localStorage
      let allData: Row[] = [];
      
      // 1. Try to load from server API
      try {
        const response = await fetch('/api/list');
        if (response.ok) {
          const serverData = await response.json();
          console.log('Loaded from server:', serverData);
          console.log('Server user fields:', serverData.map((item: any) => ({ id: item.id, user: item.user })));
          allData = [...allData, ...serverData];
        }
      } catch (serverError) {
        console.warn('Server load failed:', serverError);
      }
      
      // 2. Load from localStorage
      let stored = localStorage.getItem('datacollect_submissions');
      
      // Clear and recreate localStorage if it has old data
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          // Check if any item has the old user format
              // Clear localStorage if it has any sample data or old user formats
              const hasOldUser = parsedData.some((item: any) => 
                item.user === 'submitter@example.com' || 
                item.user === 'ada1' || 
                item.user === 'ada1@ada.com' || 
                item.user === 'tester1@tester.com' ||
                item.id === 'FM-P-001' || 
                item.id === 'FM-P-002' || 
                item.id === 'FM-O-001' || 
                item.id === 'FM-O-002'
              );
          if (hasOldUser) {
            console.log('Clearing localStorage with old user data');
            localStorage.removeItem('datacollect_submissions');
            stored = null;
          }
        } catch (e) {
          console.log('Error parsing localStorage, clearing it');
          localStorage.removeItem('datacollect_submissions');
          stored = null;
        }
      }
      
      // If no localStorage data, start with empty array
      if (!stored) {
        console.log('🔄 No localStorage data - starting with empty submissions');
        const emptyData: Row[] = [];
        localStorage.setItem('datacollect_submissions', JSON.stringify(emptyData));
        stored = JSON.stringify(emptyData);
      }
      
      const localData = JSON.parse(stored);
      console.log('Loaded from localStorage:', localData);
      console.log('localStorage user fields:', localData.map((item: any) => ({ id: item.id, user: item.user })));
      allData = [...allData, ...localData];
      
      // Remove duplicates based on id - keep the most recent record for each ID
      console.log('🔍 DEBUGGING: Before deduplication - allData length:', allData.length);
      console.log('🔍 DEBUGGING: All data items:', allData.map(item => ({ id: item.id, status: item.status, savedAt: item.savedAt })));
      
      const uniqueData = allData.reduce((acc, item) => {
        const existingIndex = acc.findIndex(existing => existing.id === item.id);
        if (existingIndex === -1) {
          // No existing record with this ID, add it
          console.log('🔍 DEBUGGING: Adding new record:', item.id, item.status);
          acc.push(item);
        } else {
          // Compare timestamps and keep the most recent one
          const existing = acc[existingIndex];
          const existingTime = new Date(existing.savedAt).getTime();
          const currentTime = new Date(item.savedAt).getTime();
          console.log('🔍 DEBUGGING: Duplicate found for ID:', item.id);
          console.log('  - Existing:', existing.status, existing.savedAt, 'Time:', existingTime);
          console.log('  - Current:', item.status, item.savedAt, 'Time:', currentTime);
          
          if (currentTime > existingTime) {
            // Replace with newer record
            console.log('🔍 DEBUGGING: Replacing with newer record');
            acc[existingIndex] = item;
          } else {
            console.log('🔍 DEBUGGING: Keeping existing record (older is newer)');
          }
        }
        return acc;
      }, [] as Row[]);
      
      console.log('Total unique items loaded:', uniqueData.length);
      console.log('🔍 DEBUGGING: Unique data after deduplication:', uniqueData.map(item => ({ id: item.id, status: item.status, savedAt: item.savedAt })));
      
      // Filter by current user using consistency manager
      console.log('🔍 DEBUGGING: Starting user filtering');
      console.log('🔍 DEBUGGING: currentUserEmail =', currentUserEmail);
      console.log('🔍 DEBUGGING: uniqueData =', uniqueData);
      console.log('🔍 DEBUGGING: uniqueData user fields =', uniqueData.map(item => ({ id: item.id, user: item.user })));
      
      const userData = uniqueData.filter((item: Row) => {
        const matchesUser = UserConsistencyClient.isSameUser(item.user, currentUserEmail);
        console.log(`🔍 DEBUGGING: Item ${item.id}: user=${item.user}, currentUser=${currentUserEmail}, matches=${matchesUser}`);
        return matchesUser;
      });
      console.log('🔍 DEBUGGING: User filtered items:', userData.length, 'for user:', currentUserEmail);
      
      setAllItems(userData);
      
      // Debug: Show status distribution
      console.log('🔍 DEBUGGING: Status distribution of user data:', userData.map(item => ({ id: item.id, status: item.status })));
      console.log('🔍 DEBUGGING: Tab counts calculation:');
      console.log('  - Draft:', userData.filter(item => item.status === 'draft').length);
      console.log('  - Pending:', userData.filter(item => item.status === 'submitted').length);
      console.log('  - Reviewed:', userData.filter(item => item.status === 'reviewed').length);
      console.log('  - Approved:', userData.filter(item => item.status === 'approved').length);
      console.log('  - Rejected:', userData.filter(item => item.status === 'rejected').length);
      console.log('  - Deleted:', userData.filter(item => item.status === 'deleted').length);
      
      // Filter by active tab
      const filtered = userData.filter((item: Row) => {
        if (activeTab === 'draft') return item.status === 'draft';
        if (activeTab === 'pending') return item.status === 'submitted';
        if (activeTab === 'reviewed') return item.status === 'reviewed';
        if (activeTab === 'approved') return item.status === 'approved';
        if (activeTab === 'rejected') return item.status === 'rejected';
        if (activeTab === 'deleted') return item.status === 'deleted';
        return false;
      });
      
      console.log(`🔍 DEBUGGING: Filtered items for ${activeTab} tab:`, filtered.length, filtered.map(item => ({ id: item.id, status: item.status })));
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
      responsible: Array.isArray(item.responsible) ? item.responsible.join(', ') : (item.responsible || ''), 
      disaggregation: Array.isArray(item.disaggregation) ? item.disaggregation.join(', ') : (item.disaggregation || ''),
      notes: item.notes,
    });
  };

  const saveEdit = async (id: string) => {
    setProcessingId(id);
    setMessage(null);
    
    try {
      const res = await fetch("/api/update-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indicatorId: id,
          status: "draft",
          submitterMessage: editData.notes || "",
          // Send all the edited field values
          value: editData.value,
          unit: editData.unit,
          frequency: editData.frequency,
          period: editData.period,
          responsible: editData.responsible,
          disaggregation: editData.disaggregation
        }),
      });
      
      const result = await res.json();
      
      if (result.ok) {
        setMessage({ type: 'success', text: 'Draft updated successfully' });
        setEditingId(null);
        setEditData({});
        
        // Force immediate UI refresh
        setTimeout(() => {
          loadItems(); // Reload the list
        }, 100);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update draft' });
      }
    } catch (error) {
      console.error("Failed to save edit:", error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProcessingId(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const restoreRecord = async (item: Row) => {
    console.log('🔄 Restore button clicked for:', item.id, item.savedAt);
    setProcessingId(item.id + '-restore');
    setMessage(null);

    try {
      console.log('📤 Sending restore request:', { id: item.id, savedAt: item.savedAt });
      
      const res = await fetch("/api/restore-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          savedAt: item.savedAt
        }),
      });

      const result = await res.json();
      console.log('📥 Restore response:', result);

      if (result.success) {
        setMessage({ type: 'success', text: 'Record restored to draft successfully' });
        
        // Reload the list to show updated data
        console.log('🔄 Reloading items after restore...');
        loadItems();
        
        // Auto-switch to draft tab to show the restored record
        setTimeout(() => {
          console.log('🔄 Switching to draft tab...');
          setActiveTab('draft');
        }, 500);
      } else {
        console.log('❌ Restore failed:', result.error);
        setMessage({ type: 'error', text: result.error || 'Failed to restore record' });
      }
    } catch (error) {
      console.error("Failed to restore record:", error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProcessingId(null);
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
    // Get current user role for permission checking
    let canDelete = false;
    let actionText = 'record';
    
    try {
      const userRes = await fetch('/api/user/');
      const userData = await userRes.json();
      const userRole = userData.user?.role;
      
      // Role-based permission checking
      switch (userRole) {
        case 'submitter':
          canDelete = item.status === 'draft';
          actionText = 'draft';
          break;
        case 'reviewer':
          canDelete = item.status === 'submitted'; // Reviewers can only delete submitted (unreviewed) records
          actionText = 'submitted record';
          break;
        case 'approver':
          canDelete = ['reviewed', 'approved', 'rejected'].includes(item.status);
          actionText = 'reviewed record';
          break;
        case 'admin':
          canDelete = true; // Admins can delete anything
          actionText = 'record';
          break;
        default:
          canDelete = false;
      }
      
      if (!canDelete) {
        let errorMsg = '';
        switch (userRole) {
          case 'submitter':
            errorMsg = 'Submitters can only delete unsubmitted draft records';
            break;
          case 'reviewer':
            errorMsg = 'Reviewers can only delete submitted (unreviewed) records, not reviewed data';
            break;
          case 'approver':
            errorMsg = 'Approvers can only delete reviewed, approved, or rejected records';
            break;
          default:
            errorMsg = 'You do not have permission to delete this record';
        }
        setMessage({ type: 'error', text: errorMsg });
        return;
      }
      
    } catch (error) {
      console.error('Failed to check user permissions:', error);
      setMessage({ type: 'error', text: 'Failed to verify delete permissions' });
      return;
    }

    if (!confirm(`Are you sure you want to delete this ${actionText}: ${item.label}?`)) {
      return;
    }

    setProcessingId(item.id + '-delete');
    setMessage(null);
    
    try {
      // Remove from localStorage
      const stored = localStorage.getItem('datacollect_submissions');
      if (stored) {
        const localData = JSON.parse(stored);
        const filtered = localData.filter((localItem: Row) => 
          !(localItem.id === item.id && localItem.savedAt === item.savedAt)
        );
        localStorage.setItem('datacollect_submissions', JSON.stringify(filtered));
      }

      // Remove from server storage
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
        setMessage({ type: 'success', text: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} deleted successfully` });
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
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const submitDraft = async (id: string) => {
    const note = prompt("Please provide a message for this submission:");
    
    // If user cancels the prompt or enters empty message, don't proceed
    if (note === null || note.trim() === "") {
      if (note === null) {
        setMessage({ type: 'error', text: 'Submission cancelled' });
      } else {
        setMessage({ type: 'error', text: 'Message is required for submission' });
      }
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    setProcessingId(id);
    setMessage(null);
    
    try {
      const res = await fetch("/api/update-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indicatorId: id,
          status: "submitted",
          submitterMessage: note.trim()
        }),
      });
      
      const result = await res.json();
      
      if (result.ok) {
        setMessage({ type: 'success', text: `Draft submitted successfully with message: "${note.trim()}"` });
        
        // Force immediate UI update
        setItems(prev => prev.filter(item => item.id !== id));
        
        // Reload the list with delay to ensure database update
        setTimeout(() => {
          loadItems();
          setActiveTab("pending"); // Auto-switch to pending tab (submitted records)
        }, 100);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit draft' });
      }
    } catch (error) {
      console.error("Failed to submit draft:", error);
      setMessage({ 
        type: 'error', 
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` 
      });
    } finally {
      setProcessingId(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Submissions</h1>
      
      {message && (
        <div className={`px-4 py-2 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('draft')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'draft'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Draft ({allItems.filter(item => item.status === 'draft').length})
          </button>
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
        <div className="p-4 bg-white border rounded">
          No {activeTab} submissions found.
        </div>
      )}
      
      {items.map(item => (
        <div key={item.id} className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm text-gray-500">{item.id} • {item.section} • {item.level}</div>
              <div className="font-medium text-lg">{item.label}</div>
              <div className="text-xs text-gray-500">Submitted: {new Date(item.savedAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              {item.status === 'draft' && (
                <>
                  <button
                    onClick={() => startEdit(item)}
                    className="btn btn-outline"
                    disabled={processingId === item.id + '-delete'}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => submitDraft(item.id)}
                    className="btn btn-primary"
                    disabled={processingId === item.id + '-delete'}
                  >
                    {processingId === item.id ? "Submitting..." : "Submit"}
                  </button>
                  <button
                    onClick={() => deleteRecord(item)}
                    className="btn btn-red"
                    disabled={processingId === item.id + '-delete'}
                  >
                    {processingId === item.id + '-delete' ? "Deleting..." : "Delete"}
                  </button>
                  <div className="text-sm text-gray-600 font-medium">
                    📝 Draft
                  </div>
                </>
              )}
              {item.status === 'submitted' && (
                <div className="text-sm text-yellow-600 font-medium">
                  ⏳ Pending Review
                </div>
              )}
              {item.status === 'reviewed' && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Reviewed
                </div>
              )}
              {item.status === 'approved' && (
                <div className="text-sm text-green-600 font-medium">
                  ✅ Approved
                </div>
              )}
              {item.status === 'rejected' && (
                <div className="text-sm text-red-600 font-medium">
                  ✗ Rejected
                </div>
              )}
              {item.status === 'deleted' && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600 font-medium">
                    🗑️ Deleted
                  </div>
                  {currentUser === item.user && (
                    <button
                      onClick={() => restoreRecord(item)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                      disabled={processingId === item.id + '-restore'}
                    >
                      {processingId === item.id + '-restore' ? "Restoring..." : "↩️ Restore to Draft"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {editingId === item.id ? (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Edit Draft</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="text"
                    value={editData.value || ''}
                    onChange={(e) => setEditData({...editData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editData.unit || ''}
                    onChange={(e) => setEditData({...editData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={editData.frequency || ''}
                    onChange={(e) => setEditData({...editData, frequency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <input
                    type="text"
                    value={editData.period || ''}
                    onChange={(e) => setEditData({...editData, period: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsible</label>
                  <input
                    type="text"
                    value={editData.responsible || ''}      
                    onChange={(e) => setEditData({...editData, responsible: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter comma-separated values"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disaggregation</label>
                  <input
                    type="text"
                    value={editData.disaggregation || ''}
                    onChange={(e) => setEditData({...editData, disaggregation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter comma-separated values"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(item.id)}
                  className="btn btn-primary"
                  disabled={processingId === item.id}
                >
                  {processingId === item.id ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="btn btn-outline"
                  disabled={processingId === item.id}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Value:</span> {item.value}
              </div>
              <div>
                <span className="font-medium">Unit:</span> {item.unit}
              </div>
              <div>
                <span className="font-medium">Frequency:</span> {item.frequency}
              </div>
              <div>
                <span className="font-medium">Period:</span> {item.period || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Responsible:</span> {item.responsible || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Disaggregation:</span> {item.disaggregation || 'Not specified'}
              </div>
              {item.notes && (
                <div className="col-span-2">
                  <span className="font-medium">Notes:</span> {item.notes}
                </div>
              )}
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
