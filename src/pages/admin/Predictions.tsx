import React, { Suspense } from "react";
import { AdminLayout } from "@/components/custom/layout/admin-layout";
import AdminPredictions from "@/components/custom/adminpredictions";

export default function PredictionsPage() {
  console.log("Rendering PredictionsPage");
  
  return (
    <AdminLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading predictions...</p>
        </div>
      }>
        <AdminPredictions />
      </Suspense>
    </AdminLayout>
  );
} 