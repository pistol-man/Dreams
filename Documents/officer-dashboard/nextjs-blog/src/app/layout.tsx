// src/app/layout.tsx
import './globals.css';
import BottomNavBar from '@/components/BottomNavBar';

export const metadata = {
  title: 'Officer Dashboard',
  description: 'Geospatial safety dashboard for 181',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-[#EDE7F6]">
        {children}
        <BottomNavBar />
      </body>
    </html>
  );
}
