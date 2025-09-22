import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteRow } from "@/lib/storage";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user || user.role !== "submitter") {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }
  
  const body = await req.json();
  const { id, savedAt } = body;
  
  if (!id || !savedAt) {
    return NextResponse.json({ ok: false, message: "ID and savedAt are required" }, { status: 400 });
  }
  
  try {
    await deleteRow(id, savedAt);
    console.log(`Deleted draft: ${id} saved at ${savedAt}`);
    
    return NextResponse.json({ 
      ok: true, 
      message: "Draft deleted successfully" 
    });
  } catch (error) {
    console.error("Delete draft API error:", error);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}




