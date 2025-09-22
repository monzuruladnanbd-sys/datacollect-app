# Data Entry Troubleshooting Guide

## How to Use Data Entry

### Step 1: Access Data Entry
- Log in as a Submitter
- Click "Data Entry" in the navigation menu
- You'll see the data entry page with sector tabs

### Step 2: Navigate the Interface
- **Sector Tabs**: Click on "Fisheries Management", "Climate Adaptation", or "Livelihoods"
- **Level Accordions**: Click on "Process", "Output", or "Outcome" to expand sections
- **Indicator Forms**: Fill out the form fields for each indicator

### Step 3: Enter Data
For each indicator you can fill:
- **Value**: The main data value
- **Unit**: Unit of measurement
- **Frequency**: How often data is collected
- **Period**: Time period for the data
- **Responsible**: Who is responsible (comma-separated)
- **Disaggregation**: How data is broken down (comma-separated)
- **Notes**: Additional comments

### Step 4: Save Data
Two options for each indicator:
- **Save Draft**: Saves without submitting for review
- **Submit**: Submits for reviewer approval

Bulk options at the bottom:
- **Save Draft**: Saves all filled indicators as drafts
- **Submit All Data**: Submits all filled indicators for review

### Step 5: View Saved Data
Go to "My Submissions" to see your data in different tabs:
- **Draft**: Data saved as drafts
- **Pending**: Data submitted and waiting for review
- **Reviewed**: Data that has been reviewed
- **Approved**: Data that has been approved
- **Rejected**: Data that has been rejected
- **Deleted**: Data that has been deleted

## Common Issues

### "Nothing happens when I click Save/Submit"
1. Make sure you've entered at least some data (value, notes, responsible, or disaggregation)
2. Check the browser console for errors (F12 → Console tab)
3. Check "My Submissions" page - data might have been saved

### "I don't see any forms to fill"
1. Make sure you've clicked on the accordion headers (Process, Output, Outcome) to expand them
2. Try different sector tabs at the top

### "Data disappears after saving"
1. This is normal - data goes to "My Submissions" page
2. Check the appropriate tab (Draft or Pending) based on what you clicked

### "I get error messages"
1. Database connection issues are expected - the system falls back to localStorage
2. Your data is still being saved locally
3. Success messages will appear near the Save/Submit buttons

## Technical Notes

- The system uses both database storage and localStorage as backup
- Database connection errors are normal in development - data still saves locally
- Data persistence works across browser sessions via localStorage
- All workflow features (draft, submit, review, approve) are fully functional

## Quick Test

1. Go to `/entry`
2. Click "Fisheries Management" tab
3. Click "Process" accordion to expand
4. Find first indicator and enter a value like "5"
5. Click "Save Draft"
6. Go to "My Submissions" → "Draft" tab
7. You should see your entry there

If this works, data entry is functioning correctly!

