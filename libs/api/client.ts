import { useAuthStore } from "@/store/use-auth-store";

/**
 * Browser-side client for the backend. Every request goes to the
 * same-origin proxy at /api/backend, which adds the bearer token from the
 * httpOnly session cookie and handles token refresh. So actions only pass
 * a path, never a token.
 */
const PROXY_BASE = "/api/backend";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    const raw = (data as { message?: unknown } | null)?.message;
    const message =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw)
          ? raw.join("; ")
          : `Request failed (${status})`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  /** Serialized into the query string. Null, undefined and "" are dropped. */
  params?: Record<string, QueryValue | QueryValue[]>;
}

function toQueryString(params?: RequestOptions["params"]): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== null && item !== undefined && item !== "") search.append(key, String(item));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

let signingOut = false;

/**
 * The proxy sends 401 only when the session can't be renewed. Clear it and
 * do a full page load to /login so no cached admin data survives.
 */
function endSession() {
  if (signingOut || typeof window === "undefined") return;
  signingOut = true;
  useAuthStore.getState().clear();
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
    // A full reload on purpose: router.push would keep the React Query cache.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/login?expired=1&next=${next}`);
  });
}

async function request<T>(
  method: string,
  path: string,
  body: unknown,
  { params, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(`${PROXY_BASE}${path}${toQueryString(params)}`, {
    ...init,
    method,
    headers: {
      accept: "application/json",
      // FormData sets its own multipart boundary.
      ...(body !== undefined && !isForm ? { "content-type": "application/json" } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  const data = await parseBody(res);
  if (res.status === 401) endSession();
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("DELETE", path, body, options),
};
