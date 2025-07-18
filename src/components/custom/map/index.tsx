import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MapPage = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-soft rounded-2xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Safety Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-xl flex items-center justify-center">
            <p className="text-muted-foreground">Map component will be implemented here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPage;