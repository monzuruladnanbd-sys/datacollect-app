import { getSession } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { redirect } from "next/navigation";
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.user) redirect("/login");
  const { user } = session;
  return (
    <div>
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <nav className="flex gap-4">
            <Link href="/dashboard" className="font-semibold">Dashboard</Link>
            <Link href="/dashboard-performance">Performance Dashboard</Link>
        <Link href="/test-storage" className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">🧪 Test Storage</Link>
            {user.role==="submitter" && <Link href="/entry">Data Entry</Link>}
            {user.role==="submitter" && <Link href="/submissions">My Submissions</Link>}
            {user.role==="reviewer" && <Link href="/review">Review</Link>}
            {user.role==="approver" && <Link href="/review">Review</Link>}
            {user.role==="approver" && <Link href="/approve">Approve</Link>}
            {user.role==="admin" && <Link href="/admin">User Management</Link>}
            {user.role==="admin" && <Link href="/admin/roles">Role Management</Link>}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span>{user.name} • {user.role}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
}


