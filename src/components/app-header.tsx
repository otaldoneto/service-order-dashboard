import Link from "next/link";

import { logout } from "@/app/actions/auth";
import type { CurrentUser } from "@/lib/api/types";

export function AppHeader({ user }: { user: CurrentUser }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
      <Link href="/" className="text-xl font-semibold">
        Service Order Dashboard
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {user.email} · {user.roles.join(", ")}
        </span>
        <form action={logout}>
          <button
            type="submit"
            className="text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
