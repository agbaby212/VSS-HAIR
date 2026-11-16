import { HttpResponse } from "msw";
import { z, type ZodError } from "zod";
import { pageMetaSchema, type PageMeta } from "../shared";
import { releaseExpiredHolds } from "./db";
import { MockApiError } from "./errors";

// Full URL for a route, like api("/products"). The base comes from .env.local
export function api(path: string): string {
  return `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}${path}`;
}

// Success: the data is PARSED with the shared schema first. A mock that drifts from the contract fails here.
// Parsing also drops any extra keys, so internal fields cannot leak.
export function ok<S extends z.ZodTypeAny>(schema: S, data: z.input<S>, status = 200) {
  return HttpResponse.json({ data: schema.parse(data) }, { status });
}

export function okPage<S extends z.ZodTypeAny>(itemSchema: S, items: z.input<S>[], meta: PageMeta) {
  return HttpResponse.json({ data: z.array(itemSchema).parse(items), meta: pageMetaSchema.parse(meta) });
}

export function fail(status: number, code: string, message: string, details: { path: string; message: string }[] = []) {
  return HttpResponse.json({ error: { code, message, ...(details.length > 0 ? { details } : {}) } }, { status });
}

export function validationFail(error: ZodError) {
  const details = error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
  return fail(400, "VALIDATION_ERROR", "Invalid request", details);
}

export async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}

// Query string to a plain object. Empty values are dropped
export function queryObject(url: string): Record<string, string> {
  const result: Record<string, string> = {};
  new URL(url).searchParams.forEach((value, key) => {
    if (value !== "") result[key] = value;
  });
  return result;
}

// Wraps every handler: frees expired holds first (the real server runs a job for this),
// then turns thrown MockApiErrors into the standard error body
export async function guard(run: () => Response | Promise<Response>): Promise<Response> {
  try {
    releaseExpiredHolds();
    return await run();
  } catch (error) {
    if (error instanceof MockApiError) return fail(error.status, error.code, error.message, error.details);
    console.error("Mock API crashed (this is a bug in the mock, not in your screen):", error);
    return fail(500, "INTERNAL_ERROR", "Something went wrong on our side. Please try again.");
  }
}