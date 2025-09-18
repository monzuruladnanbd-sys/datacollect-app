"use client";
import { CATALOG } from "@/lib/catalog";
import { IndicatorSpec } from "@/lib/catalog.types";
import ChipInput from "@/components/ChipInput";
import CheckList from "@/components/CheckList";
import { useMemo, useState } from "react";
import { saveRows } from "@/app/actions/save-rows";
import { s, a, yearFromPeriod, quarterFromPeriod } from "@/lib/safe";

// types
type Row = {
  id: string;
  valueType: "number" | "percent" | "yesno";
  value: number | string | boolean | null;
  unit: string;
  frequency: string;
  period: string;
  responsible: string[];
  disaggregation: string[];
  notes: string;
  status?: "draft" | "submitted";
};

type RowState = {
  value: number | boolean | "";
  unit: string;
  frequency: string;
  period: string;
  responsible: string[];
  disaggregation: string[];
  notes: string;
  statusMsg?: string;
  saving?: boolean;
};

// when building initial state per indicator:
const rowDefaults = (ind: IndicatorSpec): Row => ({
  id: ind.id,
  valueType: ind.valueType,
  value: ind.valueType === "yesno" ? false : "",
  unit: ind.unitOptions[0] ?? "Count",
  frequency: ind.frequencyOptions[0] ?? "Quarterly",
  period: "",
  responsible: [],
  disaggregation: [],
  notes: "",
});

// Generate period options based on frequency
const getPeriodOptions = (frequency: string) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  
  if (frequency.includes("Quarterly")) {
    return years.flatMap(year => 
      [1, 2, 3, 4].map(q => `${year} Q${q}`)
    );
  } else if (frequency.includes("Annual") || frequency.includes("Semi-Annual")) {
    return years.map(year => year.toString());
  } else if (frequency.includes("One-time") || frequency.includes("Baseline") || frequency.includes("Endline")) {
    return []; // No period needed
  }
  return [];
};

export default function DataEntryPage() {
  const [activeTab, setActiveTab] = useState<"Fisheries Management" | "Climate Adaptation" | "Livelihoods">("Fisheries Management");
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());
  const [state, setState] = useState<Record<string, RowState>>(() => {
    const initial: Record<string, RowState> = {};
    CATALOG.forEach(ind => {
      const defaults = rowDefaults(ind);
      initial[ind.id] = {
        value: defaults.valueType === "yesno" ? false : (typeof defaults.value === "number" ? defaults.value : ""),
        unit: defaults.unit || "",
        frequency: defaults.frequency || "",
        period: defaults.period || "",
        responsible: defaults.responsible || [],
        disaggregation: defaults.disaggregation || [],
        notes: defaults.notes || "",
      };
    });
    return initial;
  });
  const [error, setError] = useState<string>("");

  const sectors = ["Fisheries Management", "Climate Adaptation", "Livelihoods"] as const;
  const levelLabels = { process: "Process", output: "Output", outcome: "Outcome" };

  const toggleAccordion = (level: string) => {
    const newExpanded = new Set(expandedAccordions);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedAccordions(newExpanded);
  };

  const updateRow = (id: string, updates: Partial<RowState>) => {
    setState(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
  };

  const onSubmit = async (status: "draft" | "submitted") => {
    try {
      setError("");
      const rows = Object.entries(state)
        .filter(([id, rowState]) => {
          // Only include rows with actual data
          const hasValue = rowState.value !== "" && rowState.value !== null && rowState.value !== undefined;
          const hasNotes = rowState.notes && rowState.notes.trim() !== "";
          const hasResponsible = rowState.responsible && rowState.responsible.length > 0;
          const hasDisaggregation = rowState.disaggregation && rowState.disaggregation.length > 0;
          
          return hasValue || hasNotes || hasResponsible || hasDisaggregation;
        })
        .map(([id, rowState]) => {
          const ind = CATALOG.find(i => i.id === id);
          if (!ind) throw new Error(`Indicator ${id} not found`);
          
          return {
            id,
            section: ind.sector,
            level: ind.level,
            label: ind.title,
            value: rowState.value,
            unit: rowState.unit,
            frequency: rowState.frequency,
            period: rowState.period,
            responsible: rowState.responsible,
            disaggregation: rowState.disaggregation,
            notes: rowState.notes,
            status,
          };
        });

      if (rows.length === 0) {
        setError("Please enter some data before submitting");
        return;
      }

      const result = await saveRows(rows);
      if (!result.ok) {
        throw new Error(result.error || "Failed to save data");
      }

      // Show success message
      Object.keys(state).forEach(id => {
        updateRow(id, { 
          statusMsg: status === "draft" ? "Draft saved" : "Submitted",
          saving: false 
        });
        setTimeout(() => updateRow(id, { statusMsg: undefined }), 3000);
      });

    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error("Submit error:", err);
    }
  };

  const handleSubmit = async () => {
    await onSubmit("submitted");
  };

  const handleSaveDraft = async () => {
    await onSubmit("draft");
  };

  const handleIndividualSubmit = async (indicatorId: string, status: "draft" | "submitted") => {
    try {
      setError("");
      const rowState = state[indicatorId];
      const ind = CATALOG.find(i => i.id === indicatorId);
      if (!ind) throw new Error(`Indicator ${indicatorId} not found`);
      
      // Only save if there's actual data entered
      const hasValue = rowState.value !== "" && rowState.value !== null && rowState.value !== undefined;
      const hasNotes = rowState.notes && rowState.notes.trim() !== "";
      const hasResponsible = rowState.responsible && rowState.responsible.length > 0;
      const hasDisaggregation = rowState.disaggregation && rowState.disaggregation.length > 0;
      
      if (!hasValue && !hasNotes && !hasResponsible && !hasDisaggregation) {
        setError("Please enter some data before submitting");
        return;
      }
      
      const row = {
        id: indicatorId,
        section: ind.sector,
        level: ind.level,
        label: ind.title,
        value: rowState.value,
        unit: rowState.unit,
        frequency: rowState.frequency,
        period: rowState.period,
        responsible: rowState.responsible,
        disaggregation: rowState.disaggregation,
        notes: rowState.notes,
        status,
      };

      const result = await saveRows([row]);
      if (!result.ok) {
        throw new Error(result.error || "Failed to save data");
      }

      // Show success message
      updateRow(indicatorId, { 
        statusMsg: status === "draft" ? "Draft saved" : "Submitted",
        saving: false 
      });
      setTimeout(() => updateRow(indicatorId, { statusMsg: undefined }), 3000);

    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error("Individual submit error:", err);
    }
  };

  const indicatorsBySectorAndLevel = useMemo(() => {
    const grouped: Record<string, Record<string, IndicatorSpec[]>> = {};
    sectors.forEach(sector => {
      grouped[sector] = { process: [], output: [], outcome: [] };
      CATALOG.filter(ind => ind.sector === sector).forEach(ind => {
        grouped[sector][ind.level].push(ind);
      });
    });
    return grouped;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Collection System</h1>
          <p className="mt-2 text-gray-600">Enter data for all indicators across the three sectors</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {sectors.map(sector => (
              <button
                key={sector}
                onClick={() => setActiveTab(sector)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === sector
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {sector}
              </button>
            ))}
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Sector Content */}
        <div className="space-y-6">
          {Object.entries(levelLabels).map(([levelKey, levelLabel]) => {
            const indicators = indicatorsBySectorAndLevel[activeTab][levelKey];
            const isExpanded = expandedAccordions.has(levelKey);
            
            return (
              <div key={levelKey} className="bg-white rounded-lg shadow">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleAccordion(levelKey)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{levelLabel}</h2>
                    <p className="text-sm text-gray-500">{indicators.length} indicators</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">
                      {isExpanded ? "Collapse" : "Expand"}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="space-y-6">
                      {indicators.map(indicator => {
                        const rowState = state[indicator.id];
                        const periodOptions = getPeriodOptions(rowState.frequency);
                        
                        return (
                          <div key={indicator.id} className="border-l-4 border-blue-500 pl-4 py-4">
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-medium text-gray-900">{indicator.title}</h3>
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {indicator.id}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{indicator.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Value Input (renamed to Unit) */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Unit
                                </label>
                                {indicator.valueType === "yesno" ? (
                                  <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`${indicator.id}-value`}
                                        checked={rowState.value === true}
                                        onChange={() => updateRow(indicator.id, { value: true })}
                                        className="mr-2"
                                      />
                                      Yes
                                    </label>
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`${indicator.id}-value`}
                                        checked={rowState.value === false}
                                        onChange={() => updateRow(indicator.id, { value: false })}
                                        className="mr-2"
                                      />
                                      No
                                    </label>
                                  </div>
                                ) : indicator.valueType === "percent" ? (
                                  <div className="relative">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={typeof rowState.value === "number" ? rowState.value : ""}
                                      onChange={(e) => updateRow(indicator.id, { value: Number(e.target.value) })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="0-100"
                                    />
                                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                                  </div>
                                ) : (
                                  <input
                                    type="number"
                                    min="0"
                                    value={typeof rowState.value === "number" ? rowState.value : ""}
                                    onChange={(e) => updateRow(indicator.id, { value: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter number"
                                  />
                                )}
                              </div>

                              {/* Frequency Dropdown */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Frequency
                                </label>
                                <select
                                  value={rowState.frequency}
                                  onChange={(e) => updateRow(indicator.id, { 
                                    frequency: e.target.value,
                                    period: "" // Reset period when frequency changes
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="Quarterly">Quarterly</option>
                                  <option value="Annual">Annual</option>
                                  <option value="Semi-Annual">Semi-Annual</option>
                                  <option value="One-time">One-time</option>
                                  <option value="Baseline & Endline">Baseline & Endline</option>
                                  <option value="Midline & Endline">Midline & Endline</option>
                                </select>
                              </div>

                              {/* Period Dropdown (conditional) */}
                              {periodOptions.length > 0 && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Period
                                  </label>
                                  <select
                                    value={rowState.period}
                                    onChange={(e) => updateRow(indicator.id, { period: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Select period</option>
                                    {periodOptions.map(period => (
                                      <option key={period} value={period}>{period}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Responsible */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Responsible
                                </label>
                                {indicator.responsibleHints && indicator.responsibleHints.length > 0 ? (
                                  <CheckList
                                    options={indicator.responsibleHints}
                                    value={rowState.responsible}
                                    onChange={(values) => updateRow(indicator.id, { responsible: values })}
                                  />
                                ) : (
                                  <ChipInput
                                    value={rowState.responsible}
                                    onChange={(values) => updateRow(indicator.id, { responsible: values })}
                                    placeholder="Add responsible parties"
                                  />
                                )}
                              </div>

                              {/* Disaggregation */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Disaggregation
                                </label>
                                {indicator.disaggregationHints && indicator.disaggregationHints.length > 0 ? (
                                  <CheckList
                                    options={indicator.disaggregationHints}
                                    value={rowState.disaggregation}
                                    onChange={(values) => updateRow(indicator.id, { disaggregation: values })}
                                  />
                                ) : (
                                  <ChipInput
                                    value={rowState.disaggregation}
                                    onChange={(values) => updateRow(indicator.id, { disaggregation: values })}
                                    placeholder="Add disaggregation"
                                  />
                                )}
                              </div>

                              {/* Notes */}
                              <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Notes
                                </label>
                                <textarea
                                  value={rowState.notes}
                                  onChange={(e) => updateRow(indicator.id, { notes: e.target.value })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Additional notes or comments"
                                />
                              </div>

                              {/* Individual Action Buttons */}
                              <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                  onClick={() => handleIndividualSubmit(indicator.id, "draft")}
                                  className="btn btn-outline"
                                  disabled={rowState.saving}
                                >
                                  Save Draft
                                </button>
                                <button
                                  onClick={() => handleIndividualSubmit(indicator.id, "submitted")}
                                  className="btn btn-primary"
                                  disabled={rowState.saving}
                                >
                                  Submit
                                </button>
                                {rowState.statusMsg && (
                                  <span className="text-sm text-green-600 flex items-center">
                                    {rowState.statusMsg}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handleSaveDraft}
            className="btn btn-outline"
            disabled={Object.values(state).some(row => row.saving)}
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={Object.values(state).some(row => row.saving)}
          >
            Submit All Data
          </button>
        </div>
      </div>
    </div>
  );
}