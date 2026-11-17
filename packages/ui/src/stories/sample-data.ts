// Deterministic sample data for pattern stories. Generic portfolio-shaped
// figures; nothing here is real or tied to a product.

export interface SampleHolding {
  symbol: string;
  name: string;
  source: "CSV" | "API";
  sector: string;
  quantity: number;
  price: number;
  marketValue: number;
  unrealizedPl: number;
  unrealizedPlPct: number;
  weight: number;
}

const raw: Omit<SampleHolding, "marketValue" | "unrealizedPl" | "unrealizedPlPct" | "weight">[] = [
  {
    symbol: "VTI",
    name: "Total Stock Market ETF",
    source: "CSV",
    sector: "Broad market",
    quantity: 48,
    price: 279.21,
  },
  {
    symbol: "AAPL",
    name: "Apple",
    source: "API",
    sector: "Technology",
    quantity: 12,
    price: 228.85,
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    source: "API",
    sector: "Technology",
    quantity: 6,
    price: 431.4,
  },
  {
    symbol: "BND",
    name: "Total Bond Market ETF",
    source: "CSV",
    sector: "Bonds",
    quantity: 30,
    price: 72.71,
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    source: "CSV",
    sector: "Health care",
    quantity: 9,
    price: 158.02,
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil",
    source: "API",
    sector: "Energy",
    quantity: 11,
    price: 117.36,
  },
  {
    symbol: "COST",
    name: "Costco",
    source: "CSV",
    sector: "Consumer staples",
    quantity: 2,
    price: 884.5,
  },
  {
    symbol: "NEE",
    name: "NextEra Energy",
    source: "API",
    sector: "Utilities",
    quantity: 14,
    price: 76.12,
  },
];
const costBasis = [262.4, 236.1, 388.0, 72.3, 162.9, 104.2, 801.0, 81.5];

const total = raw.reduce((sum, h) => sum + h.quantity * h.price, 0);

export const holdings: SampleHolding[] = raw.map((h, i) => {
  const marketValue = h.quantity * h.price;
  const basis = h.quantity * costBasis[i]!;
  return {
    ...h,
    marketValue,
    unrealizedPl: marketValue - basis,
    unrealizedPlPct: (marketValue - basis) / basis,
    weight: marketValue / total,
  };
});

export const portfolioTotal = total;

/** 90 days of portfolio value and a benchmark, from a seeded random walk. */
export const valueHistory = (() => {
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const start = Date.UTC(2026, 6, 31);
  let value = total * 0.93;
  let benchmark = total * 0.93;
  return Array.from({ length: 90 }, (_, day) => {
    value *= 1 + (random() - 0.47) * 0.018;
    benchmark *= 1 + (random() - 0.48) * 0.014;
    return {
      date: new Date(start + day * 86_400_000).toISOString().slice(0, 10),
      value: Math.round(value * 100) / 100,
      benchmark: Math.round(benchmark * 100) / 100,
    };
  });
})();

export const sectorAllocation = Object.entries(
  holdings.reduce<Record<string, number>>((acc, h) => {
    acc[h.sector] = (acc[h.sector] ?? 0) + h.marketValue;
    return acc;
  }, {}),
)
  .map(([sector, value]) => ({ sector, value }))
  .sort((a, b) => b.value - a.value);
