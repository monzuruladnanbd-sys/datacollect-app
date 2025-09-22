import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRows } from "@/lib/storage";

export async function GET(req: Request) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status');
    const allParam = url.searchParams.get('all');
    
    console.log("List API called with params:", { statusParam, allParam });
    
    // Get all items from storage
    const allItems = await getRows();
    console.log("Retrieved rows:", allItems.length);
    console.log("All items:", allItems.map(item => ({ id: item.id, status: item.status, value: item.value, savedAt: item.savedAt })));
    
    // Filter items based on parameters
    let items = allItems;
    
    // If status parameter is provided, filter by status
    if (statusParam) {
      items = items.filter(item => item.status === statusParam);
      console.log(`Filtered by status '${statusParam}':`, items.length, "items");
    } else if (allParam === 'true') {
      // If all=true is provided without status, assume it's the review page wanting all items
      console.log("All parameter detected, returning all items for review page");
    }
    
    // Basic data validation - only exclude completely empty records
    items = items.filter(item => {
      const hasValue = item.value && item.value.toString().trim() !== "";
      const hasNotes = item.notes && item.notes.trim() !== "";
      const hasAnyData = hasValue || hasNotes;
      return hasAnyData;
    });
    
    // Log full data for debugging
    console.log("Full items data:", items.map(item => ({ 
      id: item.id, 
      status: item.status, 
      value: item.value, 
      user: item.user 
    })));
    
    console.log("After data validation:", items.length, "items");
    console.log("Returning items:", items.map(item => ({ id: item.id, status: item.status, value: item.value })));
    
    return NextResponse.json(items);
  } catch (error) {
    console.error("List API error:", error);
    return NextResponse.json([]);
  }
}