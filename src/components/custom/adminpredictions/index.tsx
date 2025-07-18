import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { PredictionData, getSeverityLevel, severityColorMap } from '@/types/predictions';
import predictionData from '@/dataset/Mum_predictions.json';
import PredictionsMap from './PredictionsMap';

const AdminPredictions = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<PredictionData[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    // Extract unique dates and sort them
    const dates = [...new Set(predictionData.map(item => item.Date))].sort();
    setAvailableDates(dates);
  }, []);

  useEffect(() => {
    // Filter data based on selected date or show all if no date selected
    const filtered = selectedDate
      ? predictionData.filter(item => item.Date === selectedDate)
      : predictionData;
    setFilteredData(filtered);
  }, [selectedDate]);

  const DateCircle = ({ date, isSelected, onClick }: { date: string; isSelected: boolean; onClick: () => void }) => (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-full p-4 text-center transition-colors
        ${isSelected 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-secondary hover:bg-secondary/80'}`}
    >
      <div className="text-sm font-medium">
        {format(new Date(date), 'MMM d')}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Predictions Dashboard</h1>
            <p className="text-muted-foreground">
              Future 7-day safety predictions for Mumbai
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {filteredData.length} predictions
          </Badge>
        </div>

        {/* Map Section */}
        <Card className="shadow-lg rounded-2xl bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="h-[800px]">
              <PredictionsMap data={filteredData} />
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card className="shadow-lg rounded-2xl bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex gap-4 overflow-x-auto pb-2">
              <div
                onClick={() => setSelectedDate(null)}
                className={`cursor-pointer rounded-full p-4 text-center transition-colors
                  ${!selectedDate 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'}`}
              >
                <div className="text-sm font-medium">All Days</div>
              </div>
              {availableDates.map(date => (
                <DateCircle
                  key={date}
                  date={date}
                  isSelected={date === selectedDate}
                  onClick={() => setSelectedDate(date)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Predictions Table */}
        <Card className="shadow-lg rounded-2xl bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Population Density</TableHead>
                    <TableHead>Special Requirement</TableHead>
                    <TableHead>Resources Allocated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((prediction, index) => {
                    const severityLevel = getSeverityLevel(parseFloat(prediction.Predicted_Severity_Scale));
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          {format(new Date(prediction.Date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{prediction.Predicted_Call_Category}</TableCell>
                        <TableCell>
                          <div className="font-medium">{prediction.Special_Requirement}</div>
                          <div className="text-sm text-muted-foreground">
                            {prediction.pincode}, {prediction.District}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={severityColorMap[severityLevel]}>
                            {prediction.Predicted_Severity_Scale}
                          </Badge>
                        </TableCell>
                        <TableCell>{prediction.Population_Density}</TableCell>
                        <TableCell>{prediction.Special_Requirement}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              👮 Police: {prediction.Allocated_Police_Personnel}
                            </div>
                            <div className="text-sm">
                              🚑 Ambulances: {prediction.Allocated_Ambulances}
                            </div>
                            <div className="text-sm">
                              👨‍⚕️ Medical: {prediction.Allocated_Doctors} doctors, {prediction.Allocated_Paramedics} paramedics
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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