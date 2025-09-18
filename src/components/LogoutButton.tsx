"use client";
export default function LogoutButton() {
  async function out() { await fetch("/api/logout/",{method:"POST"}); location.href="/"; }
  return <button onClick={out} className="border rounded px-3 py-1 bg-gray-100">Logout</button>;
}


