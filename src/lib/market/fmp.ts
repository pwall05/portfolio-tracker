type FmpQuote = {
  symbol: string;
  price?: number;
  change?: number;
  changesPercentage?: number | string;
};

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
const DEFAULT_REVALIDATE = 60;

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function parsePercent(value: number | string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "number") {
    return value;
  }

  const cleaned = value.replace(/[()%]/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatDayChange(
  price?: number,
  change?: number,
  percentInput?: number | string
) {
  if (price === undefined) {
    return null;
  }

  const percent = parsePercent(percentInput);

  if (percent !== undefined) {
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(2)}% today`;
  }

  if (change !== undefined && price !== 0) {
    const percentFromChange = (change / (price - change)) * 100;
    const sign = percentFromChange >= 0 ? "+" : "";
    return `${sign}${percentFromChange.toFixed(2)}% today`;
  }

  return null;
}

export async function getFmpQuotes(symbols: string[], revalidate = DEFAULT_REVALIDATE) {
  if (!symbols.length) {
    return {
      quotes: new Map<string, FmpQuote>(),
      formatMoney,
      formatDayChange,
    };
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return {
      quotes: new Map<string, FmpQuote>(),
      formatMoney,
      formatDayChange,
    };
  }

  const uniqueSymbols = Array.from(new Set(symbols.map((symbol) => symbol.toUpperCase())));
  const params = new URLSearchParams({
    symbol: uniqueSymbols.join(","),
    apikey: apiKey,
  });

  const response = await fetch(`${FMP_BASE_URL}/quote?${params.toString()}`, {
    next: { revalidate },
  });

  if (!response.ok) {
    return {
      quotes: new Map<string, FmpQuote>(),
      formatMoney,
      formatDayChange,
    };
  }

  const data = (await response.json()) as FmpQuote[];
  const quotes = new Map<string, FmpQuote>(
    data
      .filter((item) => typeof item.symbol === "string")
      .map((item) => [item.symbol.toUpperCase(), item])
  );

  return { quotes, formatMoney, formatDayChange };
}
