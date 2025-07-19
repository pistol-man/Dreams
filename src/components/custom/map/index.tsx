import React, { Suspense, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { predictionData } from "@/data/predictions";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

// Lazy load the map components
const TrustedContactsMap = React.lazy(() => import('./TrustedContactsMap'));

// Trusted contacts data with Bandra locations
const trustedContacts = [
  {
    id: "1",
    name: "Mom",
    phone: "+919512464656",
    relationship: "Mother",
    imageFile: "/assets/profiles/mom.jpeg",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mom",
    distance: "12 mins",
    location: {
      lat: 19.0596,
      lng: 72.8295,
      address: "Bandra West, Mumbai"
    }
  },
  {
    id: "2", 
    name: "Varun",
    phone: "+919324048833",
    relationship: "Friend",
    imageFile: "/assets/profiles/varun.jpeg",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dad",
    distance: "20 mins",
    location: {
      lat: 19.0650,
      lng: 72.8350,
      address: "Bandra East, Mumbai"
    }
  },
  {
    id: "3",
    name: "Rhea",
    phone: "+919512464656",
    relationship: "Sister",
    imageFile: "/assets/profiles/rhea.jpeg",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sister",
    distance: "5 mins",
    location: {
      lat: 19.0550,
      lng: 72.8250,
      address: "Bandra Reclamation, Mumbai"
    }
  },
  {
    id: "4",
    name: "Vedant",
    phone: "+917977895844",
    relationship: "Friend",
    imageFile: "/assets/profiles/vedant.jpeg",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bestfriend",
    distance: "8 mins",
    location: {
      lat: 19.0700,
      lng: 72.8400,
      address: "Bandra Kurla Complex, Mumbai"
    }
  }
];

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
            <TrustedContactsMap 
              trustedContacts={trustedContacts}
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

          {/* Map Info Overlay */}
          <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-[1000] max-w-sm">
            <div className="text-sm font-medium mb-2">
              Safety Map with Trusted Contacts
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <div>• <strong>Red areas:</strong> Higher risk zones</div>
              <div>• <strong>Profile pictures:</strong> Your trusted contacts</div>
              <div>• <strong>Click markers:</strong> View contact details and call</div>
              <div>• <strong>Green dots:</strong> Contacts are available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPage;