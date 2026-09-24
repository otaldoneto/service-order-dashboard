"use client";

import { useEffect } from "react";

// Error boundaries must be Client Components. In production, errors thrown on the server reach this
// component with a generic message only (details stay in the server logs), so the text here is generic too.
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 p-6 pt-24 text-center">
      <h1 className="text-lg font-semibold">Could not load the service orders</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        The API may still be waking up or be temporarily unavailable.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </main>
  );
}
