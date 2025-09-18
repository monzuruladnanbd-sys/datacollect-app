import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
export async function POST(req: Request) {
  const { email, password } = await req.json();
  return NextResponse.json(await login(email, password));
}


