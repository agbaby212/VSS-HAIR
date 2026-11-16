import { z } from "zod";
import { apiErrorBodySchema, dataEnvelope, pageMetaSchema, type PageMeta } from "../shared";

export const ADMIN_TOKEN_KEY = "vss_admin_token";

export type ApiErrorDetail = { path: string; message: string };

// Every failure becomes this one shape, so screens only need one kind of catch
export class ApiError extends Error {
  readonly status: number; // 0 means "no HTTP answer" (offline, or a bad response shape)
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown; // JSON object, or FormData for photo uploads
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal; // lets TanStack Query cancel old requests
};

function readToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null; // storage can be blocked (private mode), so never crash on it
  }
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = import.meta.env.VITE_API_URL;
  if (!base) {
    // No hard-coded host (client rule): the developer must set it in .env.local
    throw new ApiError(0, "CONFIG_ERROR", "VITE_API_URL is not set. Add it to client/.env.local and restart.");
  }
  const url = new URL(`${base.replace(/\/$/, "")}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

// Sends the request and returns the parsed JSON. Does not check the success shape yet.
async function request(path: string, options: RequestOptions): Promise<unknown> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = readToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const isForm = options.body instanceof FormData;
  // For FormData the browser sets the Content-Type itself (it must add the boundary)
  if (options.body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body:
        options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error; // a cancel is not a failure
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, "NETWORK_ERROR", "We could not reach the server. Check your internet and try again.");
  }

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    // an empty or non-JSON body is handled below
  }

  if (!response.ok) {
    const parsed = apiErrorBodySchema.safeParse(json);
    if (parsed.success) {
      const { code, message, details } = parsed.data.error;
      throw new ApiError(response.status, code, message, details ?? []);
    }
    throw new ApiError(response.status, "UNKNOWN_ERROR", "Something went wrong. Please try again.");
  }
  return json;
}

function badResponse(path: string, error: z.ZodError): ApiError {
  // Developers need the detail; it only shows in the console, never to customers
  console.error(`Response from ${path} does not match the contract`, error.issues);
  return new ApiError(0, "BAD_RESPONSE", "The server sent something we did not expect. Please try again.");
}

// Normal calls: { data: ... } validated with the schema you pass in
export async function apiFetch<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  options: RequestOptions = {},
): Promise<z.infer<S>> {
  const json = await request(path, options);
  const parsed = dataEnvelope(schema).safeParse(json);
  if (!parsed.success) throw badResponse(path, parsed.error);
  return parsed.data.data;
}

// Lists with { data: [...], meta: {...} }
export async function apiFetchPage<S extends z.ZodTypeAny>(
  path: string,
  itemSchema: S,
  options: RequestOptions = {},
): Promise<{ data: z.infer<S>[]; meta: PageMeta }> {
  const json = await request(path, options);
  const parsed = z.object({ data: z.array(itemSchema), meta: pageMetaSchema }).safeParse(json);
  if (!parsed.success) throw badResponse(path, parsed.error);
  return parsed.data;
}