import { NextResponse } from "next/server";

import { getMobileSnapshot } from "@/lib/mobile/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getMobileSnapshot();
  return NextResponse.json(snapshot.issues);
}
