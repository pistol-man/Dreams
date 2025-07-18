declare module '*/PredictionsMap' {
  import { FC } from 'react';
  
  interface PredictionData {
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

  interface PredictionsMapProps {
    data: PredictionData[];
    className?: string;
  }

  const PredictionsMap: FC<PredictionsMapProps>;
  export default PredictionsMap;
} 