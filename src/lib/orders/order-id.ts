// The {id} segment of /orders/{id} as the API expects it: a positive whole number, or null when it is not one
export function parseOrderId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
