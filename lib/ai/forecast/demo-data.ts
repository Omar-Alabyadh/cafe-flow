import { addDays, isoWeekday } from "./date-utils";
import type { DemandObservation, ForecastDataSource, ForecastMode } from "./types";

export const ACADEMIC_DEMO_SEED = "CAFeflow-A3-DEMO-2026-01";
export const ACADEMIC_DEMO_SCOPE = "academic-demo-scope";

export type DemoOutlier = { productKey: string; date: string; additionalQuantity: number };
export type AcademicDemoDemand = {
  forecastMode: ForecastMode;
  dataSource: ForecastDataSource;
  seed: string;
  startDate: string;
  endDate: string;
  calendarDays: number;
  productKeys: string[];
  outliers: DemoOutlier[];
  observations: DemandObservation[];
};

function seededRandom(seed: string): () => number {
  let state = 2_166_136_261;
  for (let index = 0; index < seed.length; index += 1) state = Math.imul(state ^ seed.charCodeAt(index), 16_777_619);
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function noise(random: () => number): number {
  return Math.floor(random() * 3) - 1;
}

/**
 * Builds exactly 120 explicit UTC-safe calendar days of synthetic academic demand.
 * It is deterministic, in memory only, and must never be represented as real sales.
 */
export function generateAcademicDemoDemand(seed = ACADEMIC_DEMO_SEED): AcademicDemoDemand {
  const random = seededRandom(seed);
  const startDate = "2026-01-01";
  const calendarDays = 120;
  const productKeys = ["demo-product-1", "demo-product-2", "demo-product-3", "demo-product-4"];
  const outliers: DemoOutlier[] = [
    { productKey: "demo-product-1", date: addDays(startDate, 24), additionalQuantity: 9 },
    { productKey: "demo-product-2", date: addDays(startDate, 47), additionalQuantity: 7 },
    { productKey: "demo-product-3", date: addDays(startDate, 78), additionalQuantity: 10 },
  ];
  const outlierMap = new Map(outliers.map((outlier) => [`${outlier.productKey}:${outlier.date}`, outlier.additionalQuantity]));
  const observations: DemandObservation[] = [];
  for (let dayIndex = 0; dayIndex < calendarDays; dayIndex += 1) {
    const date = addDays(startDate, dayIndex);
    const weekday = isoWeekday(date);
    const weekendPenalty = weekday >= 6 ? 2 : 0;
    const quantities: Record<string, number> = {
      "demo-product-1": Math.max(0, 11 - weekendPenalty + noise(random)),
      "demo-product-2": random() < 0.34 ? Math.max(1, 3 + noise(random)) : 0,
      "demo-product-3": Math.max(0, 4 + Math.floor(dayIndex / 14) - (weekday === 7 ? 1 : 0) + noise(random)),
      "demo-product-4": Math.max(0, 6 + (weekday === 5 ? 3 : 0) - (weekday >= 6 ? 2 : 0) + noise(random)),
    };
    for (const productKey of productKeys) {
      const quantity = quantities[productKey] + (outlierMap.get(`${productKey}:${date}`) ?? 0);
      observations.push({ date, productKey, quantity, scopeReference: ACADEMIC_DEMO_SCOPE, dataSource: "DEMO_ONLY" });
    }
  }
  return { forecastMode: "ACADEMIC_DEMO", dataSource: "DEMO_ONLY", seed, startDate, endDate: addDays(startDate, calendarDays - 1), calendarDays, productKeys, outliers, observations };
}
