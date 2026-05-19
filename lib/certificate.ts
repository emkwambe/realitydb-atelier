export interface BizCertificate {
  certId: string;
  userId: string;
  userName: string;
  userEmail: string;
  company: string;        // slug, e.g. "novapay"
  companyLabel: string;   // human label, e.g. "NovaPay"
  score: number;
  passed: boolean;
  submissionId?: string;
  issuedAt: string;       // ISO timestamp
  publicKeyId?: string;
}

/**
 * Generate a Business Acumen certificate ID.
 * Format: RDB-BIZ-[unix-ts-base36]-[random-8-hex]
 * Example: RDB-BIZ-LP3K2-4F9A1B2C
 */
export function generateCertId(): string {
  const ts = Math.floor(Date.now() / 1000).toString(36).toUpperCase();
  const rand = randomHex(8).toUpperCase();
  return `RDB-BIZ-${ts}-${rand}`;
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    globalThis.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compute a SHA-256 signature over the canonical JSON of the cert.
 * MVP signing — Phase 2 will switch to Ed25519 via Cloudflare Worker.
 */
export async function signCertificate(
  cert: BizCertificate,
  secret: string = "realitydb-atelier-2026"
): Promise<string> {
  const canonical = canonicalize(cert);
  const enc = new TextEncoder();
  const data = enc.encode(canonical + "|" + secret);

  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.subtle !== "undefined"
  ) {
    const hash = await globalThis.crypto.subtle.digest("SHA-256", data);
    return bufToHex(hash);
  }
  // Node fallback for build / SSR — dynamic import keeps Edge runtime happy.
  const { createHash } = await import("crypto");
  return createHash("sha256").update(Buffer.from(data)).digest("hex");
}

function canonicalize(cert: BizCertificate): string {
  const ordered: Record<string, unknown> = {
    certId: cert.certId,
    userId: cert.userId,
    userName: cert.userName,
    userEmail: cert.userEmail,
    company: cert.company,
    companyLabel: cert.companyLabel,
    score: cert.score,
    passed: cert.passed,
    submissionId: cert.submissionId ?? null,
    issuedAt: cert.issuedAt,
    publicKeyId: cert.publicKeyId ?? "realitydb-atelier-2026",
  };
  return JSON.stringify(ordered);
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function linkedInShareUrl(cert: BizCertificate, baseUrl: string): string {
  const verifyUrl = `${baseUrl.replace(/\/$/, "")}/verify/${cert.certId}`;
  const params = new URLSearchParams({
    name: `RealityDb Atelier — ${cert.companyLabel} Business Acumen`,
    organizationName: "Mpingo Systems LLC",
    issueYear: String(new Date(cert.issuedAt).getUTCFullYear()),
    issueMonth: String(new Date(cert.issuedAt).getUTCMonth() + 1),
    certUrl: verifyUrl,
    certId: cert.certId,
  });
  return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&${params.toString()}`;
}
