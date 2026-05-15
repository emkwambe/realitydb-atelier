import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  generateCertId,
  signCertificate,
  type BizCertificate,
} from "@/lib/certificate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  userName: string;
  userEmail: string;
  company: string;
  companyLabel: string;
  score: number;
  submissionId?: string;
  // The browser sends its Supabase access token so the server can verify the session.
  accessToken?: string;
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.userName || !body.company || !body.companyLabel) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (typeof body.score !== "number" || body.score < 0 || body.score > 100) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey || !anonKey) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server." },
      { status: 503 }
    );
  }

  // Verify the user's session via the supplied access token.
  const userClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: body.accessToken
      ? { headers: { Authorization: `Bearer ${body.accessToken}` } }
      : undefined,
  });
  const { data: userResp, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userResp.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = userResp.user.id;
  const userEmail = userResp.user.email ?? body.userEmail ?? "";

  const cert: BizCertificate = {
    certId: generateCertId(),
    userId,
    userName: body.userName,
    userEmail,
    company: body.company,
    companyLabel: body.companyLabel,
    score: body.score,
    passed: body.score >= 70,
    submissionId: body.submissionId,
    issuedAt: new Date().toISOString(),
    publicKeyId: "realitydb-atelier-2026",
  };
  const signature = await signCertificate(cert);

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin
    .from("biz_certifications")
    .insert({
      cert_id: cert.certId,
      user_id: cert.userId,
      user_name: cert.userName,
      user_email: cert.userEmail,
      company: cert.company,
      company_label: cert.companyLabel,
      score: cert.score,
      passed: cert.passed,
      submission_id: cert.submissionId ?? null,
      signature,
      public_key_id: cert.publicKeyId,
      issued_at: cert.issuedAt,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Insert failed: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ...cert, signature, record: data });
}
