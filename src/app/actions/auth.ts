'use server';
import { getSession } from "@/lib/auth";

export async function logoutAction() {
  const s = await getSession();
  await s.destroy();
  return { ok: true };
}


