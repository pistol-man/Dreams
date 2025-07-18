export interface PredictionData {
  Date: string;
  Predicted_Call_Category: string;
  District: string;
  State: string;
  Predicted_Severity_Scale: number;
  Population_Density: number;
  latitude: number;
  longitude: number;
  Special_Requirement: string;
  pincode: string;
}

export const predictionData: PredictionData[] = [
  {
    "Date": "2025-07-19",
    "Predicted_Call_Category": "Counseling",
    "District": "Mumbai City",
    "State": "Maharashtra",
    "Predicted_Severity_Scale": 7.45,
    "Population_Density": 15000,
    "latitude": 18.979,
    "longitude": 72.8335,
    "Special_Requirement": "Veer Jeejamata Udyan zoo and garden",
    "pincode": "400027"
  },
  {
    "Date": "2025-07-19",
    "Predicted_Call_Category": "Counseling",
    "District": "Mumbai Suburban",
    "State": "Maharashtra",
    "Predicted_Severity_Scale": 6.22,
    "Population_Density": 25000,
    "latitude": 19.095,
    "longitude": 72.865,
    "Special_Requirement": "Sahar international airport high security",
    "pincode": "400099"
  },
  {
    "Date": "2025-07-19",
    "Predicted_Call_Category": "Emergency",
    "District": "Mumbai Suburban",
    "State": "Maharashtra",
    "Predicted_Severity_Scale": 5.87,
    "Population_Density": 35000,
    "latitude": 19.167,
    "longitude": 72.849,
    "Special_Requirement": "Goregaon West residential",
    "pincode": "400062"
  }
  // Add all entries from the CSV file here
]; 