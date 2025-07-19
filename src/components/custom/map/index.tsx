import React, { Suspense, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { predictionData } from "@/data/predictions";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

// Lazy load the map component
const SafetyMap = React.lazy(() => import('./SafetyMap'));

const MapPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2025-07-19"));

  // Filter data based on selected date
  const filteredData = predictionData.filter(prediction => {
    const predictionDate = new Date(prediction.Date);
    return predictionDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="fixed inset-0 w-full h-full">
      {/* Map Section */}
      <Card className="w-full h-full rounded-none border-0 bg-transparent">
        <CardContent className="p-0 w-full h-full relative">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          }>
            <SafetyMap 
              data={filteredData}
              className="w-full h-full" 
            />
          </Suspense>

          {/* Date Selector Overlay */}
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-[1000]">
            <div className="mb-2 text-sm font-medium">Select Date</div>
            <div className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {format(selectedDate, "MMMM d, yyyy")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPage;