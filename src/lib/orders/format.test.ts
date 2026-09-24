import { describe, expect, it } from "vitest";

import { formatCpfOrCnpj, formatDateTime, priorityLabel, statusLabel } from "@/lib/orders/format";

describe("format", () => {
  it("gives every status and priority a readable label", () => {
    expect(statusLabel("IN_PROGRESS")).toBe("In progress");
    expect(statusLabel("CANCELED")).toBe("Canceled");
    expect(priorityLabel("HIGH")).toBe("High");
  });

  it("shows dates in São Paulo time, whatever the server's time zone", () => {
    // 13:30 UTC is 10:30 in São Paulo (UTC-3). Some Node versions put a narrow space before "AM",
    // so every kind of space is normalized before comparing.
    expect(formatDateTime("2026-09-23T13:30:00Z").replace(/\s/g, " ")).toBe("Sep 23, 2026, 10:30 AM");
  });

  it("formats a CPF and a CNPJ, including the new alphanumeric CNPJ", () => {
    expect(formatCpfOrCnpj("52998224725")).toBe("529.982.247-25");
    expect(formatCpfOrCnpj("45287193000141")).toBe("45.287.193/0001-41");
    expect(formatCpfOrCnpj("12ABC34501DE35")).toBe("12.ABC.345/01DE-35");
  });

  it("shows any other value as it came", () => {
    expect(formatCpfOrCnpj("123")).toBe("123");
  });
});
