#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const VAULT_PATH =
  process.env.OBSIDIAN_VAULT_PATH ||
  "/Users/paulmm/Documents/Obsidian Vault";

const OUTPUT_PATH =
  process.env.MOBILE_SNAPSHOT_PATH ||
  path.join(process.cwd(), "data", "mobile-snapshot.json");

const PORTFOLIO_REPORT_DATA_URL = cleanString(process.env.PORTFOLIO_REPORT_DATA_URL);
const PORTFOLIO_REPORT_DATA_TOKEN = cleanString(
  process.env.PORTFOLIO_REPORT_DATA_TOKEN || process.env.PORTFOLIO_REPORT_API_TOKEN
);

const COMPANY_PROFILE_DIR = "03 Entities/Companies";
const COMPANY_THESIS_DIR = "04 Thesis/Company";
const INVESTMENT_THESIS_DIR = "04 Thesis/Investment";
const WEEKLY_REPORT_DATA_DIR = "20 Personal/Weekly/Reports/Data";
const PORTFOLIO_REPORT_RE = /^(\d{4}-\d{2}-\d{2})-Portfolio-Data\.json$/;

const PROFILE_LEGACY_FIELDS = [
  "primary_thesis",
  "basket",
  "chokepoint_basket",
  "thesis_paths",
  "context_maps",
  "root_thesis",
];

const COMPANY_THESIS_LEGACY_FIELDS = [
  "root_thesis",
  "thesis_paths",
  "context_maps",
  "conviction",
  "position_status",
  "chokepoint_basket",
];

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function withoutMarkdownExtension(value) {
  return value.replace(/\.md$/i, "");
}

function cleanString(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => cleanString(item))
      .filter(Boolean)
      .join(", ");
  }

  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function cleanNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[$,%\s,]/g, ""));

  return Number.isFinite(number) ? number : undefined;
}

function normalizeKey(value) {
  return withoutMarkdownExtension(toPosixPath(value)).trim().toLowerCase();
}

function noteBasename(filePath) {
  return withoutMarkdownExtension(path.basename(filePath));
}

function listMarkdownFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const nextPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return listMarkdownFiles(nextPath);
    }

    return entry.isFile() && entry.name.endsWith(".md") ? [nextPath] : [];
  });
}

function readNote(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const relPath = toPosixPath(path.relative(VAULT_PATH, filePath));

  return {
    filePath,
    relPath,
    notePath: withoutMarkdownExtension(relPath),
    basename: noteBasename(filePath),
    data: parsed.data || {},
    content: parsed.content || "",
  };
}

function buildNoteIndex(notes) {
  const index = new Map();

  for (const note of notes) {
    const keys = [
      note.notePath,
      note.relPath,
      note.basename,
      path.basename(note.notePath),
    ];

    for (const key of keys) {
      index.set(normalizeKey(key), note);
    }
  }

  return index;
}

function parseWikiLink(value) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const text = cleanString(rawValue);

  if (!text || /^tbd$/i.test(text)) {
    return undefined;
  }

  const wikiMatch = text.match(/\[\[([^|\]#]+)(?:#[^|\]]+)?(?:\|([^\]]+))?\]\]/);
  if (wikiMatch) {
    const linkPath = withoutMarkdownExtension(wikiMatch[1].trim());
    const alias = wikiMatch[2]?.trim();

    return {
      label: alias || path.basename(linkPath),
      path: linkPath,
    };
  }

  const markdownMatch = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (markdownMatch) {
    const linkPath = withoutMarkdownExtension(markdownMatch[2].trim());
    return {
      label: markdownMatch[1].trim(),
      path: linkPath,
    };
  }

  return {
    label: path.basename(withoutMarkdownExtension(text)),
    path: withoutMarkdownExtension(text),
  };
}

function resolveLinkedNote(link, index) {
  if (!link?.path) {
    return undefined;
  }

  const normalizedPath = normalizeKey(link.path);
  const basename = normalizeKey(path.basename(link.path));

  return index.get(normalizedPath) || index.get(basename);
}

function normalizeStatus(value) {
  const status = cleanString(value)?.toLowerCase();

  if (status === "currently holding" || status === "watching") {
    return status;
  }

  return "unknown";
}

function symbolFromProfile(note) {
  const ticker = cleanString(note.data.ticker);
  const invalidTickers = new Set(["PRIVATE", "TBD", "N/A", "NA", "-"]);

  if (ticker && !invalidTickers.has(ticker.toUpperCase())) {
    return ticker.toUpperCase();
  }

  const fallback = note.basename.includes(" - ")
    ? note.basename.split(" - ")[0]
    : cleanString(note.data.name) || note.basename;

  return (
    fallback
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 10)
      .toUpperCase() || "UNKNOWN"
  );
}

function cleanMarkdown(text) {
  return text
    .replace(/\[\[([^|\]#]+)(?:#[^|\]]+)?\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^|\]#]+)(?:#[^\]]+)?\]\]/g, (_, linkPath) =>
      path.basename(linkPath)
    )
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^\|.*\|$/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseSections(content) {
  const sections = new Map();
  let currentHeading;
  let buffer = [];

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^#{2,4}\s+(.+?)\s*#*$/);
    if (match) {
      if (currentHeading) {
        sections.set(
          currentHeading.toLowerCase(),
          cleanMarkdown(buffer.join("\n"))
        );
      }

      currentHeading = match[1].trim();
      buffer = [];
      continue;
    }

    if (currentHeading) {
      buffer.push(line);
    }
  }

  if (currentHeading) {
    sections.set(currentHeading.toLowerCase(), cleanMarkdown(buffer.join("\n")));
  }

  return sections;
}

function firstSection(sections, headings) {
  for (const heading of headings) {
    const value = sections.get(heading.toLowerCase());
    if (value) {
      return value;
    }
  }

  return undefined;
}

function markdownListItems(text, limit = 6) {
  if (!text) {
    return undefined;
  }

  const bulletItems = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => cleanMarkdown(line.replace(/^[-*]\s+/, "")))
    .filter(Boolean);

  if (bulletItems.length > 0) {
    return bulletItems.slice(0, limit);
  }

  return text
    .split(/\n{2,}/)
    .map(cleanMarkdown)
    .filter(Boolean)
    .slice(0, limit);
}

function excerpt(text, maxLength = 420) {
  if (!text) {
    return undefined;
  }

  const compact = cleanMarkdown(text).replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength - 1).trim()}...`;
}

function buildProfileSummary(note) {
  const sections = parseSections(note.content);
  const keyRisks = markdownListItems(firstSection(sections, ["Key Risks"]), 5);

  return {
    oneLiner: excerpt(firstSection(sections, ["One-Liner", "One Liner"]), 360),
    whyItMatters: excerpt(firstSection(sections, ["Why It Matters"]), 520),
    financialSnapshot: excerpt(
      firstSection(sections, ["Financial Snapshot"]),
      520
    ),
    keyRisks,
  };
}

function buildThesisSections(note) {
  if (!note) {
    return {};
  }

  const sections = parseSections(note.content);
  const evidenceText = firstSection(sections, [
    "Evidence",
    "Why This Company Specifically",
  ]);
  const risksText = firstSection(sections, [
    "Risks / Bear Case",
    "Counter-Arguments & Risks",
  ]);

  return {
    coreThesis: excerpt(
      firstSection(sections, ["Core Thesis", "Core Claim"]),
      900
    ),
    currentView: excerpt(firstSection(sections, ["Current View"]), 700),
    dissentingView: excerpt(
      firstSection(sections, ["Dissenting View", "Variant Perception"]),
      700
    ),
    evidence: markdownListItems(evidenceText, 7),
    risks: markdownListItems(risksText, 7),
    investmentImplications: excerpt(
      firstSection(sections, ["Investment Implications", "How I'm Playing It"]),
      800
    ),
    whatWouldChangeMyMind: excerpt(
      firstSection(sections, ["What Would Change My Mind"]),
      700
    ),
  };
}

function compactObject(value) {
  if (Array.isArray(value)) {
    const items = value.map(compactObject).filter((item) => {
      if (Array.isArray(item)) {
        return item.length > 0;
      }
      return item !== undefined && item !== null && item !== "";
    });

    return items.length > 0 ? items : undefined;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compactObject(item)])
      .filter(([, item]) => {
        if (Array.isArray(item)) {
          return item.length > 0;
        }
        return item !== undefined && item !== null && item !== "";
      });

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }

  return value;
}

function issueFactory() {
  const issues = [];

  return {
    add({ severity = "warning", filePath, ticker, code, message, suggestedFix }) {
      issues.push(
        compactObject({
          severity,
          filePath,
          ticker,
          code,
          message,
          suggestedFix,
        })
      );
    },
    all() {
      return issues;
    },
  };
}

function hasField(data, field) {
  return Object.prototype.hasOwnProperty.call(data, field) && data[field] !== undefined;
}

function readNotes(relDir) {
  return listMarkdownFiles(path.join(VAULT_PATH, relDir))
    .map(readNote)
    .filter((note) => !/template/i.test(note.basename));
}

function latestPortfolioReportPath() {
  const explicitPath = cleanString(process.env.PORTFOLIO_REPORT_DATA_PATH);
  if (explicitPath) {
    return path.isAbsolute(explicitPath)
      ? explicitPath
      : path.join(process.cwd(), explicitPath);
  }

  const reportDir = path.join(VAULT_PATH, WEEKLY_REPORT_DATA_DIR);
  if (!fs.existsSync(reportDir)) {
    return undefined;
  }

  return fs
    .readdirSync(reportDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && PORTFOLIO_REPORT_RE.test(entry.name))
    .map((entry) => ({
      date: entry.name.match(PORTFOLIO_REPORT_RE)?.[1] || "",
      filePath: path.join(reportDir, entry.name),
    }))
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.filePath;
}

function normalizeHolding(item) {
  const ticker = cleanString(item?.ticker)?.toUpperCase();
  const name = cleanString(item?.name);
  const value = cleanNumber(item?.value);
  const weight = cleanNumber(item?.weight);
  const openPnl = cleanNumber(item?.openPnl);
  const optionLegs = cleanNumber(item?.optionLegs);

  if (!ticker || !name || value === undefined || weight === undefined) {
    return undefined;
  }

  return compactObject({
    ticker,
    name,
    basket: cleanString(item?.basket) || "Unassigned",
    primaryThesis: cleanString(item?.primaryThesis) || "No primary thesis",
    value,
    weight,
    openPnl: openPnl || 0,
    optionLegs: optionLegs || 0,
  });
}

function normalizeExposure(item) {
  const label = cleanString(item?.label);
  const value = cleanNumber(item?.value);
  const weight = cleanNumber(item?.weight);

  if (!label || value === undefined || weight === undefined) {
    return undefined;
  }

  return compactObject({
    label,
    value,
    weight,
    companies: Array.isArray(item?.companies)
      ? item.companies.map((ticker) => cleanString(ticker)?.toUpperCase()).filter(Boolean)
      : [],
  });
}

function normalizeAccount(item) {
  const label = cleanString(item?.label);
  const value = cleanNumber(item?.value);
  const weight = cleanNumber(item?.weight);

  if (!label || value === undefined || weight === undefined) {
    return undefined;
  }

  return { label, value, weight };
}

function normalizeSignal(item) {
  const title = cleanString(item?.title);
  const filePath = cleanString(item?.path);

  if (!title || !filePath) {
    return undefined;
  }

  return compactObject({
    title,
    path: filePath,
    linkedTickers: Array.isArray(item?.linkedTickers)
      ? item.linkedTickers
          .map((ticker) => cleanString(ticker)?.toUpperCase())
          .filter(Boolean)
      : [],
    modifiedAt: cleanString(item?.modifiedAt),
    impactScore: cleanNumber(item?.impactScore),
  });
}

async function fetchPortfolioReportData(issues) {
  if (!PORTFOLIO_REPORT_DATA_URL) {
    return undefined;
  }

  const headers = {};
  if (PORTFOLIO_REPORT_DATA_TOKEN) {
    headers.Authorization = `Bearer ${PORTFOLIO_REPORT_DATA_TOKEN}`;
  }

  try {
    const response = await fetch(PORTFOLIO_REPORT_DATA_URL, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      issues.add({
        severity: "warning",
        filePath: PORTFOLIO_REPORT_DATA_URL,
        code: "portfolio_report_api_fetch_failed",
        message: `Live portfolio report API returned ${response.status}.`,
        suggestedFix:
          "Check PORTFOLIO_REPORT_DATA_URL and PORTFOLIO_REPORT_DATA_TOKEN, then re-run npm run snapshot:mobile.",
      });
      return undefined;
    }

    const payload = await response.json();
    const data = payload?.report?.data || payload?.data || payload;
    return {
      data,
      sourcePath: PORTFOLIO_REPORT_DATA_URL,
    };
  } catch (error) {
    issues.add({
      severity: "warning",
      filePath: PORTFOLIO_REPORT_DATA_URL,
      code: "portfolio_report_api_fetch_failed",
      message: `Live portfolio report API could not be read: ${error.message}`,
      suggestedFix:
        "Check the live app URL, bearer token, and network connection, then re-run npm run snapshot:mobile.",
    });
    return undefined;
  }
}

function normalizePortfolioReport(parsed, sourcePath, issues) {
  const holdings = Array.isArray(parsed.holdings)
    ? parsed.holdings.map(normalizeHolding).filter(Boolean)
    : [];

  if (holdings.length === 0) {
    issues.add({
      severity: "warning",
      filePath: sourcePath,
      code: "portfolio_report_no_holdings",
      message: "Portfolio report data contains no holdings.",
      suggestedFix: "Regenerate the weekly portfolio data packet from PortfolioApp.",
    });
  }

  return compactObject({
    schemaVersion: cleanNumber(parsed.schemaVersion),
    reportDate: cleanString(parsed.reportDate),
    generatedAt: cleanString(parsed.generatedAt),
    sourcePath,
    window: compactObject({
      start: cleanString(parsed.window?.start),
      end: cleanString(parsed.window?.end),
    }),
    totals: compactObject({
      totalEquity: cleanNumber(parsed.totals?.totalEquity),
      qtradeEquity: cleanNumber(parsed.totals?.qtradeEquity),
      openingEquity: cleanNumber(parsed.totals?.openingEquity),
      ytdChange: cleanNumber(parsed.totals?.ytdChange),
      ytdChangePercent: cleanNumber(parsed.totals?.ytdChangePercent),
      weekChange: cleanNumber(parsed.totals?.weekChange),
      weekChangePercent: cleanNumber(parsed.totals?.weekChangePercent),
    }),
    holdings: holdings.sort((a, b) => b.value - a.value),
    baskets: Array.isArray(parsed.baskets)
      ? parsed.baskets.map(normalizeExposure).filter(Boolean)
      : [],
    theses: Array.isArray(parsed.theses)
      ? parsed.theses.map(normalizeExposure).filter(Boolean)
      : [],
    accounts: Array.isArray(parsed.accounts)
      ? parsed.accounts.map(normalizeAccount).filter(Boolean)
      : [],
    activity: compactObject({
      count: cleanNumber(parsed.activity?.count),
      tradeCount: cleanNumber(parsed.activity?.tradeCount),
      netCad: cleanNumber(parsed.activity?.netCad),
      netUsd: cleanNumber(parsed.activity?.netUsd),
    }),
    signals: Array.isArray(parsed.signals)
      ? parsed.signals.map(normalizeSignal).filter(Boolean)
      : [],
    dataNotes: Array.isArray(parsed.dataNotes)
      ? parsed.dataNotes.map(cleanString).filter(Boolean)
      : [],
  });
}

async function readPortfolioReport(issues) {
  const remoteReport = await fetchPortfolioReportData(issues);
  if (remoteReport?.data) {
    return normalizePortfolioReport(remoteReport.data, remoteReport.sourcePath, issues);
  }

  const reportPath = latestPortfolioReportPath();
  if (!reportPath) {
    issues.add({
      severity: "warning",
      filePath: WEEKLY_REPORT_DATA_DIR,
      code: "portfolio_report_missing",
      message: "No weekly portfolio data packet was found.",
      suggestedFix:
        "Generate a weekly portfolio report or set PORTFOLIO_REPORT_DATA_PATH.",
    });
    return undefined;
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  } catch (error) {
    issues.add({
      severity: "error",
      filePath: toPosixPath(path.relative(VAULT_PATH, reportPath)),
      code: "portfolio_report_invalid_json",
      message: `Portfolio report data could not be parsed: ${error.message}`,
      suggestedFix: "Regenerate the weekly portfolio data packet.",
    });
    return undefined;
  }

  return normalizePortfolioReport(
    parsed,
    toPosixPath(path.relative(VAULT_PATH, reportPath)),
    issues
  );
}

async function main() {
  const profileNotes = readNotes(COMPANY_PROFILE_DIR);
  const companyThesisNotes = readNotes(COMPANY_THESIS_DIR);
  const investmentNotes = readNotes(INVESTMENT_THESIS_DIR);

  const profileIndex = buildNoteIndex(profileNotes);
  const companyThesisIndex = buildNoteIndex(companyThesisNotes);
  const investmentIndex = buildNoteIndex(investmentNotes);
  const issues = issueFactory();
  const portfolio = await readPortfolioReport(issues);
  const holdingByTicker = new Map(
    (portfolio?.holdings || []).map((holding) => [holding.ticker, holding])
  );

  const profileMeta = new Map(
    profileNotes.map((note) => [note.filePath, { note, symbol: symbolFromProfile(note) }])
  );

  const thesisByProfilePath = new Map();

  for (const thesisNote of companyThesisNotes) {
    const companyLink = parseWikiLink(thesisNote.data.company);
    const linkedProfile = resolveLinkedNote(companyLink, profileIndex);
    const primaryThesisLink = parseWikiLink(thesisNote.data.primary_thesis);

    if (!companyLink) {
      issues.add({
        severity: "error",
        filePath: thesisNote.relPath,
        code: "company_thesis_missing_company",
        message: "Company thesis is missing the required company link.",
        suggestedFix: "Add company: \"[[03 Entities/Companies/TICKER - Company Name]]\".",
      });
    } else if (!linkedProfile) {
      issues.add({
        severity: "warning",
        filePath: thesisNote.relPath,
        code: "company_thesis_company_link_unresolved",
        message: "Company thesis company link does not resolve to a company profile.",
        suggestedFix: "Point company to a note under 03 Entities/Companies.",
      });
    } else {
      thesisByProfilePath.set(linkedProfile.filePath, thesisNote);
    }

    if (!cleanString(thesisNote.data.primary_thesis)) {
      issues.add({
        severity: "error",
        filePath: thesisNote.relPath,
        code: "company_thesis_missing_primary_thesis",
        message: "Company thesis is missing primary_thesis.",
        suggestedFix:
          "Add primary_thesis pointing to a note under 04 Thesis/Investment.",
      });
    } else if (primaryThesisLink) {
      const resolvedInvestment = resolveLinkedNote(primaryThesisLink, investmentIndex);
      const normalizedPrimaryPath = normalizeKey(primaryThesisLink.path);

      if (normalizedPrimaryPath.startsWith("06 intelligence")) {
        issues.add({
          severity: "error",
          filePath: thesisNote.relPath,
          code: "primary_thesis_points_to_intelligence",
          message: "Company thesis primary_thesis points to 06 Intelligence.",
          suggestedFix:
            "Point primary_thesis to the matching note under 04 Thesis/Investment.",
        });
      } else if (
        !normalizedPrimaryPath.startsWith(normalizeKey(INVESTMENT_THESIS_DIR)) &&
        !resolvedInvestment
      ) {
        issues.add({
          severity: "error",
          filePath: thesisNote.relPath,
          code: "primary_thesis_outside_investment",
          message:
            "Company thesis primary_thesis does not resolve under 04 Thesis/Investment.",
          suggestedFix:
            "Use a 04 Thesis/Investment wiki link, preferably with a short alias.",
        });
      }
    }

    if (!cleanString(thesisNote.data.basket)) {
      issues.add({
        severity: "error",
        filePath: thesisNote.relPath,
        code: "company_thesis_missing_basket",
        message: "Company thesis is missing basket.",
        suggestedFix: "Add basket using the current basket vocabulary.",
      });
    }

    for (const field of COMPANY_THESIS_LEGACY_FIELDS) {
      if (hasField(thesisNote.data, field)) {
        issues.add({
          severity: "warning",
          filePath: thesisNote.relPath,
          code: "company_thesis_legacy_field",
          message: `Company thesis has legacy field ${field}.`,
          suggestedFix: `Remove ${field} unless Paul has approved a schema change.`,
        });
      }
    }
  }

  for (const profileNote of profileNotes) {
    for (const field of PROFILE_LEGACY_FIELDS) {
      if (hasField(profileNote.data, field)) {
        const meta = profileMeta.get(profileNote.filePath);
        issues.add({
          severity: "warning",
          filePath: profileNote.relPath,
          ticker: meta?.symbol,
          code: "company_profile_forbidden_field",
          message: `Company profile contains forbidden field ${field}.`,
          suggestedFix: `Remove ${field}; portfolio assignment belongs in 04 Thesis/Company.`,
        });
      }
    }
  }

  for (const investmentNote of investmentNotes) {
    if (!cleanString(investmentNote.data.type)) {
      issues.add({
        severity: "warning",
        filePath: investmentNote.relPath,
        code: "investment_thesis_missing_type",
        message: "Investment thesis note is missing type.",
        suggestedFix: "Add type: thesis, thesis-node, thesis-hub, or map.",
      });
    }
  }

  for (const profileNote of profileNotes) {
    if (thesisByProfilePath.has(profileNote.filePath)) {
      continue;
    }

    const linkedThesis = resolveLinkedNote(
      parseWikiLink(profileNote.data.company_thesis),
      companyThesisIndex
    );

    if (linkedThesis) {
      thesisByProfilePath.set(profileNote.filePath, linkedThesis);
      continue;
    }

    const { symbol } = profileMeta.get(profileNote.filePath);
    const fallbackThesis = companyThesisNotes.find((note) =>
      note.basename.toUpperCase().startsWith(`${symbol} -`)
    );

    if (fallbackThesis) {
      thesisByProfilePath.set(profileNote.filePath, fallbackThesis);
    }
  }

  const companies = profileNotes
    .map((profileNote) => {
      const meta = profileMeta.get(profileNote.filePath);
      const companyThesis = thesisByProfilePath.get(profileNote.filePath);
      const primaryThesisLink = parseWikiLink(companyThesis?.data.primary_thesis);
      const primaryThesisNote = resolveLinkedNote(primaryThesisLink, investmentIndex);
      const status = normalizeStatus(profileNote.data.status);
      const name =
        cleanString(profileNote.data.name) ||
        profileNote.basename.replace(/^[A-Z0-9.]+ - /, "");
      const basket = cleanString(companyThesis?.data.basket);
      const position = holdingByTicker.get(meta.symbol);

      if (status === "unknown" && !companyThesis) {
        return undefined;
      }

      return compactObject({
        ticker: meta.symbol,
        name,
        status,
        assetType: cleanString(profileNote.data.asset_type),
        sector: cleanString(profileNote.data.sector),
        exchange: cleanString(profileNote.data.exchange),
        companyProfilePath: profileNote.relPath,
        companyThesisPath: companyThesis?.relPath,
        basket,
        primaryThesis: primaryThesisLink
          ? {
              label: primaryThesisLink.label,
              path: primaryThesisNote?.relPath || `${primaryThesisLink.path}.md`,
            }
          : undefined,
        profileSummary: buildProfileSummary(profileNote),
        thesisSections: buildThesisSections(companyThesis),
        position,
      });
    })
    .filter(Boolean)
    .sort((a, b) => {
      const statusRank = {
        "currently holding": 0,
        watching: 1,
        unknown: 2,
      };

      return (
        statusRank[a.status] - statusRank[b.status] ||
        a.ticker.localeCompare(b.ticker)
      );
    });

  const companyTickers = new Set(companies.map((company) => company.ticker));
  for (const holding of portfolio?.holdings || []) {
    if (!companyTickers.has(holding.ticker)) {
      issues.add({
        severity: "warning",
        filePath: portfolio.sourcePath || WEEKLY_REPORT_DATA_DIR,
        ticker: holding.ticker,
        code: "portfolio_holding_missing_company_profile",
        message: "Portfolio holding does not have a matching company profile note.",
        suggestedFix: `Add a ${holding.ticker} company profile under ${COMPANY_PROFILE_DIR}.`,
      });
    }
  }

  const basketMap = new Map();
  for (const company of companies) {
    const basketName = company.basket || "Unassigned";
    const tickers = basketMap.get(basketName) || [];
    tickers.push(company.ticker);
    basketMap.set(basketName, tickers);
  }

  const baskets = Array.from(basketMap.entries())
    .map(([name, companyTickers]) => ({ name, companyTickers: companyTickers.sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const investmentRelToCompanies = new Map();
  for (const company of companies) {
    if (!company.primaryThesis?.path) {
      continue;
    }

    const key = normalizeKey(company.primaryThesis.path);
    const tickers = investmentRelToCompanies.get(key) || [];
    tickers.push(company.ticker);
    investmentRelToCompanies.set(key, tickers);
  }

  const theses = investmentNotes
    .map((note) => {
      const sections = parseSections(note.content);
      return compactObject({
        label: cleanString(note.data.title) || note.basename,
        path: note.relPath,
        type: cleanString(note.data.type),
        status: cleanString(note.data.status),
        summary:
          excerpt(cleanString(note.data.summary), 560) ||
          excerpt(firstSection(sections, ["Current View", "Core Thesis"]), 560),
        thesisPath: cleanString(note.data.thesis_path),
        companyTickers:
          investmentRelToCompanies.get(normalizeKey(note.relPath)) ||
          investmentRelToCompanies.get(normalizeKey(note.notePath)) ||
          [],
      });
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const snapshot = {
    generatedAt: new Date().toISOString(),
    vaultPath: VAULT_PATH,
    portfolio,
    companies,
    baskets,
    theses,
    issues: issues.all(),
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);

  console.log(
    `Wrote ${path.relative(process.cwd(), OUTPUT_PATH)} with ${companies.length} companies, ${baskets.length} baskets, ${theses.length} theses, and ${snapshot.issues.length} issues.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
