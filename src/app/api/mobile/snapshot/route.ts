import { NextResponse } from "next/server";

import { getMobileSnapshotWithMarket } from "@/lib/mobile/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getMobileSnapshotWithMarket());
}
