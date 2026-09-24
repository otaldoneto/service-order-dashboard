"use client";

import { useActionState } from "react";

import { enterAsDemo } from "@/app/actions/auth";

export function DemoLoginButton() {
  const [state, formAction, pending] = useActionState(enterAsDemo, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Enter as demo"}
      </button>
      {pending && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          The API runs on a free plan and may take up to a minute to wake up.
        </p>
      )}
      {state?.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
