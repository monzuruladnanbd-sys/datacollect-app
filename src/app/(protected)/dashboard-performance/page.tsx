"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MonthlyDashboard, 
  PerformanceMetric, 
  EarlyWarningTrigger,
  PerformanceStatus 
} from "@/lib/dashboard.types";
import { generateMonthlyDashboard } from "@/lib/dashboard.logic";
import { 
  generateSampleTargets, 
  INDICATOR_NAMES, 
  INDICATOR_CATEGORIES, 
  INDICATOR_TYPES 
} from "@/lib/dashboard.data";

export default function PerformanceDashboard() {
  const [dashboard, setDashboard] = useState<MonthlyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("2025-01");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [userRole, setUserRole] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    checkUserRole();
  }, []);

  useEffect(() => {
    if (userRole && userRole !== "submitter") {
      generateDashboard();
    }
  }, [selectedPeriod, userRole]);

  const checkUserRole = async () => {
    try {
      const res = await fetch('/api/user/');
      const userData = await res.json();
      const role = userData.user?.role;
      
      if (role === "submitter") {
        // Redirect submitters to their submissions page
        router.push('/submissions');
        return;
      }
      
      setUserRole(role);
    } catch (error) {
      console.error('Failed to check user role:', error);
      router.push('/login');
    }
  };

  const generateDashboard = () => {
    setLoading(true);
    try {
      const targets = generateSampleTargets(selectedPeriod);
      const dashboardData = generateMonthlyDashboard(
        targets,
        INDICATOR_NAMES,
        INDICATOR_CATEGORIES,
        INDICATOR_TYPES,
        selectedPeriod
      );
      setDashboard(dashboardData);
    } catch (error) {
      console.error("Failed to generate dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: PerformanceStatus) => {
    switch (status) {
      case "green": return "bg-green-100 text-green-800 border-green-200";
      case "amber": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "red": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: PerformanceStatus) => {
    switch (status) {
      case "green": return "✅";
      case "amber": return "⚠️";
      case "red": return "❌";
      default: return "❓";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredMetrics = dashboard?.metrics.filter(metric => {
    const categoryMatch = filterCategory === "all" || metric.category === filterCategory;
    const typeMatch = filterType === "all" || metric.type === filterType;
    const statusMatch = filterStatus === "all" || metric.status === filterStatus;
    return categoryMatch && typeMatch && statusMatch;
  }) || [];

  const categories = Array.from(new Set(dashboard?.metrics.map(m => m.category) || []));
  const types = Array.from(new Set(dashboard?.metrics.map(m => m.type) || []));

  // Show loading while checking user role
  if (!userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show loading while generating dashboard
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Generating dashboard...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600">Failed to load dashboard data</div>
        <button 
          onClick={generateDashboard}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Performance Dashboard</h1>
          <p className="text-gray-600">Period: {selectedPeriod}</p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <optgroup label="2024">
              <option value="2024-01">January 2024</option>
              <option value="2024-02">February 2024</option>
              <option value="2024-03">March 2024</option>
              <option value="2024-04">April 2024</option>
              <option value="2024-05">May 2024</option>
              <option value="2024-06">June 2024</option>
              <option value="2024-07">July 2024</option>
              <option value="2024-08">August 2024</option>
              <option value="2024-09">September 2024</option>
              <option value="2024-10">October 2024</option>
              <option value="2024-11">November 2024</option>
              <option value="2024-12">December 2024</option>
            </optgroup>
            <optgroup label="2025">
              <option value="2025-01">January 2025</option>
              <option value="2025-02">February 2025</option>
              <option value="2025-03">March 2025</option>
              <option value="2025-04">April 2025</option>
              <option value="2025-05">May 2025</option>
              <option value="2025-06">June 2025</option>
              <option value="2025-07">July 2025</option>
              <option value="2025-08">August 2025</option>
              <option value="2025-09">September 2025</option>
              <option value="2025-10">October 2025</option>
              <option value="2025-11">November 2025</option>
              <option value="2025-12">December 2025</option>
            </optgroup>
            <optgroup label="2026">
              <option value="2026-01">January 2026</option>
              <option value="2026-02">February 2026</option>
              <option value="2026-03">March 2026</option>
              <option value="2026-04">April 2026</option>
              <option value="2026-05">May 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-12">December 2026</option>
            </optgroup>
          </select>
          <button
            onClick={() => window.open(`/api/export-dashboard?period=${selectedPeriod}`, '_blank')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-green-600">{dashboard.summary.onTrack}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Slightly Behind</p>
              <p className="text-2xl font-bold text-yellow-600">{dashboard.summary.slightlyBehind}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Off Track</p>
              <p className="text-2xl font-bold text-red-600">{dashboard.summary.significantlyOffTrack}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Warnings</p>
              <p className="text-2xl font-bold text-orange-600">{dashboard.summary.activeWarnings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Fisheries Management", "Climate Adaptation", "Livelihoods"].map(sector => {
          const sectorMetrics = dashboard.metrics.filter(m => m.category === sector);
          const onTrack = sectorMetrics.filter(m => m.status === "green").length;
          const slightlyBehind = sectorMetrics.filter(m => m.status === "amber").length;
          const offTrack = sectorMetrics.filter(m => m.status === "red").length;
          const total = sectorMetrics.length;
          
          return (
            <div key={sector} className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{sector}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Indicators</span>
                  <span className="font-semibold">{total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">On Track</span>
                  <span className="font-semibold text-green-600">{onTrack}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-600">Slightly Behind</span>
                  <span className="font-semibold text-yellow-600">{slightlyBehind}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Off Track</span>
                  <span className="font-semibold text-red-600">{offTrack}</span>
                </div>
                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">
                      {total > 0 ? Math.round(((onTrack + slightlyBehind) / total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${total > 0 ? ((onTrack + slightlyBehind) / total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg border ${getStatusColor(dashboard.summary.overallStatus)}`}>
        <div className="flex items-center">
          <span className="text-2xl mr-3">{getStatusIcon(dashboard.summary.overallStatus)}</span>
          <div>
            <h3 className="text-lg font-semibold">Overall Project Status</h3>
            <p className="text-sm">
              {dashboard.summary.overallStatus === "green" && "Project is on track"}
              {dashboard.summary.overallStatus === "amber" && "Project needs attention"}
              {dashboard.summary.overallStatus === "red" && "Project requires immediate action"}
            </p>
          </div>
        </div>
      </div>


      {/* Early Warning Triggers */}
      {dashboard.warnings.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Early Warning Triggers</h2>
            <p className="text-sm text-gray-600">Issues requiring immediate attention</p>
          </div>
          <div className="p-6 space-y-4">
            {dashboard.warnings.map(warning => (
              <div key={warning.id} className={`p-4 rounded-lg border ${getSeverityColor(warning.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">⚠️</span>
                      <h3 className="font-semibold">{warning.indicatorName}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(warning.severity)}`}>
                        {warning.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{warning.message}</p>
                    <p className="text-xs text-gray-600 mb-2">Impact: {warning.impact}</p>
                    <div className="text-xs">
                      <p className="font-medium mb-1">Mitigation Actions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {warning.mitigationActions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Performance Metrics</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Overall Project Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="green">On Track (Green)</option>
              <option value="amber">Slightly Behind (Amber)</option>
              <option value="red">Off Track (Red)</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sectors</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Indicator Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStatus("all");
                setFilterCategory("all");
                setFilterType("all");
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredMetrics.length} of {dashboard?.metrics.length || 0} indicators
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
          <p className="text-sm text-gray-600">
            Detailed status of all 37 indicators: 14 Fisheries Management, 11 Climate Adaptation, 12 Livelihoods
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMetrics.map((metric, index) => {
                const prevMetric = index > 0 ? filteredMetrics[index - 1] : null;
                const showSectorHeader = !prevMetric || prevMetric.category !== metric.category;
                
                return (
                  <React.Fragment key={metric.id}>
                    {showSectorHeader && (
                      <tr className="bg-gray-100">
                        <td colSpan={8} className="px-6 py-3">
                          <div className="flex items-center">
                            <span className="text-sm font-semibold text-gray-700">
                              {metric.category} ({filteredMetrics.filter(m => m.category === metric.category).length} indicators)
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{metric.indicatorName}</div>
                          <div className="text-sm text-gray-500">{metric.target.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{metric.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.target.targetValue} {metric.target.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.target.currentValue} {metric.target.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                metric.progressPercentage >= 100 ? 'bg-green-500' :
                                metric.progressPercentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(metric.progressPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{metric.progressPercentage.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                          {getStatusIcon(metric.status)} {metric.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={metric.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {metric.variance >= 0 ? '+' : ''}{metric.variance.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
