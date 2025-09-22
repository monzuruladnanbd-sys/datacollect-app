# Role-Based Functionality Testing Guide

## Overview
This guide covers testing all role-based permissions and workflow transitions in the Data Collection System.

## Test User Accounts

| Role | Email | Password |
|------|-------|----------|
| **Submitter** | `submitter@example.com` | `password123` |
| **Reviewer** | `reviewer@example.com` | `password123` |
| **Approver** | `approver@example.com` | `password123` |
| **Admin** | `admin@example.com` | `password123` |

---

## 🚀 **SUBMITTER ROLE TESTING**

### ✅ **Navigation Access:**
- ✅ **Data Entry** - Can access
- ✅ **My Submissions** - Can access
- ❌ **Review** - Should NOT appear
- ❌ **Approve** - Should NOT appear
- ❌ **Admin** - Should NOT appear

### ✅ **Data Entry Functionality:**
1. **Save Draft:**
   - Fill out data and click "Save Draft"
   - ✅ Should show: "✅ Draft saved! Check 'My Submissions' → 'Draft' tab"
   - ✅ Record should appear in My Submissions → Draft tab

2. **Submit for Review:**
   - Fill out data and click "Submit for Review"
   - ✅ Should show: "✅ Submitted for review! Check 'My Submissions' → 'Pending' tab"
   - ✅ Record should appear in My Submissions → Pending tab

3. **Submit Draft:**
   - Save a record as draft first
   - Go to My Submissions → Draft tab
   - Click "Submit for Review" on the draft
   - ✅ Record should move from Draft tab to Pending tab

### ✅ **My Submissions Tabs:**
- ✅ **Draft Tab** - Shows records with status "draft"
- ✅ **Pending Tab** - Shows records with status "submitted"
- ✅ **Reviewed Tab** - Shows records with status "reviewed"
- ✅ **Approved Tab** - Shows records with status "approved"
- ✅ **Rejected Tab** - Shows records with status "rejected"
- ✅ **Deleted Tab** - Shows records with status "deleted"

### ✅ **Delete Permissions:**
- ✅ **Draft Records** - Can delete (red Delete button should show)
- ❌ **Pending Records** - Cannot delete (no Delete button)
- ❌ **Reviewed Records** - Cannot delete (no Delete button)
- ❌ **Approved Records** - Cannot delete (no Delete button)
- ❌ **Rejected Records** - Cannot delete (no Delete button)

### ✅ **Edit Permissions:**
- ✅ **Draft Records** - Can edit (Edit button should show)
- ❌ **Other Statuses** - Cannot edit (no Edit button)

---

## 🔍 **REVIEWER ROLE TESTING**

### ✅ **Navigation Access:**
- ❌ **Data Entry** - Should NOT appear
- ✅ **My Submissions** - Can access (shows all records for oversight)
- ✅ **Review** - Can access
- ❌ **Approve** - Should NOT appear
- ❌ **Admin** - Should NOT appear

### ✅ **Review Page Functionality:**
1. **Pending Tab** - Shows records with status "submitted"
   - ✅ "Review" button should be available
   - ✅ "Reject" button should be available
   - ✅ "Delete" button should be available (for unreviewed records only)

2. **Review Action:**
   - Click "Review" on a submitted record
   - Add review message
   - ✅ Record should move to "Reviewed" tab with status "reviewed"

3. **Reject Action:**
   - Click "Reject" on a submitted record
   - Add rejection message
   - ✅ Record should move to "Rejected" tab with status "rejected"

### ✅ **Review Page Tabs:**
- ✅ **Pending Tab** - Shows records with status "submitted"
- ✅ **Reviewed Tab** - Shows records with status "reviewed"
- ✅ **Rejected Tab** - Shows records with status "rejected"
- ✅ **Approved Tab** - Shows records with status "approved"
- ✅ **Deleted Tab** - Shows records with status "deleted"

### ✅ **Delete Permissions:**
- ✅ **Submitted Records** - Can delete (Delete button should show)
- ❌ **Reviewed Records** - Cannot delete (no Delete button)
- ❌ **Approved Records** - Cannot delete (no Delete button)
- ❌ **Rejected Records** - Cannot delete (no Delete button)

---

## ✅ **APPROVER ROLE TESTING**

### ✅ **Navigation Access:**
- ❌ **Data Entry** - Should NOT appear
- ✅ **My Submissions** - Can access (shows all records for oversight)
- ❌ **Review** - Should NOT appear
- ✅ **Approve** - Can access
- ❌ **Admin** - Should NOT appear

### ✅ **Approve Page Functionality:**
1. **Pending Tab** - Shows records with status "reviewed"
   - ✅ "Approve" button should be available
   - ✅ "Reject" button should be available
   - ✅ "Delete" button should be available (for reviewed records)

2. **Approve Action:**
   - Click "Approve" on a reviewed record
   - Add approval message
   - ✅ Record should move to "Approved" tab with status "approved"

3. **Reject Action:**
   - Click "Reject" on a reviewed record
   - Add rejection message
   - ✅ Record should move to "Rejected" tab with status "rejected"

### ✅ **Approve Page Tabs:**
- ✅ **Pending Tab** - Shows records with status "reviewed"
- ✅ **Approved Tab** - Shows records with status "approved"
- ✅ **Rejected Tab** - Shows records with status "rejected"
- ✅ **Deleted Tab** - Shows records with status "deleted"

### ✅ **Delete Permissions:**
- ✅ **Reviewed Records** - Can delete (Delete button should show)
- ✅ **Approved Records** - Can delete (Delete button should show)
- ✅ **Rejected Records** - Can delete (Delete button should show)
- ❌ **Submitted Records** - Cannot delete (won't see them in Approve page)

---

## 🔄 **WORKFLOW TESTING**

### ✅ **Complete Workflow - Approval Path:**
1. **Submitter** creates and submits record → Status: `submitted`
2. **Reviewer** reviews record → Status: `reviewed`
3. **Approver** approves record → Status: `approved`

### ✅ **Complete Workflow - Rejection at Review:**
1. **Submitter** creates and submits record → Status: `submitted`
2. **Reviewer** rejects record → Status: `rejected`

### ✅ **Complete Workflow - Rejection at Approval:**
1. **Submitter** creates and submits record → Status: `submitted`
2. **Reviewer** reviews record → Status: `reviewed`
3. **Approver** rejects record → Status: `rejected`

### ✅ **Draft Workflow:**
1. **Submitter** saves as draft → Status: `draft`
2. **Submitter** submits draft → Status: `submitted`
3. Continue with normal workflow...

### ✅ **Delete Workflow:**
1. **Any authorized role** deletes record → Status: `deleted`
2. Record moves to "Deleted" tab in all relevant interfaces
3. Deleted records are preserved for audit trail

---

## 🚨 **Error Cases to Test**

### ✅ **Permission Denials:**
- ✅ Submitter trying to delete non-draft → Error message
- ✅ Reviewer trying to delete reviewed record → Error message
- ✅ Approver trying to delete unreviewed record → Error message

### ✅ **Navigation Restrictions:**
- ✅ Submitter accessing /review → Redirect or 403
- ✅ Submitter accessing /approve → Redirect or 403
- ✅ Reviewer accessing /approve → Redirect or 403

### ✅ **Data Validation:**
- ✅ Empty submissions should be rejected
- ✅ Invalid user roles should be handled gracefully

---

## 📊 **Testing Checklist**

### For Each Role:
- [ ] Login with test account
- [ ] Verify navigation menu shows correct options
- [ ] Test all accessible pages load correctly
- [ ] Test all button permissions (delete, edit, approve, etc.)
- [ ] Verify tab counts are accurate
- [ ] Test workflow transitions work correctly
- [ ] Test error messages for denied actions
- [ ] Verify records appear in correct tabs after status changes

### Cross-Role Testing:
- [ ] Submit record as Submitter, review as Reviewer, approve as Approver
- [ ] Test rejection at different stages
- [ ] Test delete permissions for each role
- [ ] Verify deleted records appear in Deleted tabs
- [ ] Test draft submission workflow

---

## 🎯 **Expected Results Summary**

| Action | Submitter | Reviewer | Approver |
|--------|-----------|----------|----------|
| **Create Records** | ✅ | ❌ | ❌ |
| **Edit Drafts** | ✅ | ❌ | ❌ |
| **Submit for Review** | ✅ | ❌ | ❌ |
| **Review Records** | ❌ | ✅ | ❌ |
| **Approve/Reject** | ❌ | ❌ | ✅ |
| **Delete Drafts** | ✅ | ❌ | ❌ |
| **Delete Submitted** | ❌ | ✅ | ❌ |
| **Delete Reviewed** | ❌ | ❌ | ✅ |
| **See All Records** | Own only | All | All |

---

**🔗 Application URL:** `http://localhost:3000` (or the current port)

**📝 Test Status:** Ready for comprehensive testing of all role-based functionality!


