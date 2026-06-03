import { promises as fs } from "fs";
import path from "path";

import { getFmpQuotes } from "@/lib/market";
import type {
  MobileCompany,
  MobilePortfolioSnapshot,
} from "@/lib/mobile/types";

const SNAPSHOT_PATH =
  process.env.MOBILE_SNAPSHOT_PATH ||
  path.join(process.cwd(), "data", "mobile-snapshot.json");

const emptySnapshot: MobilePortfolioSnapshot = {
  generatedAt: new Date(0).toISOString(),
  companies: [],
  baskets: [],
  theses: [],
  issues: [
    {
      severity: "error",
      filePath: "data/mobile-snapshot.json",
      code: "snapshot_missing",
      message: "Mobile snapshot has not been generated yet.",
      suggestedFix: "Run npm run snapshot:mobile.",
    },
  ],
};

function canQuote(company: MobileCompany) {
  if (company.assetType && !/stock|etf/i.test(company.assetType)) {
    return false;
  }

  return /^[A-Z][A-Z0-9.]{0,9}$/.test(company.ticker);
}

export async function getMobileSnapshot(): Promise<MobilePortfolioSnapshot> {
  try {
    const raw = await fs.readFile(SNAPSHOT_PATH, "utf8");
    return JSON.parse(raw) as MobilePortfolioSnapshot;
  } catch {
    return emptySnapshot;
  }
}

export async function getMobileSnapshotWithMarket(): Promise<MobilePortfolioSnapshot> {
  const snapshot = await getMobileSnapshot();
  const symbols = snapshot.companies.filter(canQuote).map((company) => company.ticker);
  const { quotes, formatMoney, formatMarketCap, formatDayChange } =
    await getFmpQuotes(symbols);

  return {
    ...snapshot,
    companies: snapshot.companies.map((company) => {
      const quote = quotes.get(company.ticker.toUpperCase());

      if (!quote?.price) {
        return company;
      }

      return {
        ...company,
        market: {
          price: formatMoney(quote.price),
          dayChange:
            formatDayChange(quote.price, quote.change, quote.changesPercentage) ||
            company.market?.dayChange,
          marketCap: formatMarketCap(quote.marketCap) || company.market?.marketCap,
        },
      };
    }),
  };
}

export async function getMobileCompany(ticker: string) {
  const snapshot = await getMobileSnapshotWithMarket();
  return snapshot.companies.find(
    (company) => company.ticker.toUpperCase() === ticker.toUpperCase()
  );
}
