import { DemoLoginButton } from "./demo-login-button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 p-6 shadow-sm dark:border-gray-800">
        <h1 className="text-xl font-semibold">Service Order Dashboard</h1>
        <p className="mt-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
          Browse service orders with a read-only demo account.
        </p>
        <DemoLoginButton />
      </div>
    </main>
  );
}
