import React from "react";
import { AdminLayout } from "@/components/custom/layout/admin-layout";
import AdminPredictions from "@/components/custom/adminpredictions";

export default function AdminPredictionsPage() {
  return (
    <AdminLayout>
      <AdminPredictions />
    </AdminLayout>
  );
} 