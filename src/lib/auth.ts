import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData, type User, type Role } from "@/lib/session";
import { validateUserCredentials, getUserByEmail } from "@/lib/users";

// ---- Session helper (server-only, but not a "server action") ----
export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}

// Server actions moved to src/app/actions/auth.ts

// ---- Plain utility: NOT a server action ----
export function can(user: User | undefined, roles: Role[]) {
  return !!user && roles.includes(user?.role as Role);
}

// ---- API route helpers (not server actions) ----
export async function login(email: string, password: string) {
  const s = await getSession();
  const user = validateUserCredentials(email, password);
  if (!user) return { ok: false, message: "Invalid credentials" };
  
  s.user = { 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    role: user.role 
  };
  await s.save();
  return { ok: true };
}

export async function logout() {
  const s = await getSession();
  s.destroy();
}
