export type PerformanceStatus = "green" | "amber" | "red";

export type IndicatorType = "process" | "output" | "outcome";

export interface PerformanceTarget {
  id: string;
  indicatorId: string;
  targetValue: number;
  currentValue: number;
  targetDate: string; // YYYY-MM format
  currentDate: string; // YYYY-MM format
  tolerance: number; // percentage (e.g., 10 for 10% tolerance)
  unit: string;
  description: string;
}

export interface PerformanceMetric {
  id: string;
  indicatorId: string;
  indicatorName: string;
  category: string;
  type: IndicatorType;
  target: PerformanceTarget;
  status: PerformanceStatus;
  progressPercentage: number;
  variance: number; // percentage difference from target
  isOnTrack: boolean;
  notes?: string;
  lastUpdated: string;
}

export interface EarlyWarningTrigger {
  id: string;
  indicatorId: string;
  indicatorName: string;
  warningType: "delay" | "underperformance" | "risk" | "budget";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  expectedDate?: string;
  actualDate?: string;
  daysDelayed?: number;
  impact: string;
  mitigationActions: string[];
  status: "active" | "resolved" | "monitoring";
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalIndicators: number;
  onTrack: number;
  slightlyBehind: number;
  significantlyOffTrack: number;
  activeWarnings: number;
  criticalWarnings: number;
  overallStatus: PerformanceStatus;
  lastUpdated: string;
}

export interface MonthlyDashboard {
  summary: DashboardSummary;
  metrics: PerformanceMetric[];
  warnings: EarlyWarningTrigger[];
  generatedAt: string;
  period: string; // YYYY-MM format
}








