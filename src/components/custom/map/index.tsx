import React, { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { predictionData } from "@/data/predictions";

// Lazy load the map component
const SafetyMap = React.lazy(() => import('./SafetyMap'));

const MapPage = () => {
  return (
    <div className="fixed inset-0 w-full h-full">
      {/* Map Section */}
      <Card className="w-full h-full rounded-none border-0 bg-transparent">
        <CardContent className="p-0 w-full h-full">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          }>
            <SafetyMap 
              data={predictionData}
              className="w-full h-full" 
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPage;