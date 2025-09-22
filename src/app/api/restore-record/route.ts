import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRows, updateSpecificRow } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, savedAt } = await req.json();
    
    if (!id || !savedAt) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Restore record request:', { id, savedAt, user: session.user.email });

    // Get all records to find the specific deleted record
    const allRows = await getRows();
    console.log('All rows count:', allRows.length);
    console.log('Looking for record with id:', id, 'savedAt:', savedAt, 'status: deleted');
    
    const deletedRecord = allRows.find(row => 
      row.id === id && 
      row.savedAt === savedAt && 
      row.status === 'deleted'
    );

    console.log('Found deleted record:', deletedRecord);

    if (!deletedRecord) {
      console.log('No deleted record found for ID:', id);
      console.log('Available records with this ID:', allRows.filter(row => row.id === id));
      return NextResponse.json({ 
        success: false, 
        error: 'Deleted record not found' 
      }, { status: 404 });
    }

    // Check if the current user is the original owner of the record
    if (deletedRecord.user !== session.user.email) {
      console.log('User mismatch:', { recordUser: deletedRecord.user, currentUser: session.user.email });
      return NextResponse.json({ 
        success: false, 
        error: 'You can only restore your own deleted records' 
      }, { status: 403 });
    }

    // Only submitters can restore their own deleted records
    if (session.user.role !== 'submitter') {
      console.log('Invalid role for restore:', session.user.role);
      return NextResponse.json({ 
        success: false, 
        error: 'Only submitters can restore deleted records' 
      }, { status: 403 });
    }

    // Restore the record to draft status using updateSpecificRow with user tracking
    const currentTimestamp = new Date().toISOString();
    await updateSpecificRow(id, savedAt, {
      status: 'draft',
      savedAt: currentTimestamp,
      submitterMessage: '',
      reviewerMessage: '',
      approverMessage: '',
      restoredBy: session.user.email,
      restoredAt: currentTimestamp
    });

    console.log('Record restored to draft:', id);

    return NextResponse.json({ 
      success: true, 
      message: 'Record restored to draft successfully' 
    });

  } catch (error) {
    console.error('Restore record error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to restore record' 
    }, { status: 500 });
  }
}
