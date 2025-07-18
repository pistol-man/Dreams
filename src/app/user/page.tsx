import UserDashboard from "@/components/custom/userdashboard";
import UserLayout from "@/components/custom/layout/user-layout";

export default function UserPage() {
  return (
    <UserLayout>
      <UserDashboard />
    </UserLayout>
  );
}