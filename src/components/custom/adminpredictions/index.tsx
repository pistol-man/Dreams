import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, BarChart, PieChart, TrendingUp, AlertTriangle, Shield } from "lucide-react";

const AdminPredictions = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Safety Predictions</h1>
          <p className="text-muted-foreground">AI-powered safety analysis and predictions</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          <Shield className="w-4 h-4 mr-2" />
          AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">Medium</div>
            <p className="text-xs text-muted-foreground">Based on current data</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Predicted Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">15</div>
            <p className="text-xs text-muted-foreground">Next 24 hours</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8 min</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Incident Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[4/3] rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-8 w-8 mb-2 mx-auto text-blue-600" />
                <p className="text-muted-foreground">Trend analysis coming soon...</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Area Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[4/3] rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-8 w-8 mb-2 mx-auto text-blue-600" />
                <p className="text-muted-foreground">Distribution chart coming soon...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Predictive Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Peak Alert Hours</h4>
                <p className="text-xs text-muted-foreground">
                  Predicted high-risk period: 8 PM - 11 PM
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium">High-Risk Areas</h4>
                <p className="text-xs text-muted-foreground">
                  3 areas identified for increased patrolling
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <BarChart className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Resource Optimization</h4>
                <p className="text-xs text-muted-foreground">
                  Suggested patrol routes updated based on predictions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPredictions; 