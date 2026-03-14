import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin/keycloak");

  const username = session.preferredUsername ?? session.user?.email ?? "user";

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-60 shrink-0 border-r border-white/5 bg-zinc-950 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 text-base font-bold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-xs font-black text-black">
              E
            </span>
            EnvSync
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <Link
            href="/dashbaord"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            <GridIcon />
            Projects
          </Link>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white transition-colors mt-auto"
          >
            <LogoutIcon />
            Sign out
          </Link>
        </nav>

        <div className="border-t border-white/5 px-4 py-3">
          <p className="truncate text-xs text-zinc-500">{username}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function GridIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}
