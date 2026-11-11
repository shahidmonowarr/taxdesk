import { createHash, randomBytes } from "node:crypto";

/** 256 bits of randomness, URL-safe. This is what goes in the cookie. */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Only this hash is stored, so a database leak cannot be replayed as cookies. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
