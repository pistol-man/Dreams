export interface PredictionData {
  Date: string;
  Predicted_Call_Category: string;
  District: string;
  State: string;
  Predicted_Severity_Scale: string;
  Population_Density: string;
  Fire_Brigade_Vehicles: string;
  Ambulances: string;
  Police_Personnel: string;
  Paramedics: string;
  Doctors: string;
  Allocated_Fire_Brigade_Vehicles: string;
  Allocated_Ambulances: string;
  Allocated_Police_Personnel: string;
  Allocated_Paramedics: string;
  Allocated_Doctors: string;
  Special_Requirement: string;
  pincode: string;
  latitude: string;
  longitude: string;
}

export const severityColorMap = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export function getSeverityLevel(scale: number): keyof typeof severityColorMap {
  if (scale < 4) return "low";
  if (scale < 6) return "medium";
  if (scale < 8) return "high";
  return "critical";
} 