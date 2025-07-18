import React, { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Clock, Shield, AlertTriangle, Navigation2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Lazy load the map component
const WomenSafetyMap = React.lazy(() => import('../map/WomenSafetyMap'));

interface RealTimeAlert {
  id: string;
  userId: string;
  location: string;
  timestamp: string;
  eta: string | null;
  status: 'pending' | 'dispatched' | 'resolved';
  priority: 'high' | 'medium' | 'low';
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [realTimeAlerts, setRealTimeAlerts] = useState<RealTimeAlert[]>([
    {
      id: "SOS-001",
      userId: "USR-2024-001",
      location: "Bandra West, Mumbai",
      timestamp: "2 mins ago",
      eta: "5 mins",
      status: 'pending',
      priority: 'high'
    },
    {
      id: "SOS-002",
      userId: "USR-2024-015",
      location: "Andheri East, Mumbai",
      timestamp: "5 mins ago",
      eta: "8 mins",
      status: 'dispatched',
      priority: 'high'
    },
    {
      id: "SOS-003",
      userId: "USR-2024-023",
      location: "Colaba, Mumbai",
      timestamp: "8 mins ago",
      eta: "12 mins",
      status: 'pending',
      priority: 'medium'
    },
    {
      id: "SOS-004",
      userId: "USR-2024-045",
      location: "Juhu Beach, Mumbai",
      timestamp: "12 mins ago",
      eta: "3 mins",
      status: 'dispatched',
      priority: 'high'
    },
    {
      id: "SOS-005",
      userId: "USR-2024-032",
      location: "Dadar West, Mumbai",
      timestamp: "15 mins ago",
      eta: "10 mins",
      status: 'pending',
      priority: 'medium'
    }
  ]);

  const handleDispatch = (alertId: string) => {
    setRealTimeAlerts(alerts =>
      alerts.map(alert =>
        alert.id === alertId
          ? { ...alert, status: 'dispatched' as const }
          : alert
      )
    );

    toast({
      title: "Team Dispatched",
      description: "Emergency response team has been notified and dispatched.",
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-50/50 dark:from-blue-950/50 dark:via-slate-950 dark:to-blue-950/50">
      {/* Officer Profile Section */}
      <Card className="shadow-soft rounded-2xl border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20 ring-4 ring-blue-500/30">
              <AvatarImage src="/assets/profiles/officer.jpeg" />
              <AvatarFallback className="bg-blue-500 text-white text-xl">
                PO
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">Senior Inspector Rajesh Singh</h2>
              <p className="text-muted-foreground mb-2">rajesh.singh@mumbaipolice.gov.in</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Senior Police Officer
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  <MapPin className="w-3 h-3 mr-1" />
                  Mumbai Police HQ
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  <Clock className="w-3 h-3 mr-1" />
                  On Duty
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">24/7</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">15</p>
                  <p className="text-sm text-muted-foreground">Active Cases</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                  <p className="text-sm text-muted-foreground">Teams</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">95%</p>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Overview Section */}
      <Card className="shadow-soft rounded-2xl border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Real Time Emergency Response Map</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Navigation2 className="w-4 h-4 mr-2" />
              Live View
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-xl overflow-hidden">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            }>
              <WomenSafetyMap className="w-full h-full" />
            </Suspense>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Alerts Section */}
      <Card className="shadow-soft rounded-2xl border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Real-Time SOS Alerts</CardTitle>
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Live Alerts
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {realTimeAlerts.map((alert) => (
                  <TableRow key={alert.id} className="group">
                    <TableCell className="font-medium">{alert.id}</TableCell>
                    <TableCell>{alert.userId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {alert.location}
                      </div>
                    </TableCell>
                    <TableCell>{alert.timestamp}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "rounded-full",
                          parseInt(alert.eta || "0") <= 5 ? "border-green-500 text-green-600" :
                          parseInt(alert.eta || "0") <= 10 ? "border-amber-500 text-amber-600" :
                          "border-red-500 text-red-600"
                        )}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {alert.eta || 'Calculating...'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "rounded-full",
                          alert.status === 'pending' && "bg-amber-100 text-amber-700",
                          alert.status === 'dispatched' && "bg-green-100 text-green-700",
                          alert.status === 'resolved' && "bg-blue-100 text-blue-700"
                        )}
                      >
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={alert.status === 'pending' ? "default" : "outline"}
                        className={cn(
                          "rounded-full",
                          alert.status === 'pending' && "bg-blue-500 hover:bg-blue-600",
                          alert.status !== 'pending' && "text-muted-foreground"
                        )}
                        onClick={() => handleDispatch(alert.id)}
                        disabled={alert.status !== 'pending'}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {alert.status === 'pending' ? 'Dispatch' : 'Dispatched'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-900/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default AdminDashboard;