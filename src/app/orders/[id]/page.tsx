import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-header";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUser, getOrder } from "@/lib/api/orders";
import { requireAccessToken } from "@/lib/auth";
import { formatCpfOrCnpj, formatDateTime, priorityLabel } from "@/lib/orders/format";
import { parseOrderId } from "@/lib/orders/order-id";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-gray-600 dark:text-gray-400">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

export default async function OrderPage(props: PageProps<"/orders/[id]">) {
  const id = parseOrderId((await props.params).id);
  if (id === null) {
    notFound();
  }

  const token = await requireAccessToken();
  const [user, order] = await Promise.all([getCurrentUser(token), getOrder(token, id)]);
  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <AppHeader user={user} />
      <Link href="/" className="text-sm text-gray-600 underline dark:text-gray-400">
        ← Back to service orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Service order #{order.id}</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-3 text-2xl font-semibold">
            {order.title}
            <StatusBadge status={order.status} />
          </h1>
        </div>
        {/* A plain link, not <Link>: it points to a file download (a Route Handler), not to a page */}
        <a
          href={`/orders/${order.id}/report`}
          target="_blank"
          rel="noopener"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Download PDF report
        </a>
      </div>

      <dl className="grid gap-6 rounded-lg border border-gray-200 p-6 sm:grid-cols-2 dark:border-gray-800">
        <Field label="Priority">{priorityLabel(order.priority)}</Field>
        <Field label="Client">
          {order.client.name}
          <span className="block text-sm text-gray-600 dark:text-gray-400">
            {order.client.email} · {formatCpfOrCnpj(order.client.cpfOrCnpj)}
          </span>
        </Field>
        <Field label="Technician">
          {order.technician ? (
            <>
              {order.technician.name}
              <span className="block text-sm text-gray-600 dark:text-gray-400">{order.technician.specialty}</span>
            </>
          ) : (
            "Not assigned yet"
          )}
        </Field>
               {/* createdBy and lastModifiedBy are left out on purpose: they hold staff e-mails (such as the
            administrator's login), which a public demo must not reveal */}
        <Field label="Created">{formatDateTime(order.createdAt)}</Field>
        {order.finishedAt && <Field label="Finished">{formatDateTime(order.finishedAt)}</Field>}
        {order.lastModifiedAt && <Field label="Last modified">{formatDateTime(order.lastModifiedAt)}</Field>}
      </dl>

      <section>
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="mt-2 whitespace-pre-line">{order.description}</p>
      </section>

      {order.rootCauseReport && (
        <section>
          <h2 className="text-lg font-semibold">Root cause report</h2>
          <p className="mt-2 whitespace-pre-line">{order.rootCauseReport}</p>
        </section>
      )}
    </main>
  );
}
