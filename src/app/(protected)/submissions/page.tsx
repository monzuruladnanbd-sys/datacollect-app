"use client";
import { useState, useEffect } from "react";

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
};

export default function SubmissionsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [allItems, setAllItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected'>('draft');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Row>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const loadItems = async () => {
    setLoading(true);
    try {
      // Read directly from localStorage
      let stored = localStorage.getItem('datacollect_submissions');
      
      // If no data, create sample data
      if (!stored) {
        const sampleData = [{
          id: "FM-P-001",
          section: "Fisheries Management",
          level: "Project",
          label: "At-sea patrol missions / vessel inspections",
          value: "5",
          unit: "missions",
          frequency: "Quarterly",
          period: "2024 Q1",
          year: "2024",
          quarter: "Q1",
          responsible: "Compliance Unit, PMU M&E Specialist",
          disaggregation: "EEZ, Territorial waters",
          notes: "Sample data for testing",
          status: "draft",
          savedAt: new Date().toISOString(),
          submitterMessage: "",
          reviewerMessage: "",
          approverMessage: "",
          user: "submitter@example.com"
        }];
        localStorage.setItem('datacollect_submissions', JSON.stringify(sampleData));
        stored = JSON.stringify(sampleData);
      }
      
      const allData = JSON.parse(stored);
      console.log('Loaded from localStorage:', allData);
      setAllItems(allData);
      
      // Filter by active tab
      const filtered = allData.filter((item: Row) => {
        if (activeTab === 'draft') return item.status === 'draft';
        if (activeTab === 'pending') return item.status === 'submitted';
        if (activeTab === 'reviewed') return item.status === 'reviewed';
        if (activeTab === 'approved') return item.status === 'approved';
        if (activeTab === 'rejected') return item.status === 'rejected';
        return false;
      });
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
      const res = await fetch("/api/submit/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indicatorId: id,
          ...editData,
          action: "draft"
        }),
      });
      
      const result = await res.json();
      
      if (result.ok) {
        setMessage({ type: 'success', text: 'Draft updated successfully' });
        setEditingId(null);
        setEditData({});
        loadItems(); // Reload the list
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
      const res = await fetch("/api/update-draft/", {
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
        loadItems(); // Reload the list
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
                    disabled={processingId === item.id}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => submitDraft(item.id)}
                    className="btn btn-primary"
                    disabled={processingId === item.id}
                  >
                    {processingId === item.id ? "Submitting..." : "Submit"}
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
