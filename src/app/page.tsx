import { logout } from "@/app/actions/auth";
import { apiRequest } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/types";
import { requireAccessToken } from "@/lib/auth";

export default async function HomePage() {
  const token = await requireAccessToken();
  const user = await apiRequest<CurrentUser>("/auth/me", { token });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Service Order Dashboard</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Sign out
          </button>
        </form>
      </header>
      <p className="mt-6">
        Signed in as <strong>{user.email}</strong> ({user.roles.join(", ")})
      </p>
    </main>
  );
}
