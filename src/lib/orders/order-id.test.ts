import { describe, expect, it } from "vitest";

import { parseOrderId } from "@/lib/orders/order-id";

describe("parseOrderId", () => {
  it("accepts a positive whole number", () => {
    expect(parseOrderId("42")).toBe(42);
  });

  it.each(["0", "-1", "abc", "4.2", "1e3", "", " 7", "99999999999999999999"])("rejects %j", (value) => {
    expect(parseOrderId(value)).toBeNull();
  });
});
