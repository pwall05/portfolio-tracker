import { NextResponse } from "next/server";

import { getMobileSnapshotWithMarket } from "@/lib/mobile/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getMobileSnapshotWithMarket();
  return NextResponse.json(snapshot.companies);
}
