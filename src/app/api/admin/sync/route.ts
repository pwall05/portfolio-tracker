import { NextResponse } from "next/server";

import { syncFinancials } from "@/lib/sync";

const AUTH_HEADER = "x-sync-token";

export async function POST(request: Request) {
  const token = request.headers.get(AUTH_HEADER);
  const expected = process.env.SYNC_TOKEN;

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncFinancials();

  return NextResponse.json({ ok: true, ...result });
}
