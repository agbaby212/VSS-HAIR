import type { ApiErrorDetail } from "../lib/api";

// Thrown by the mock "business rules". A handler turns it into the standard error body.
export class MockApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.name = "MockApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}