import { describe, expect, it } from "vitest";

import { ordersHref, parseOrderFilters } from "@/lib/orders/filters";

describe("parseOrderFilters", () => {
  it("returns no filters and the first page for an empty URL", () => {
    expect(parseOrderFilters({})).toEqual({ status: undefined, priority: undefined, title: undefined, page: 0 });
  });

  it("reads valid filters and turns the 1-based URL page into the 0-based API page", () => {
    const filters = parseOrderFilters({ status: "OPEN", priority: "HIGH", title: "printer", page: "3" });

    expect(filters).toEqual({ status: "OPEN", priority: "HIGH", title: "printer", page: 2 });
  });

  it("drops values the API would reject instead of sending them", () => {
    const filters = parseOrderFilters({ status: "BOGUS", priority: "urgent", page: "-4" });

    expect(filters).toEqual({ status: undefined, priority: undefined, title: undefined, page: 0 });
  });

  it("ignores a page that is not a whole number", () => {
    expect(parseOrderFilters({ page: "abc" }).page).toBe(0);
    expect(parseOrderFilters({ page: "2.5" }).page).toBe(0);
  });

  it("trims the title and treats a blank one as no filter", () => {
    expect(parseOrderFilters({ title: "  wi-fi  " }).title).toBe("wi-fi");
    expect(parseOrderFilters({ title: "   " }).title).toBeUndefined();
  });

  it("uses the first value when a parameter is repeated in the URL", () => {
    expect(parseOrderFilters({ status: ["FINISHED", "OPEN"] }).status).toBe("FINISHED");
  });
});

describe("ordersHref", () => {
  it("points to the plain list when there is nothing to keep", () => {
    expect(ordersHref({}, 0)).toBe("/");
  });

  it("keeps the filters and writes the page 1-based", () => {
    expect(ordersHref({ status: "OPEN", title: "wi fi" }, 1)).toBe("/?status=OPEN&title=wi+fi&page=2");
  });

  it("leaves the page out for the first page", () => {
    expect(ordersHref({ priority: "LOW" }, 0)).toBe("/?priority=LOW");
  });
});
