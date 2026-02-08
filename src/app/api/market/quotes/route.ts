import { NextResponse } from "next/server";

import { getFmpQuotes } from "@/lib/market";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols") ?? "";
  const symbols = symbolsParam
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);

  const { quotes } = await getFmpQuotes(symbols);

  return NextResponse.json({
    symbols,
    quotes: Object.fromEntries(quotes.entries()),
  });
}
