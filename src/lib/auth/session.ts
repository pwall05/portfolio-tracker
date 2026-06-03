export const SESSION_COOKIE = "portfolio_session";

function getSessionSecret() {
  return process.env.APP_SESSION_SECRET || process.env.APP_PASSWORD || "";
}

export function isAuthConfigured() {
  return Boolean(process.env.APP_PASSWORD);
}

export async function createSessionToken() {
  const secret = getSessionSecret();
  const password = process.env.APP_PASSWORD || "";
  const payload = `${password}:${secret}`;
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidSessionToken(token?: string) {
  if (!token || !isAuthConfigured()) {
    return false;
  }

  return token === (await createSessionToken());
}

export function isPasswordValid(password: unknown) {
  return typeof password === "string" && password === process.env.APP_PASSWORD;
}
