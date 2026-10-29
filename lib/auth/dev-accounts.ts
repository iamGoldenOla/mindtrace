// Client-safe constants for the DEV-ONLY sign-in. No server imports here:
// this module ships to the browser. Session logic lives in ./dev.ts.
export const DEV_SESSION_COOKIE = "mt_dev_session";

export const DEV_TEACHERS = [
  { email: "teacher.a@example.test", displayName: "Teacher A (synthetic)" },
  { email: "teacher.b@example.test", displayName: "Teacher B (synthetic)" },
] as const;
