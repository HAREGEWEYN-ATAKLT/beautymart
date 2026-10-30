import { NextResponse } from "next/server";
import { reconcilePendingChapaPayments } from "../../../../lib/chapa-payment-reconciliation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "Scheduled job is not configured." }, { status: 500 });
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const chapaSecret = process.env.CHAPA_SECRET_KEY;
  if (!chapaSecret) return NextResponse.json({ error: "Chapa reconciliation is not configured." }, { status: 500 });
  try {
    const result = await reconcilePendingChapaPayments({ chapaSecret });
    return NextResponse.json({ success: true, ...result });
  } catch {
    console.error("Chapa payment reconciliation failed.");
    return NextResponse.json({ error: "Could not reconcile pending payments." }, { status: 500 });
  }
}
