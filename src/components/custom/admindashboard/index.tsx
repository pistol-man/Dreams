"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Clock, Shield, AlertTriangle, Navigation2, Send, LogIn } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useRef, useEffect } from 'react';
import { Map as LeafletMap } from 'leaflet';
import { Circle } from 'react-leaflet';

// Custom style for map z-index
const mapStyle = { height: '100%', width: '100%', zIndex: 0 };

// City coordinates
const CITY_COORDS: Record<'mumbai' | 'pune' | 'bangalore', [number, number]> = {
  mumbai: [19.076090, 72.877426],      // Mumbai (exact center)
  pune: [18.520430, 73.856743],        // Pune (exact center)
  bangalore: [12.971599, 77.594566],   // Bangalore (exact center)
};

// Generate 5 random points within ~5km of city center
function generateRandomPoints(center: [number, number], count = 5, radiusKm = 5): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusKm;
    // Approximate conversion: 1 deg lat ~ 111km, 1 deg lng ~ 111km * cos(lat)
    const dLat = (distance / 111) * Math.cos(angle);
    const dLng = (distance / (111 * Math.cos(center[0] * Math.PI / 180))) * Math.sin(angle);
    points.push([center[0] + dLat, center[1] + dLng]);
  }
  return points;
}

const CITY_HEATMAP_POINTS: Record<'mumbai' | 'pune' | 'bangalore', [number, number][]> = {
  mumbai: generateRandomPoints([19.076, 72.8777]),
  pune: generateRandomPoints([18.5204, 73.8567]),
  bangalore: generateRandomPoints([12.9716, 77.5946]),
};

// Real interactive map using react-leaflet
const RealMap = ({ center, city }: { center: [number, number], city: 'mumbai' | 'pune' | 'bangalore' }) => {
  const mapRef = useRef<LeafletMap | null>(null);
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo(center, 14, { animate: true, duration: 1.2 });
    }
  }, [center]);
  return (
    <MapContainer center={center} zoom={14} style={mapStyle} ref={mapRef}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Heatmap blue zones */}
      {CITY_HEATMAP_POINTS[city].map((pos, idx) => (
        <Circle
          key={idx}
          center={pos}
          radius={500} // 500 meters
          pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.25, weight: 2 }}
        />
      ))}
      <Marker position={center}>
        <Popup>
          <div style={{ zIndex: 10, position: 'relative' }}>{
            center[0] === CITY_COORDS.mumbai[0] ? 'Mumbai Center' :
            center[0] === CITY_COORDS.pune[0] ? 'Pune Center' :
            'Bangalore Center'
          }</div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

type AlertCategory = 'Harassment' | 'Violence' | 'Exploitation' | 'Emergency' | 'Counseling';
interface RealTimeAlert {
  id: string
  userId: string
  location: string
  timestamp: string
  eta: string | null
  status: "pending" | "dispatched" | "resolved"
  priority: "high" | "medium" | "low"
  city: "mumbai" | "pune" | "bangalore"
  category: AlertCategory
}

interface LoginCredentials {
  username: string
  password: string
}

interface OfficerProfile {
  name: string
  email: string
  city: string
  headquarters: string
  activeCases: number
  teams: number
  responseRate: number
}

const ALERT_CATEGORIES: AlertCategory[] = [
  'Harassment', 'Violence', 'Exploitation', 'Emergency', 'Counseling'
];

const AdminDashboard = () => {
  const { toast } = useToast()
  const [currentLocation, setCurrentLocation] = useState<"mumbai" | "pune" | "bangalore">("mumbai")
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginForm, setLoginForm] = useState<LoginCredentials>({ username: "", password: "" })
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory | 'All'>('All');

  const officerProfiles: Record<"mumbai" | "pune" | "bangalore", OfficerProfile> = {
    mumbai: {
      name: "Senior Inspector Rajesh Singh",
      email: "rajesh.singh@mumbaipolice.gov.in",
      city: "Mumbai",
      headquarters: "Mumbai Police HQ",
      activeCases: 15,
      teams: 8,
      responseRate: 95,
    },
    pune: {
      name: "Senior Inspector Priya Sharma",
      email: "priya.sharma@punepolice.gov.in",
      city: "Pune",
      headquarters: "Pune Police HQ",
      activeCases: 12,
      teams: 6,
      responseRate: 92,
    },
    bangalore: {
      name: "Senior Inspector Arjun Kumar",
      email: "arjun.kumar@bangalorepolice.gov.in",
      city: "Bangalore",
      headquarters: "Bangalore Police HQ",
      activeCases: 18,
      teams: 10,
      responseRate: 97,
    },
  }

  const [realTimeAlerts, setRealTimeAlerts] = useState<RealTimeAlert[]>([
    // Mumbai alerts
    {
      id: "SOS-001",
      userId: "USR-2024-001",
      location: "Bandra West, Mumbai",
      timestamp: "2 mins ago",
      eta: "5 mins",
      status: "pending",
      priority: "high",
      city: "mumbai",
      category: "Harassment",
    },
    {
      id: "SOS-002",
      userId: "USR-2024-015",
      location: "Andheri East, Mumbai",
      timestamp: "5 mins ago",
      eta: "8 mins",
      status: "dispatched",
      priority: "high",
      city: "mumbai",
      category: "Violence",
    },
    {
      id: "SOS-003",
      userId: "USR-2024-023",
      location: "Colaba, Mumbai",
      timestamp: "8 mins ago",
      eta: "12 mins",
      status: "pending",
      priority: "medium",
      city: "mumbai",
      category: "Exploitation",
    },
    {
      id: "SOS-004",
      userId: "USR-2024-045",
      location: "Juhu Beach, Mumbai",
      timestamp: "12 mins ago",
      eta: "3 mins",
      status: "dispatched",
      priority: "high",
      city: "mumbai",
      category: "Emergency",
    },
    {
      id: "SOS-005",
      userId: "USR-2024-032",
      location: "Dadar West, Mumbai",
      timestamp: "15 mins ago",
      eta: "10 mins",
      status: "pending",
      priority: "medium",
      city: "mumbai",
      category: "Counseling",
    },
    // Pune alerts
    {
      id: "SOS-006",
      userId: "USR-2024-050",
      location: "Koregaon Park, Pune",
      timestamp: "1 min ago",
      eta: "4 mins",
      status: "pending",
      priority: "high",
      city: "pune",
      category: "Harassment",
    },
    {
      id: "SOS-007",
      userId: "USR-2024-057",
      location: "Hinjewadi Phase 1, Pune",
      timestamp: "3 mins ago",
      eta: "6 mins",
      status: "dispatched",
      priority: "medium",
      city: "pune",
      category: "Violence",
    },
    {
      id: "SOS-008",
      userId: "USR-2024-061",
      location: "FC Road, Pune",
      timestamp: "6 mins ago",
      eta: "7 mins",
      status: "pending",
      priority: "high",
      city: "pune",
      category: "Exploitation",
    },
    {
      id: "SOS-009",
      userId: "USR-2024-069",
      location: "Viman Nagar, Pune",
      timestamp: "10 mins ago",
      eta: "9 mins",
      status: "dispatched",
      priority: "low",
      city: "pune",
      category: "Emergency",
    },
    // Bangalore alerts
    {
      id: "SOS-010",
      userId: "USR-2024-075",
      location: "Koramangala, Bangalore",
      timestamp: "30 secs ago",
      eta: "3 mins",
      status: "pending",
      priority: "high",
      city: "bangalore",
      category: "Harassment",
    },
    {
      id: "SOS-011",
      userId: "USR-2024-082",
      location: "Whitefield, Bangalore",
      timestamp: "2 mins ago",
      eta: "7 mins",
      status: "dispatched",
      priority: "medium",
      city: "bangalore",
      category: "Violence",
    },
    {
      id: "SOS-012",
      userId: "USR-2024-089",
      location: "Indiranagar, Bangalore",
      timestamp: "4 mins ago",
      eta: "5 mins",
      status: "pending",
      priority: "high",
      city: "bangalore",
      category: "Exploitation",
    },
    {
      id: "SOS-013",
      userId: "USR-2024-095",
      location: "Electronic City, Bangalore",
      timestamp: "7 mins ago",
      eta: "11 mins",
      status: "pending",
      priority: "medium",
      city: "bangalore",
      category: "Emergency",
    },
    {
      id: "SOS-014",
      userId: "USR-2024-101",
      location: "Jayanagar, Bangalore",
      timestamp: "9 mins ago",
      eta: "6 mins",
      status: "dispatched",
      priority: "low",
      city: "bangalore",
      category: "Counseling",
    },
    {
      id: "SOS-015",
      userId: "USR-2024-108",
      location: "HSR Layout, Bangalore",
      timestamp: "11 mins ago",
      eta: "8 mins",
      status: "pending",
      priority: "high",
      city: "bangalore",
      category: "Harassment",
    },
  ])

  const currentOfficer = officerProfiles[currentLocation]
  const filteredAlerts = realTimeAlerts.filter((alert) =>
    alert.city === currentLocation &&
    (selectedCategory === 'All' || alert.category === selectedCategory)
  );

  const handleLogin = async () => {
    setIsLoggingIn(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const credentials = {
      mumbai: { username: "Mumbai", password: "Mumbai@123" },
      pune: { username: "Pune", password: "Pune@123" },
      bangalore: { username: "Bangalore", password: "Bangalore@123" },
    }

    let loginSuccess = false
    let newLocation: "mumbai" | "pune" | "bangalore" = currentLocation

    if (loginForm.username === credentials.mumbai.username && loginForm.password === credentials.mumbai.password) {
      newLocation = "mumbai"
      loginSuccess = true
    } else if (loginForm.username === credentials.pune.username && loginForm.password === credentials.pune.password) {
      newLocation = "pune"
      loginSuccess = true
    } else if (
        loginForm.username === credentials.bangalore.username &&
        loginForm.password === credentials.bangalore.password
    ) {
      newLocation = "bangalore"
      loginSuccess = true
    }

    if (loginSuccess) {
      setCurrentLocation(newLocation)
      setIsLoginOpen(false)
      setLoginForm({ username: "", password: "" })
      toast({
        title: "Login Successful",
        description: `Welcome to ${newLocation.charAt(0).toUpperCase() + newLocation.slice(1)} Police Dashboard`,
      })
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoggingIn(false)
  }

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    })
  }

  const handleDispatch = (alertId: string) => {
    setRealTimeAlerts((alerts) =>
        alerts.map((alert) => (alert.id === alertId ? { ...alert, status: "dispatched" as const } : alert)),
    )

    toast({
      title: "Team Dispatched",
      description: "Emergency response team has been notified and dispatched.",
    })
  }

  return (
      <div className="space-y-6 pb-20 md:pb-0 bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-50/50 dark:from-blue-950/50 dark:via-slate-950 dark:to-blue-950/50">
        {/* Officer Profile Section */}
        <Card className="shadow-soft rounded-2xl border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20 ring-4 ring-blue-500/30">
                  <AvatarImage src={`/assets/profiles/${currentLocation}-officer.jpeg`} />
                  <AvatarFallback className="bg-blue-500 text-white text-xl">
                    {currentLocation === "mumbai" ? "RS" : currentLocation === "pune" ? "PS" : "AK"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{currentOfficer.name}</h2>
                  <p className="text-muted-foreground mb-2">{currentOfficer.email}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30">
                      <Shield className="w-3 h-3 mr-1" />
                      Senior Police Officer
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      <MapPin className="w-3 h-3 mr-1" />
                      {currentOfficer.headquarters}
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
                      <p className="text-2xl font-bold text-blue-600">{currentOfficer.activeCases}</p>
                      <p className="text-sm text-muted-foreground">Active Cases</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{currentOfficer.teams}</p>
                      <p className="text-sm text-muted-foreground">Teams</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{currentOfficer.responseRate}%</p>
                      <p className="text-sm text-muted-foreground">Response Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="rounded-full mb-2">
                  Current: {currentLocation.charAt(0).toUpperCase() + currentLocation.slice(1)}
                </Badge>

                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-full bg-transparent">
                      <LogIn className="w-4 h-4 mr-2" />
                      Switch Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Police Login</DialogTitle>
                      <DialogDescription>
                        Enter your credentials to access the dashboard for your assigned location.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Username
                        </Label>
                        <Input
                            id="username"
                            value={loginForm.username}
                            onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                            className="col-span-3"
                            placeholder="Enter username"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                          Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                            className="col-span-3"
                            placeholder="Enter password"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        <p>
                          <strong>Mumbai:</strong> Username: Mumbai, Password: Mumbai@123
                        </p>
                        <p>
                          <strong>Pune:</strong> Username: Pune, Password: Pune@123
                        </p>
                        <p>
                          <strong>Bangalore:</strong> Username: Bangalore, Password: Bangalore@123
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                          type="submit"
                          onClick={handleLogin}
                          disabled={isLoggingIn || !loginForm.username || !loginForm.password}
                      >
                        {isLoggingIn ? "Logging in..." : "Login"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
              <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                      <p className="text-muted-foreground">Loading map...</p>
                    </div>
                  }
              >
                <RealMap center={CITY_COORDS[currentLocation]} city={currentLocation} />
              </Suspense>
            </div>
          </CardContent>
        </Card>

        {/* Real-Time Alerts Section */}
        <Card className="shadow-soft rounded-2xl border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">
                Real-Time SOS Alerts - {currentLocation.charAt(0).toUpperCase() + currentLocation.slice(1)} (
                {filteredAlerts.length})
              </CardTitle>
              <div className="flex items-center gap-4">
                <select
                  className="rounded border px-2 py-1 text-sm bg-white dark:bg-slate-900 text-black dark:text-white"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as AlertCategory | 'All')}
                >
                  <option value="All">All Categories</option>
                  {ALERT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Live Alerts
                </Badge>
              </div>
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
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
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
                                  Number.parseInt(alert.eta || "0") <= 5
                                      ? "border-green-500 text-green-600"
                                      : Number.parseInt(alert.eta || "0") <= 10
                                          ? "border-amber-500 text-amber-600"
                                          : "border-red-500 text-red-600",
                              )}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {alert.eta || "Calculating..."}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("rounded-full px-2 py-1 text-xs",
                            alert.category === 'Violence' && 'bg-red-200 text-red-800',
                            alert.category === 'Harassment' && 'bg-yellow-100 text-yellow-800',
                            alert.category === 'Exploitation' && 'bg-purple-100 text-purple-800',
                            alert.category === 'Emergency' && 'bg-blue-100 text-blue-800',
                            alert.category === 'Counseling' && 'bg-green-100 text-green-800',
                          )}>
                            {alert.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                              variant="secondary"
                              className={cn(
                                  "rounded-full",
                                  alert.status === "pending" && "bg-amber-100 text-amber-700",
                                  alert.status === "dispatched" && "bg-green-100 text-green-700",
                                  alert.status === "resolved" && "bg-blue-100 text-blue-700",
                              )}
                          >
                            {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                              size="sm"
                              variant={alert.status === "pending" ? "default" : "outline"}
                              className={cn(
                                  "rounded-full",
                                  alert.status === "pending" && "bg-blue-500 hover:bg-blue-600",
                                  alert.status !== "pending" && "text-muted-foreground",
                              )}
                              onClick={() => handleDispatch(alert.id)}
                              disabled={alert.status !== "pending"}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {alert.status === "pending" ? "Dispatch" : "Dispatched"}
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
  )
}

export default AdminDashboard