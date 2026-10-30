import { NextResponse } from "next/server";

export async function GET() {
  // This old development endpoint used to disclose database health and the
  // number of users to anyone on the internet. Keep the route harmless until
  // it can be removed in a planned deployment.
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}
