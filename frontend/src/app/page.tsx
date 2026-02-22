import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { signOut } from "next-auth/react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">EnvSync Auth Example</h1>

      <div className="rounded-xl border border-black/10 p-6 dark:border-white/20">
        {session ? (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Signed in as</p>
            <p className="mt-1 text-lg font-medium">{session.user?.email ?? session.user?.name ?? "Keycloak user"}</p>
            <Link
              className="mt-4 inline-flex h-10 items-center rounded-md bg-black px-4 text-sm font-medium text-white dark:bg-white dark:text-black"
              href={"/api/auth/signout"}
            >
              Sign out
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">You are not signed in.</p>
            <Link
              className="mt-4 inline-flex h-10 items-center rounded-md bg-black px-4 text-sm font-medium text-white dark:bg-white dark:text-black"
              href="/api/auth/signin/keycloak"
            >
              Sign in with Keycloak
            </Link>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <Link className="rounded-md border border-black/10 px-4 py-2 text-sm dark:border-white/20" href="/server">
          /server example
        </Link>
        <Link className="rounded-md border border-black/10 px-4 py-2 text-sm dark:border-white/20" href="/client">
          /client example
        </Link>
      </div>
      </main>

  );
}
