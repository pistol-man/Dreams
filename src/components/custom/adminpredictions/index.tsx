import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { predictionData } from "@/data/predictions";

// Lazy load the map component
const PredictionsMap = React.lazy(() => import('./PredictionsMap'));

const AdminPredictions = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Safety Predictions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visualize predicted emergency patterns across Mumbai
            </p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 py-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Live Analysis
          </Badge>
        </div>

        {/* Map Section */}
        <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-800 mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="aspect-[21/9] rounded-xl overflow-hidden">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              }>
                <PredictionsMap 
                  data={predictionData}
                  className="w-full h-full" 
                />
              </Suspense>
            </div>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-800">
          <CardHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Detailed Predictions</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {predictionData.length} Predictions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Severity</TableHead>
                    <TableHead className="font-semibold">Population Density</TableHead>
                    <TableHead className="font-semibold">Special Requirement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictionData.map((prediction, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-medium">{prediction.District}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              PIN: {prediction.pincode}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            "rounded-full px-3 py-1",
                            prediction.Predicted_Call_Category === "Emergency" && "bg-red-100 text-red-700",
                            prediction.Predicted_Call_Category === "Violence" && "bg-orange-100 text-orange-700",
                            prediction.Predicted_Call_Category === "Harassment" && "bg-yellow-100 text-yellow-700",
                            prediction.Predicted_Call_Category === "Counseling" && "bg-blue-100 text-blue-700",
                            prediction.Predicted_Call_Category === "Health" && "bg-green-100 text-green-700"
                          )}
                        >
                          {prediction.Predicted_Call_Category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className={cn(
                              "w-2 h-2 rounded-full",
                              prediction.Predicted_Severity_Scale >= 7.5 && "bg-red-500",
                              prediction.Predicted_Severity_Scale >= 5 && prediction.Predicted_Severity_Scale < 7.5 && "bg-orange-500",
                              prediction.Predicted_Severity_Scale < 5 && "bg-yellow-500"
                            )}
                          />
                          <span className="font-medium">{prediction.Predicted_Severity_Scale.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{prediction.Population_Density.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-gray-600 dark:text-gray-400">
                          {prediction.Special_Requirement}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPredictions; 