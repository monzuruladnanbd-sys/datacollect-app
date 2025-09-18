import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRows } from "@/lib/storage";

export async function GET(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "submitted";
  const allStatuses = url.searchParams.get("all") === "true";
  
  try {
    const allItems = getRows();
    console.log("All items in storage:", allItems.length);
    console.log("User:", user.email, "Role:", user.role);
    console.log("Requested status:", status, "All statuses:", allStatuses);
    
    // Filter by status, user role, and data presence
    const filteredItems = allItems.filter(item => {
      const hasData = item.value && item.value.trim() !== "" && 
                     item.savedAt && item.savedAt.trim() !== "";
      
      if (!hasData) {
        console.log("Item filtered out - no data:", item.id);
        return false;
      }
      
      const statusMatch = allStatuses || item.status === status;
      const roleMatch = 
        (user.role === "submitter" && item.user === user.email) ||
        (user.role === "reviewer" && (allStatuses || status === "submitted" || item.status === "reviewed" || item.status === "rejected")) ||
        (user.role === "approver" && (allStatuses || status === "reviewed" || status === "submitted"));
      
      console.log(`Item ${item.id}: statusMatch=${statusMatch}, roleMatch=${roleMatch}, status=${item.status}, user=${item.user}`);
      
      return statusMatch && roleMatch;
    });
    
    // Group by indicator ID and get the most recent submission for each
    const itemsMap = new Map<string, any>();
    
    for (const item of filteredItems) {
      const existing = itemsMap.get(item.id);
      if (!existing || new Date(item.savedAt) > new Date(existing.savedAt)) {
        itemsMap.set(item.id, item);
      }
    }
    
    const items = Array.from(itemsMap.values());
    
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("List API error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load data" }, { status: 500 });
  }
}