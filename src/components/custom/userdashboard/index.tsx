import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Phone, MapPin, Clock, Shield, Camera, X, AlertTriangle, Navigation2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useShake } from "@/hooks/use-shake";
import { useCamera } from "@/hooks/use-camera";

interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  avatar?: string;
  imageFile?: string;
  distance?: string;
}

interface NearbyInfrastructure {
  id: string;
  name: string;
  type: 'Police Station' | 'Hospital' | 'DLSA' | 'Protection Officer' | 'OSC';
  timeToReach: string;
  address: string;
  phone: string;
}

const UserDashboard = () => {
  const { toast } = useToast();
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([
    {
      id: "1",
      name: "Mom",
      phone: "+91 9876543210",
      relationship: "Mother",
      imageFile: "/assets/profiles/mom.jpeg",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mom",
      distance: "12 mins"
    },
    {
      id: "2", 
      name: "Varun",
      phone: "+91 9876543211",
      relationship: "Friend",
      imageFile: "/assets/profiles/varun.jpeg",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dad",
      distance: "20 mins"
    },
    {
      id: "3",
      name: "Rhea",
      phone: "+91 9876543212", 
      relationship: "Sister",
      imageFile: "/assets/profiles/rhea.jpeg",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sister",
      distance: "5 mins"
    },
    {
      id: "4",
      name: "Vedant",
      phone: "+91 9876543213",
      relationship: "Friend",
      imageFile: "/assets/profiles/vedant.jpeg",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bestfriend",
      distance: "8 mins"
    }
  ]);

  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relationship: "",
    imageFile: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSafeModeEnabled, setIsSafeModeEnabled] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const { enableCamera, disableCamera, videoRef, error: cameraError } = useCamera();
  const { 
    enableShake, 
    disableShake, 
    permissionStatus: shakePermissionStatus,
    error: shakeError,
    isIOS,
    isMobile 
  } = useShake({
    onShake: () => {
      if (isSafeModeEnabled) {
        activateSOS();
      }
    }
  });

  const [nearbyInfrastructure] = useState<NearbyInfrastructure[]>([
    {
      id: "1",
      name: "Bandra Police Station",
      type: "Police Station",
      timeToReach: "12 mins",
      address: "Police Colony, Bandra West, Mumbai",
      phone: "022-26439877"
    },
    {
      id: "2",
      name: "Lilavati Hospital",
      type: "Hospital",
      timeToReach: "15 mins",
      address: "A-791, Bandra Reclamation, Bandra West",
      phone: "022-26568000"
    },
    {
      id: "3",
      name: "Mumbai DLSA Office",
      type: "DLSA",
      timeToReach: "25 mins",
      address: "Old High Court Building, Fort, Mumbai",
      phone: "022-22691395"
    },
    {
      id: "4",
      name: "Protection Officer - Bandra",
      type: "Protection Officer",
      timeToReach: "18 mins",
      address: "Collector Office, Bandra East",
      phone: "022-26556799"
    },
    {
      id: "5",
      name: "Sakhi One Stop Centre",
      type: "OSC",
      timeToReach: "20 mins",
      address: "K.B. Bhabha Hospital, Bandra West",
      phone: "022-26422775"
    }
  ]);

  const activateSOS = async () => {
    setIsSOSActive(true);

    // Request camera access
    toast({
      title: "Activating Camera",
      description: "Please allow camera access when prompted",
    });

    const hasCameraAccess = await enableCamera();
    
    if (hasCameraAccess) {
      setShowCamera(true);
      // Notify emergency contacts
      trustedContacts.forEach(contact => {
        toast({
          title: "Emergency Alert Sent",
          description: `Alert sent to ${contact.name}`,
        });
      });
    } else {
      toast({
        title: "Camera Access Failed",
        description: cameraError || "Unable to access camera",
        variant: "destructive",
      });
      // Still show SOS screen but without camera
      toast({
        title: "SOS Mode Active",
        description: "Operating without camera feed",
        variant: "default",
      });
    }
  };

  const deactivateSOS = () => {
    setIsSOSActive(false);
    setShowCamera(false);
    disableCamera();
    toast({
      title: "SOS Deactivated",
      description: "Emergency mode has been turned off",
    });
  };

  // Handle Safe Mode toggle
  const handleSafeModeToggle = async (checked: boolean) => {
    if (checked) {
      // Show initial toast with device-specific message
      toast({
        title: "Requesting Permissions",
        description: isIOS 
          ? "Please allow motion sensor access in the popup"
          : "Please allow motion sensor access when prompted",
      });

      try {
        // Request permission
        const hasShakePermission = await enableShake();
        
        if (hasShakePermission) {
          setIsSafeModeEnabled(true);
          toast({
            title: "Safe Mode Activated",
            description: "Shake phone twice quickly to activate SOS",
          });
        } else {
          setIsSafeModeEnabled(false);
          if (isIOS) {
            toast({
              title: "Permission Required",
              description: "Please enable motion sensors in iOS Settings > Safari > Motion & Orientation Access",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Permission Required",
              description: shakeError || "Motion sensor access is required for Safe Mode",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        setIsSafeModeEnabled(false);
        toast({
          title: "Error",
          description: "Failed to enable Safe Mode. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setIsSafeModeEnabled(false);
      disableShake();
      toast({
        title: "Safe Mode Deactivated",
        description: "SOS shake detection is now disabled",
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disableShake();
      disableCamera();
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewContact({ ...newContact, imageFile: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone || !newContact.relationship) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const contact: TrustedContact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship,
      imageFile: newContact.imageFile || "/assets/profiles/default-user.jpg",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newContact.name.toLowerCase()}`,
      distance: "calculating..."
    };

    setTrustedContacts([...trustedContacts, contact]);
    setNewContact({ name: "", phone: "", relationship: "", imageFile: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Trusted contact added successfully",
    });
  };

  // Draggable camera window
  const bind = useDrag(({ offset: [x, y] }) => {
    // This useDrag is for the camera window itself, not the video feed
    // The video feed is managed by useCamera hook
  });

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* User Profile Section */}
      <Card className="shadow-soft rounded-2xl border-0 bg-gradient-pink">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20 ring-4 ring-primary-light">
              <AvatarImage src="/assets/profiles/priya.jpeg" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                PS
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">Priya Sharma</h2>
              <p className="text-muted-foreground mb-2">priya.sharma@gmail.com</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="rounded-full">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  <MapPin className="w-3 h-3 mr-1" />
                  Mumbai, India
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  <Clock className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">24/7</p>
                  <p className="text-sm text-muted-foreground">Protected</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{trustedContacts.length}</p>
                  <p className="text-sm text-muted-foreground">Contacts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">Safe</p>
                  <p className="text-sm text-muted-foreground">Status</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trusted Contacts Section */}
      <Card className="shadow-soft rounded-2xl border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Trusted Contacts</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Add Trusted Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image">Profile Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      placeholder="e.g., Mother, Friend, Colleague"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                  <Button 
                    onClick={handleAddContact} 
                    className="w-full rounded-xl bg-gradient-primary hover:shadow-glow"
                  >
                    Add Contact
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trustedContacts.map((contact) => (
              <div 
                key={contact.id} 
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarImage src={contact.imageFile || contact.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {contact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  <p className="text-xs text-green-500">{contact.distance} away</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full h-8 w-8 p-0"
                  onClick={() => {
                    toast({
                      title: "Calling",
                      description: `Calling ${contact.name}...`,
                    });
                  }}
                >
                  <Phone className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-soft rounded-2xl border-0 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">Emergency SOS</h3>
                <p className="text-xs text-muted-foreground">Quick help</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft rounded-2xl border-0 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Share Location</h3>
                <p className="text-xs text-muted-foreground">Live tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft rounded-2xl border-0 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Call Police</h3>
                <p className="text-xs text-muted-foreground">100/112</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safe Mode Card */}
        <Card className="shadow-soft rounded-2xl border-0 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm md:text-base truncate">Safe Mode</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {!isMobile ? "Not available on desktop" :
                      isSafeModeEnabled 
                        ? "Active - Shake twice quickly for SOS" 
                        : shakeError 
                          ? "Permission needed"
                          : "Inactive"}
                  </p>
                </div>
              </div>
              <Switch
                checked={isSafeModeEnabled}
                onCheckedChange={handleSafeModeToggle}
                className="flex-shrink-0"
                disabled={!isMobile}
              />
            </div>
            {shakeError && !isSafeModeEnabled && (
              <p className="mt-2 text-xs text-red-500">{shakeError}</p>
            )}
            {!isMobile && (
              <p className="mt-2 text-xs text-muted-foreground">
                Safe Mode is only available on mobile devices
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nearby Infrastructure */}
      <Card className="shadow-soft rounded-2xl border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl font-bold">Nearby Infrastructure</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile View - Card Layout */}
          <div className="block md:hidden space-y-4">
            {nearbyInfrastructure.map((item) => (
              <Card key={item.id} className="border shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0 mr-4">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{item.address}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`
                        whitespace-nowrap flex-shrink-0
                        ${item.type === 'Police Station' && 'bg-blue-100 text-blue-800'}
                        ${item.type === 'Hospital' && 'bg-red-100 text-red-800'}
                        ${item.type === 'DLSA' && 'bg-purple-100 text-purple-800'}
                        ${item.type === 'Protection Officer' && 'bg-green-100 text-green-800'}
                        ${item.type === 'OSC' && 'bg-orange-100 text-orange-800'}
                      `}
                    >
                      {item.type}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    {item.timeToReach}
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => {
                        toast({
                          title: "Calling",
                          description: `Calling ${item.name}...`,
                        });
                        window.location.href = `tel:${item.phone}`;
                      }}
                    >
                      <Phone className="h-3 w-3 mr-2" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => {
                        toast({
                          title: "Opening Maps",
                          description: "Getting directions...",
                        });
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`, '_blank');
                      }}
                    >
                      <Navigation2 className="h-3 w-3 mr-2" />
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead className="w-[20%]">Type</TableHead>
                  <TableHead className="w-[20%]">Time</TableHead>
                  <TableHead className="w-[20%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nearbyInfrastructure.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="py-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.address}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge 
                        variant="secondary" 
                        className={`
                          whitespace-nowrap
                          ${item.type === 'Police Station' && 'bg-blue-100 text-blue-800'}
                          ${item.type === 'Hospital' && 'bg-red-100 text-red-800'}
                          ${item.type === 'DLSA' && 'bg-purple-100 text-purple-800'}
                          ${item.type === 'Protection Officer' && 'bg-green-100 text-green-800'}
                          ${item.type === 'OSC' && 'bg-orange-100 text-orange-800'}
                        `}
                      >
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        {item.timeToReach}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full h-8 w-8 p-0"
                          onClick={() => {
                            toast({
                              title: "Calling",
                              description: `Calling ${item.name}...`,
                            });
                            window.location.href = `tel:${item.phone}`;
                          }}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full h-8 w-8 p-0"
                          onClick={() => {
                            toast({
                              title: "Opening Maps",
                              description: "Getting directions...",
                            });
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`, '_blank');
                          }}
                        >
                          <Navigation2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* SOS Overlay */}
      <AnimatePresence>
        {isSOSActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-500/90 z-50 flex flex-col items-center justify-center"
          >
            <div className="text-white text-center space-y-4">
              <AlertTriangle className="h-16 w-16 mx-auto animate-pulse" />
              <h2 className="text-3xl font-bold">SOS ACTIVATED</h2>
              <p className="mb-4">Emergency contacts are being notified</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setIsSOSActive(false)}
                  className="w-full bg-white text-red-500"
                >
                  Hide Alert
                </Button>
                <Button
                  variant="outline"
                  onClick={deactivateSOS}
                  className="w-full bg-white text-red-500"
                >
                  End Emergency
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Window */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            drag
            dragMomentum={false}
            className="fixed bottom-4 right-4 w-64 rounded-lg overflow-hidden shadow-lg bg-black z-[100]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <div className="p-2 bg-gray-800 flex justify-between items-center">
              <span className="text-white text-sm">Camera Feed</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-white"
                onClick={() => setShowCamera(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/75 text-white p-4 text-center text-sm">
                  <p>{cameraError}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;