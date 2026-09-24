import Link from "next/link";

export default function OrderNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 p-6 pt-24 text-center">
      <h1 className="text-lg font-semibold">Service order not found</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">It may have been removed, or the link is wrong.</p>
      <Link href="/" className="text-sm underline">
        Back to service orders
      </Link>
    </main>
  );
}
