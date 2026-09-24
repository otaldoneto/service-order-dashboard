// Shown instantly while a page waits for the API, which can take up to a minute to wake up on Render
export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 p-6 pt-24 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      <p className="font-medium">Loading...</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        The API runs on a free plan and may take up to a minute to wake up.
      </p>
    </main>
  );
}
