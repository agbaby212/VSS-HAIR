import { z } from "zod";

// Replaces Zod's default texts for the whole app. Messages written inside a schema (the phone rule) still win
z.setErrorMap((issue, context) => {
  if (issue.code === z.ZodIssueCode.invalid_type && issue.received === "undefined") {
    return { message: "This field is required" };
  }

  if (issue.code === z.ZodIssueCode.too_small && issue.type === "string") {
    const minimum = Number(issue.minimum);
    if (context.data === "" || minimum <= 1) {
      return { message: "This field is required" };
    }
    return { message: `Enter at least ${minimum} characters` };
  }

  if (issue.code === z.ZodIssueCode.too_big && issue.type === "string") {
    return { message: `Use ${Number(issue.maximum)} characters or fewer` };
  }

  if (issue.code === z.ZodIssueCode.invalid_string && issue.validation === "email") {
    return { message: "Enter a valid email address, like name@example.com" };
  }

  return { message: context.defaultError };
});