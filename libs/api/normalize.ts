/**
 * Reads backend bodies without assuming one envelope. Member routes answer
 * `{ success, message, data }` or a bare body, and the admin routes document
 * no responses at all. ⚠️ PROVISIONAL: narrow these per route once each one
 * is typed from a live sample.
 */

/** One page of an admin list, whatever shape the route sent it in. */
export interface Page<T> {
  items: T[];
  /** Null when the route sends no total. */
  total: number | null;
  page: number;
  limit: number;
  /** Null when neither a page count nor a total came back. */
  totalPages: number | null;
}

type Bag = Record<string, unknown>;

const isBag = (value: unknown): value is Bag =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** `{ success, message, data }` → `data`; anything else as it came. */
export function unwrap<T>(raw: unknown): T {
  if (isBag(raw) && "data" in raw && ("success" in raw || "message" in raw)) return raw.data as T;
  return raw as T;
}

function firstArray(value: unknown, depth = 0): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (!isBag(value) || depth > 2) return null;
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) return child;
  }
  for (const child of Object.values(value)) {
    const found = firstArray(child, depth + 1);
    if (found) return found;
  }
  return null;
}

function findNumber(value: unknown, keys: string[], depth = 0): number | null {
  if (!isBag(value) || depth > 2) return null;
  for (const key of keys) {
    const hit = value[key];
    if (typeof hit === "number" && Number.isFinite(hit)) return hit;
  }
  for (const child of Object.values(value)) {
    const found = findNumber(child, keys, depth + 1);
    if (found !== null) return found;
  }
  return null;
}

/**
 * The rows and paging of a list body: a bare array, `{ data: [...], meta }`,
 * `{ items, total }`, or any of those inside the `{ success, data }` envelope.
 */
export function toPage<T>(
  raw: unknown,
  requested: { page?: number; limit?: number } = {},
): Page<T> {
  const body = unwrap<unknown>(raw);
  const items = (firstArray(body) ?? []) as T[];
  const total = findNumber(body, ["total", "totalCount", "count", "totalItems"]);
  const page = findNumber(body, ["page", "currentPage"]) ?? requested.page ?? 1;
  const limit =
    findNumber(body, ["limit", "pageSize", "perPage"]) ?? requested.limit ?? items.length;
  const totalPages =
    findNumber(body, ["totalPages", "pageCount", "pages"]) ??
    (total !== null && limit > 0 ? Math.max(1, Math.ceil(total / limit)) : null);
  return { items, total, page, limit, totalPages };
}
