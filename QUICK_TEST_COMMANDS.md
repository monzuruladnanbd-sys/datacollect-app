# Quick Role Testing Commands

## 🚀 **Test the Application Now:**

### 1. **Open Application:**
```
http://localhost:3000
```
(If port 3000 is busy, try 3001 or 3002)

### 2. **Test User Accounts:**

#### **👤 Submitter Test:**
- **Login:** `submitter@example.com` / `password123`
- **Expected Navigation:** Data Entry, My Submissions
- **Test:** Create record → Save Draft → Submit → Check tabs
- **Delete Test:** Can only delete records in Draft tab

#### **👨‍💼 Reviewer Test:**
- **Login:** `reviewer@example.com` / `password123`
- **Expected Navigation:** My Submissions, Review
- **Test:** Review submitted records → Check Pending/Reviewed tabs
- **Delete Test:** Can only delete records in Pending tab (unreviewed)

#### **👑 Approver Test:**
- **Login:** `approver@example.com` / `password123`
- **Expected Navigation:** My Submissions, Approve
- **Test:** Approve/Reject reviewed records
- **Delete Test:** Can delete records in Pending tab (reviewed records)

---

## 🔍 **Quick Verification Steps:**

### **Step 1: Submitter Flow**
1. Login as submitter
2. Go to Data Entry
3. Fill FM-P-001 with value "10"
4. Click "Save Draft" → Should go to Draft tab
5. Click "Submit for Review" on draft → Should move to Pending tab
6. Try to delete in Pending tab → Should show error
7. **✅ Expected:** Only Draft records can be deleted by submitter

### **Step 2: Reviewer Flow**
1. Login as reviewer
2. Go to Review page
3. See the submitted record in Pending tab
4. Click "Review" → Should move to Reviewed tab
5. Try to delete a reviewed record → Should show error
6. **✅ Expected:** Only submitted (unreviewed) records can be deleted by reviewer

### **Step 3: Approver Flow**
1. Login as approver
2. Go to Approve page
3. See the reviewed record in Pending tab
4. Click "Delete" → Should move to Deleted tab
5. **✅ Expected:** Reviewed/approved/rejected records can be deleted by approver

---

## 🎯 **Expected Delete Permissions:**

| User Role | Can Delete |
|-----------|------------|
| **Submitter** | Draft records only |
| **Reviewer** | Submitted (unreviewed) records only |
| **Approver** | Reviewed, approved, rejected records |
| **Admin** | All records |

---

## 🚨 **What Should Happen:**

### **✅ Working Correctly:**
- Records move between tabs based on status changes
- Delete buttons only appear for authorized record types
- Error messages show for unauthorized delete attempts
- Deleted records appear in "Deleted" tab (not permanently removed)

### **❌ Issues to Report:**
- Delete button appears when it shouldn't
- Error messages don't appear for unauthorized actions
- Records don't move to correct tabs
- Delete functionality doesn't work at all

---

## 📋 **Current Status:**
- ✅ Role-based navigation implemented
- ✅ Delete permissions fixed for all roles
- ✅ "Deleted" tab added to all interfaces
- ✅ Records marked as "deleted" instead of permanently removed
- ✅ Workflow transitions working correctly
- ✅ Database with fallback functionality implemented

**Ready for testing! 🎉**


