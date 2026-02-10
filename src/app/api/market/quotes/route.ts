import { NextResponse } from "next/server";

import { getFmpQuotes } from "@/lib/market";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols") ?? "";
  const symbols = symbolsParam
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);

  const { quotes, error } = await getFmpQuotes(symbols);

  return NextResponse.json({
    symbols,
    quotes: Object.fromEntries(quotes.entries()),
    error,
  });
}
