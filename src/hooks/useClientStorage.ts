// Hook for client-side data storage
import { useEffect, useState } from 'react';

interface DataRow {
  id: string;
  section: string;
  level: string;
  label: string;
  value: string;
  unit: string;
  frequency: string;
  period: string;
  year: string;
  quarter: string;
  responsible: string;
  disaggregation: string;
  notes: string;
  status: string;
  savedAt: string;
  submitterMessage: string;
  reviewerMessage: string;
  approverMessage: string;
  user: string;
}

export function useClientStorage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const saveSubmission = async (data: any, user: any) => {
    if (!isClient) return false;

    try {
      const { addRow } = await import('@/lib/client-storage');
      
      const dataRow: DataRow = {
        id: data.indicatorId,
        section: "Fisheries Management",
        level: "Project", 
        label: `Indicator ${data.indicatorId}`,
        value: typeof data.value === "boolean" ? (data.value ? "Yes" : "No") : (data.value?.toString() ?? ""),
        unit: data.unit || "",
        frequency: data.frequency || "",
        period: data.period || "",
        year: new Date().getFullYear().toString(),
        quarter: "Q1",
        responsible: Array.isArray(data.responsible) ? data.responsible.join(", ") : (data.responsible || ""),
        disaggregation: Array.isArray(data.disaggregation) ? data.disaggregation.join(", ") : (data.disaggregation || ""),
        notes: data.notes || "",
        status: data.status || "submitted",
        savedAt: new Date().toISOString(),
        submitterMessage: data.submitterMessage || "",
        reviewerMessage: "",
        approverMessage: "",
        user: user?.email || "unknown",
      };

      addRow(dataRow);
      console.log('Saved to localStorage:', dataRow);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  };

  return { saveSubmission, isClient };
}








