import { PerformanceTarget } from "./dashboard.types";
import { CATALOG } from "./catalog";

// Generate month-specific targets for all 37 indicators from the catalog
export const generateSampleTargets = (period: string): PerformanceTarget[] => CATALOG.map((indicator, index) => {
  // Use deterministic values based on indicator ID hash to ensure consistency
  const hash = indicator.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Generate realistic target values based on indicator type and sector
  let targetValue = 0;
  let currentValue = 0;
  let tolerance = 15;
  
  // Use hash-based "random" values for consistency, but vary by month
  const monthHash = period.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const randomFactor = Math.abs(hash + monthHash) % 100 / 100; // 0-1 based on hash + month
  
  // Calculate month-based progress (0-1 based on month in year)
  const monthNumber = parseInt(period.split('-')[1]);
  const yearProgress = (monthNumber - 1) / 11; // 0 for Jan, 1 for Dec
  
  // Set targets based on indicator characteristics
  if (indicator.valueType === "yesno") {
    targetValue = 1;
    // Yes/No indicators complete based on month progress
    currentValue = yearProgress > 0.5 ? 1 : 0;
    tolerance = 0;
  } else if (indicator.valueType === "percent") {
    targetValue = 80 + Math.floor(randomFactor * 20); // 80-100%
    // Percent indicators progress throughout the year
    currentValue = Math.floor(targetValue * (0.3 + yearProgress * 0.7));
    tolerance = 10;
  } else if (indicator.valueType === "number") {
    // Different ranges based on sector and level
    if (indicator.sector === "Fisheries Management") {
      if (indicator.level === "process") {
        targetValue = 10 + Math.floor(randomFactor * 20); // 10-30
      } else if (indicator.level === "output") {
        targetValue = 20 + Math.floor(randomFactor * 30); // 20-50
      } else { // outcome
        targetValue = 5 + Math.floor(randomFactor * 15); // 5-20
      }
    } else if (indicator.sector === "Climate Adaptation") {
      if (indicator.level === "process") {
        targetValue = 5 + Math.floor(randomFactor * 15); // 5-20
      } else if (indicator.level === "output") {
        targetValue = 10 + Math.floor(randomFactor * 20); // 10-30
      } else { // outcome
        targetValue = 50 + Math.floor(randomFactor * 50); // 50-100
      }
    } else { // Livelihoods
      if (indicator.level === "process") {
        targetValue = 8 + Math.floor(randomFactor * 12); // 8-20
      } else if (indicator.level === "output") {
        targetValue = 15 + Math.floor(randomFactor * 25); // 15-40
      } else { // outcome
        targetValue = 100 + Math.floor(randomFactor * 100); // 100-200
      }
    }
    
    // Set current value based on month progress with some variation
    const baseProgress = 0.2 + yearProgress * 0.8; // 20% in Jan, 100% in Dec
    const variation = (randomFactor - 0.5) * 0.4; // ±20% variation
    const progressFactor = Math.max(0.1, Math.min(1.2, baseProgress + variation));
    currentValue = Math.floor(targetValue * progressFactor);
  }
  
  // Set target date based on project timeline (end of 2026)
  const targetDate = "2026-12";
  const currentDate = period;
  
  return {
    id: `target-${indicator.id.toLowerCase()}`,
    indicatorId: indicator.id,
    targetValue,
    currentValue,
    targetDate,
    currentDate,
    tolerance,
    unit: indicator.unitOptions[0] || "Count",
    description: indicator.description
  };
});

export const INDICATOR_NAMES: Record<string, string> = {};
export const INDICATOR_CATEGORIES: Record<string, string> = {};
export const INDICATOR_TYPES: Record<string, "process" | "output" | "outcome"> = {};

// Populate the mapping objects from the catalog
CATALOG.forEach(indicator => {
  INDICATOR_NAMES[indicator.id] = indicator.title;
  INDICATOR_CATEGORIES[indicator.id] = indicator.sector;
  INDICATOR_TYPES[indicator.id] = indicator.level;
});
