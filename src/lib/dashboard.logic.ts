import { 
  PerformanceStatus, 
  PerformanceMetric, 
  PerformanceTarget, 
  EarlyWarningTrigger, 
  DashboardSummary,
  MonthlyDashboard 
} from "./dashboard.types";

/**
 * Calculate performance status based on target vs current value
 */
export function calculatePerformanceStatus(
  target: PerformanceTarget,
  tolerance: number = 10
): PerformanceStatus {
  const variance = Math.abs(((target.currentValue - target.targetValue) / target.targetValue) * 100);
  
  if (variance <= tolerance) {
    return "green";
  } else if (variance <= tolerance * 2) {
    return "amber";
  } else {
    return "red";
  }
}

/**
 * Calculate progress percentage
 */
export function calculateProgressPercentage(target: PerformanceTarget): number {
  if (target.targetValue === 0) return 0;
  return Math.min((target.currentValue / target.targetValue) * 100, 100);
}

/**
 * Calculate variance percentage
 */
export function calculateVariance(target: PerformanceTarget): number {
  if (target.targetValue === 0) return 0;
  return ((target.currentValue - target.targetValue) / target.targetValue) * 100;
}

/**
 * Check if indicator is on track based on time and progress
 */
export function isOnTrack(target: PerformanceTarget): boolean {
  const currentDate = new Date(target.currentDate);
  const targetDate = new Date(target.targetDate);
  const progressPercentage = calculateProgressPercentage(target);
  
  // Calculate expected progress based on time elapsed
  const totalDays = Math.ceil((targetDate.getTime() - new Date(target.targetDate + "-01").getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((currentDate.getTime() - new Date(target.currentDate + "-01").getTime()) / (1000 * 60 * 60 * 24));
  const expectedProgress = Math.min((daysElapsed / totalDays) * 100, 100);
  
  // Allow 10% tolerance
  return progressPercentage >= (expectedProgress - 10);
}

/**
 * Generate performance metric from target data
 */
export function generatePerformanceMetric(
  target: PerformanceTarget,
  indicatorName: string,
  category: string,
  type: "process" | "output" | "outcome"
): PerformanceMetric {
  const status = calculatePerformanceStatus(target);
  const progressPercentage = calculateProgressPercentage(target);
  const variance = calculateVariance(target);
  const onTrack = isOnTrack(target);
  
  return {
    id: `metric-${target.indicatorId}-${target.currentDate}`,
    indicatorId: target.indicatorId,
    indicatorName,
    category,
    type,
    target,
    status,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    isOnTrack: onTrack,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Generate early warning triggers based on performance metrics
 */
export function generateEarlyWarnings(metrics: PerformanceMetric[]): EarlyWarningTrigger[] {
  const warnings: EarlyWarningTrigger[] = [];
  
  metrics.forEach(metric => {
    // Check for delays
    if (!metric.isOnTrack && metric.status === "red") {
      const daysDelayed = calculateDaysDelayed(metric.target);
      if (daysDelayed > 30) {
        warnings.push({
          id: `warning-delay-${metric.indicatorId}`,
          indicatorId: metric.indicatorId,
          indicatorName: metric.indicatorName,
          warningType: "delay",
          severity: daysDelayed > 90 ? "critical" : daysDelayed > 60 ? "high" : "medium",
          message: `${metric.indicatorName} is ${daysDelayed} days behind schedule`,
          expectedDate: metric.target.targetDate,
          actualDate: metric.target.currentDate,
          daysDelayed,
          impact: "Project timeline at risk",
          mitigationActions: [
            "Review resource allocation",
            "Identify bottlenecks",
            "Consider scope adjustment"
          ],
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    // Check for underperformance
    if (metric.variance < -20) {
      warnings.push({
        id: `warning-performance-${metric.indicatorId}`,
        indicatorId: metric.indicatorId,
        indicatorName: metric.indicatorName,
        warningType: "underperformance",
        severity: metric.variance < -50 ? "critical" : "high",
        message: `${metric.indicatorName} is ${Math.abs(metric.variance).toFixed(1)}% below target`,
        impact: "Project objectives at risk",
        mitigationActions: [
          "Review implementation strategy",
          "Increase stakeholder engagement",
          "Consider additional resources"
        ],
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });
  
  return warnings;
}

/**
 * Calculate days delayed
 */
function calculateDaysDelayed(target: PerformanceTarget): number {
  const currentDate = new Date(target.currentDate + "-01");
  const targetDate = new Date(target.targetDate + "-01");
  const daysDiff = Math.ceil((currentDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysDiff);
}

/**
 * Generate dashboard summary
 */
export function generateDashboardSummary(metrics: PerformanceMetric[], warnings: EarlyWarningTrigger[]): DashboardSummary {
  const totalIndicators = metrics.length;
  const onTrack = metrics.filter(m => m.status === "green").length;
  const slightlyBehind = metrics.filter(m => m.status === "amber").length;
  const significantlyOffTrack = metrics.filter(m => m.status === "red").length;
  const activeWarnings = warnings.filter(w => w.status === "active").length;
  const criticalWarnings = warnings.filter(w => w.severity === "critical").length;
  
  let overallStatus: PerformanceStatus = "green";
  if (criticalWarnings > 0 || significantlyOffTrack > totalIndicators * 0.3) {
    overallStatus = "red";
  } else if (activeWarnings > 0 || slightlyBehind > totalIndicators * 0.2) {
    overallStatus = "amber";
  }
  
  return {
    totalIndicators,
    onTrack,
    slightlyBehind,
    significantlyOffTrack,
    activeWarnings,
    criticalWarnings,
    overallStatus,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Generate complete monthly dashboard
 */
export function generateMonthlyDashboard(
  targets: PerformanceTarget[],
  indicatorNames: Record<string, string>,
  categories: Record<string, string>,
  types: Record<string, "process" | "output" | "outcome">,
  period: string
): MonthlyDashboard {
  const metrics = targets.map(target => 
    generatePerformanceMetric(
      target,
      indicatorNames[target.indicatorId] || target.indicatorId,
      categories[target.indicatorId] || "General",
      types[target.indicatorId] || "output"
    )
  );
  
  const warnings = generateEarlyWarnings(metrics);
  const summary = generateDashboardSummary(metrics, warnings);
  
  return {
    summary,
    metrics,
    warnings,
    generatedAt: new Date().toISOString(),
    period,
  };
}








