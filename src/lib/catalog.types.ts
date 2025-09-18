export type Sector = "Fisheries Management" | "Climate Adaptation" | "Livelihoods";
export type Level = "process" | "output" | "outcome";
export type ValueType = "number" | "percent" | "yesno";

export interface IndicatorSpec {
  id: string;
  sector: Sector;
  level: Level;
  title: string;
  description: string;
  unitOptions: string[];
  frequencyOptions: string[];
  responsibleHints?: string[];
  disaggregationHints?: string[];
  valueType: ValueType;
}

export type Catalog = IndicatorSpec[];
