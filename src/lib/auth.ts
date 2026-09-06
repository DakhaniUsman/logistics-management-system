export const AUTH_COOKIE_NAME = "floq_session";

const DEFAULT_SECRET = "floq-enterprise-security-token-secret-2026-key";

function getSecretKey(): string {
  return process.env.AUTH_SECRET || DEFAULT_SECRET;
}

// Convert string to Uint8Array
function stringToUint8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer / Uint8Array to base64url
function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Convert base64url to Uint8Array
function base64UrlToUint8(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Import CryptoKey for HMAC-SHA256
async function getCryptoKey(): Promise<CryptoKey> {
  const secret = getSecretKey();
  const keyData = stringToUint8(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface SessionPayload {
  email: string;
  exp: number; // Unix timestamp in seconds
}

/**
 * Creates a cryptographically signed session token valid for 7 days.
 */
export async function createSessionToken(email: string): Promise<string> {
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };

  const encodedPayload = bufferToBase64Url(
    stringToUint8(JSON.stringify(payload))
  );

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    stringToUint8(encodedPayload) as unknown as BufferSource
  );

  const encodedSignature = bufferToBase64Url(signatureBuffer);
  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies the signed session token. Returns valid: true and email if valid and not expired.
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<{ valid: boolean; email?: string }> {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [encodedPayload, encodedSignature] = parts;

  try {
    const key = await getCryptoKey();
    const signatureBytes = base64UrlToUint8(encodedSignature);
    const dataBytes = stringToUint8(encodedPayload);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      dataBytes as unknown as BufferSource
    );

    if (!isValid) {
      return { valid: false };
    }

    const jsonStr = new TextDecoder().decode(base64UrlToUint8(encodedPayload));
    const payload: SessionPayload = JSON.parse(jsonStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}
