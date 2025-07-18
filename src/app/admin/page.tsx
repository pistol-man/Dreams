import React from "react";
import { AdminLayout } from "@/components/custom/layout/admin-layout";
import AdminDashboard from "@/components/custom/admindashboard";

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}