import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { generateMonthlyDashboard } from "@/lib/dashboard.logic";
import { 
  generateSampleTargets, 
  INDICATOR_NAMES, 
  INDICATOR_CATEGORIES, 
  INDICATOR_TYPES 
} from "@/lib/dashboard.data";

export async function GET(req: Request) {
  try {
    // Get period from query parameters, default to January 2025
    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "2025-01";
    
    // Generate month-specific dashboard data
    const targets = generateSampleTargets(period);
    const dashboard = generateMonthlyDashboard(
      targets,
      INDICATOR_NAMES,
      INDICATOR_CATEGORIES,
      INDICATOR_TYPES,
      period
    );

    // Create new workbook
    const workbook = new ExcelJS.Workbook();
    
    // Add metadata
    workbook.creator = "WB-S Data Collection System";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 25 },
      { header: "Value", key: "value", width: 15 },
      { header: "Status", key: "status", width: 15 }
    ];

    summarySheet.addRow({ metric: "Total Indicators", value: dashboard.summary.totalIndicators, status: "" });
    summarySheet.addRow({ metric: "On Track", value: dashboard.summary.onTrack, status: "Green" });
    summarySheet.addRow({ metric: "Slightly Behind", value: dashboard.summary.slightlyBehind, status: "Amber" });
    summarySheet.addRow({ metric: "Significantly Off Track", value: dashboard.summary.significantlyOffTrack, status: "Red" });
    summarySheet.addRow({ metric: "Active Warnings", value: dashboard.summary.activeWarnings, status: "" });
    summarySheet.addRow({ metric: "Critical Warnings", value: dashboard.summary.criticalWarnings, status: "" });
    summarySheet.addRow({ metric: "Overall Status", value: dashboard.summary.overallStatus.toUpperCase(), status: "" });

    // Style summary sheet
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(7).font = { bold: true, color: { argb: "FF0000" } };

    // Performance Metrics Sheet
    const metricsSheet = workbook.addWorksheet("Performance Metrics");
    metricsSheet.columns = [
      { header: "Indicator ID", key: "indicatorId", width: 15 },
      { header: "Indicator Name", key: "indicatorName", width: 30 },
      { header: "Category", key: "category", width: 20 },
      { header: "Type", key: "type", width: 15 },
      { header: "Target Value", key: "targetValue", width: 15 },
      { header: "Current Value", key: "currentValue", width: 15 },
      { header: "Unit", key: "unit", width: 15 },
      { header: "Progress %", key: "progressPercentage", width: 15 },
      { header: "Variance %", key: "variance", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "On Track", key: "isOnTrack", width: 15 },
      { header: "Last Updated", key: "lastUpdated", width: 20 }
    ];

    dashboard.metrics.forEach(metric => {
      metricsSheet.addRow({
        indicatorId: metric.indicatorId,
        indicatorName: metric.indicatorName,
        category: metric.category,
        type: metric.type,
        targetValue: metric.target.targetValue,
        currentValue: metric.target.currentValue,
        unit: metric.target.unit,
        progressPercentage: metric.progressPercentage,
        variance: metric.variance,
        status: metric.status.toUpperCase(),
        isOnTrack: metric.isOnTrack ? "Yes" : "No",
        lastUpdated: new Date(metric.lastUpdated).toLocaleString()
      });
    });

    // Style metrics sheet
    metricsSheet.getRow(1).font = { bold: true };
    metricsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Add conditional formatting for status column
    const statusColumn = metricsSheet.getColumn('status');
    statusColumn.eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        const status = cell.value?.toString().toLowerCase();
        if (status === 'green') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF90EE90' }
          };
        } else if (status === 'amber') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' }
          };
        } else if (status === 'red') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFB6C1' }
          };
        }
      }
    });

    // Early Warnings Sheet
    if (dashboard.warnings.length > 0) {
      const warningsSheet = workbook.addWorksheet("Early Warnings");
      warningsSheet.columns = [
        { header: "Indicator ID", key: "indicatorId", width: 15 },
        { header: "Indicator Name", key: "indicatorName", width: 30 },
        { header: "Warning Type", key: "warningType", width: 20 },
        { header: "Severity", key: "severity", width: 15 },
        { header: "Message", key: "message", width: 50 },
        { header: "Impact", key: "impact", width: 30 },
        { header: "Mitigation Actions", key: "mitigationActions", width: 60 },
        { header: "Status", key: "status", width: 15 },
        { header: "Created At", key: "createdAt", width: 20 }
      ];

      dashboard.warnings.forEach(warning => {
        warningsSheet.addRow({
          indicatorId: warning.indicatorId,
          indicatorName: warning.indicatorName,
          warningType: warning.warningType.toUpperCase(),
          severity: warning.severity.toUpperCase(),
          message: warning.message,
          impact: warning.impact,
          mitigationActions: warning.mitigationActions.join("; "),
          status: warning.status.toUpperCase(),
          createdAt: new Date(warning.createdAt).toLocaleString()
        });
      });

      // Style warnings sheet
      warningsSheet.getRow(1).font = { bold: true };
      warningsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE4E1' }
      };

      // Add conditional formatting for severity column
      const severityColumn = warningsSheet.getColumn('severity');
      severityColumn.eachCell((cell, rowNumber) => {
        if (rowNumber > 1) {
          const severity = cell.value?.toString().toLowerCase();
          if (severity === 'critical') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF0000' }
            };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (severity === 'high') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFA500' }
            };
          } else if (severity === 'medium') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFF00' }
            };
          } else if (severity === 'low') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF90EE90' }
            };
          }
        }
      });
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return Excel file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="performance-dashboard-${dashboard.period}.xlsx"`,
      },
    });

  } catch (error) {
    console.error("Export dashboard error:", error);
    return NextResponse.json({ error: "Failed to export dashboard" }, { status: 500 });
  }
}
