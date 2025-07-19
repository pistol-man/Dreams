import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Phone, MapPin, Clock, Shield, Camera, X, AlertTriangle, Navigation2, Send, Hospital } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { useShake } from "@/hooks/use-shake";
import { useCamera } from "@/hooks/use-camera";
import { cn } from "@/lib/utils";
import { EmergencyAlarm } from "@/lib/utils";
import { generateResponse } from "@/lib/gemini";
import { franc } from "franc-min/index";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

// Robust language detection using franc-min
function mapFrancToSpeechLang(francCode: string): 'en-IN' | 'hi-IN' | 'mr-IN' {
  if (francCode === 'hin') return 'hi-IN';
  if (francCode === 'mar') return 'mr-IN';
  return 'en-IN';
}

const UserDashboard = () => {
  const { toast } = useToast();
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([
    {
      id: "1",
      name: "Mom",
      phone: "+919512464656", // Format: +[country_code][number] without spaces
      relationship: "Mother",
      imageFile: "/assets/profiles/mom.jpeg",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mom",
      distance: "12 mins"
    },
    {
      id: "2", 
      name: "Varun",
      phone: "+919324048833",
      relationship: "Friend",
      imageFile: "/assets/profiles/varun.jpeg",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dad",
      distance: "20 mins"
    },
    {
      id: "3",
      name: "Rhea",
      phone: "+919512464656",
      relationship: "Sister",
      imageFile: "/assets/profiles/rhea.jpeg",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sister",
      distance: "5 mins"
    },
    {
      id: "4",
      name: "Vedant",
      phone: "+917977895844",
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
  const [transcript, setTranscript] = useState(""); // Only for interim display
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef(""); // NEW: accumulate transcript
  const [isSpeaking, setIsSpeaking] = useState(false); // NEW: for voice activity
  const [speechError, setSpeechError] = useState(""); // NEW: for error feedback
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null); // NEW: for no speech detection
  const [fullTranscript, setFullTranscript] = useState(""); // NEW: store all session text
  // Threat analysis state
  const [threatLevel, setThreatLevel] = useState<number | null>(null);
  const [threatType, setThreatType] = useState<string>("");
  const [threatAction, setThreatAction] = useState<string>("");
  const [currentLang, setCurrentLang] = useState<'en-IN' | 'hi-IN' | 'mr-IN'>('en-IN');
  // Language auto-detection: no manual selection

  const { enableCamera, disableCamera, videoRef, error: cameraError, stream } = useCamera();
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

  // Real-time threat classification logic
  function classifyThreat(text: string) {
    const lower = text.toLowerCase();
    if (/kill|killing|murder|beating|assault|stab|gun|knife|shoot|rape|molest/.test(lower)) {
      setThreatLevel(10);
      setThreatType("Violent Crime / Life Threatening");
      setThreatAction("Police force notified and dispatched to your location.");
    } else if (/follow|following|stalking|chasing|harass|threaten|danger|unsafe|scared|help/.test(lower)) {
      setThreatLevel(8);
      setThreatType("Immediate Threat / Pursuit");
      setThreatAction("Ping sent to nearest police vehicle.");
    } else if (/counsel|counseling|consult|consulting|talk|mental|stress|depress|anxiety|support|listen/.test(lower)) {
      setThreatLevel(3);
      setThreatType("Counseling / Non-urgent Support");
      setThreatAction("Nearby POC or counseling service is being pinged.");
    } else if (lower.trim().length > 0) {
      setThreatLevel(5);
      setThreatType("General Distress");
      setThreatAction("Monitoring situation. Please provide more details if possible.");
    } else {
      setThreatLevel(null);
      setThreatType("");
      setThreatAction("");
    }
  }

  // Run threat classification in real time as transcript updates
  useEffect(() => {
    if (isSOSActive && fullTranscript.trim().length > 0) {
      classifyThreat(fullTranscript);
    } else {
      setThreatLevel(null);
      setThreatType("");
      setThreatAction("");
    }
  }, [fullTranscript, isSOSActive]);

  const activateSOS = async () => {
    setIsSOSActive(true);
    transcriptRef.current = ""; // Reset transcript
    setTranscript("");
    setFullTranscript(""); // Only clear at start
    setIsSpeaking(false);
    setSpeechError("");
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    setThreatLevel(null);
    setThreatType("");
    setThreatAction("");
    setCurrentLang('en-IN'); // Start with English
    setShowCamera(false); // Always re-enable camera

    // Start the alarm sound
    EmergencyAlarm.start();

    // Request camera access
    toast({
      title: "Activating Camera",
      description: "Please allow camera access when prompted",
    });

    try {
      const hasCameraAccess = await enableCamera();
      
      if (hasCameraAccess) {
        setShowCamera(true);
        toast({
          title: "Camera Active",
          description: "Live feed enabled for emergency recording",
        });
      } else {
        toast({
          title: "Camera Access Failed",
          description: cameraError || "Unable to access camera",
          variant: "destructive",
        });
        toast({
          title: "SOS Mode Active",
          description: "Operating without camera feed",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Camera initialization error:", error);
      toast({
        title: "Camera Error",
        description: "Failed to initialize camera",
        variant: "destructive",
      });
    }

    // Start speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      let recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = currentLang;
      let lastTranscript = "";
      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let hasSpeech = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcriptRef.current += event.results[i][0].transcript;
            hasSpeech = true;
          } else {
            interimTranscript += event.results[i][0].transcript;
            if (event.results[i][0].transcript.trim() !== "") hasSpeech = true;
          }
        }
        // Always accumulate and show the full transcript
        const sessionText = transcriptRef.current + interimTranscript;
        setTranscript(interimTranscript); // Only interim
        setFullTranscript(transcriptRef.current); // Always full, never clear except at SOS start/end
        setIsSpeaking(hasSpeech);
        lastTranscript = sessionText;
        if (hasSpeech && speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        // Robust language detection using franc-min
        const francCode = franc(sessionText, { minLength: 3 });
        const detected = mapFrancToSpeechLang(francCode);
        if (detected !== currentLang) {
          setCurrentLang(detected);
          recognition.stop();
          // Restart recognition with new language
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.onend = null;
              recognitionRef.current.stop();
              recognitionRef.current = null;
            }
            const newRec = new SpeechRecognition();
            newRec.continuous = true;
            newRec.interimResults = true;
            newRec.lang = detected;
            newRec.onresult = recognition.onresult;
            newRec.onspeechstart = recognition.onspeechstart;
            newRec.onspeechend = recognition.onspeechend;
            newRec.onerror = recognition.onerror;
            newRec.onend = recognition.onend;
            recognitionRef.current = newRec;
            newRec.start();
          }, 200);
        }
      };
      recognition.onspeechstart = () => {
        setIsSpeaking(true);
        if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      };
      recognition.onspeechend = () => setIsSpeaking(false);
      recognition.onerror = (event: any) => {
        setIsSpeaking(false);
        setSpeechError(event.error || "Speech recognition error");
        toast({
          title: "Speech Recognition Error",
          description: event.error === 'not-allowed' ? "Microphone permission denied. Please allow access in your browser settings." : (event.error || "Speech recognition error occurred."),
          variant: "destructive",
          duration: 8000,
        });
        console.error("SpeechRecognition error:", event);
        // Always robustly restart if SOS is active, including on 'aborted'
        if (isSOSActive) {
          try { recognition.stop(); recognition.start(); } catch (e) { /* ignore */ }
        }
      };
      recognition.onend = () => {
        setIsSpeaking(false);
        // Always robustly restart if SOS is active
        if (isSOSActive) {
          try { recognition.start(); } catch (e) { /* ignore */ }
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
      // If no speech detected in 5 seconds, show a toast
      speechTimeoutRef.current = setTimeout(() => {
        if (!isSpeaking) {
          setSpeechError("No speech detected. Please check your microphone and permissions.");
          toast({
            title: "No Speech Detected",
            description: "Please check your microphone and browser permissions.",
            variant: "destructive",
            duration: 8000,
          });
        }
      }, 5000);
    } else {
      setTranscript("Speech recognition not supported in this browser.");
      setIsSpeaking(false);
      setSpeechError("Speech recognition not supported in this browser.");
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support the Web Speech API. Please use Chrome or Edge.",
        variant: "destructive",
        duration: 8000,
      });
    }

    // Notify emergency contacts
    trustedContacts.forEach(contact => {
      toast({
        title: "Emergency Alert Sent",
        description: `Alert sent to ${contact.name}`,
      });
    });

    // Simulate emergency service notifications
    toast({
      title: "Alert Sent to 181",
      description: "Women's Helpline has been notified",
    });

    toast({
      title: "Police Notified",
      description: "Nearest police station has been alerted",
    });

    toast({
      title: "Medical Alert",
      description: "Nearest hospital has been notified",
    });
  };

  const analyzeDistress = async (text: string) => {
    if (!text.trim()) return;
    // setAnalysisResult("Analyzing..."); // Removed Gemini API call
    try {
      // const prompt = `You are an emergency assistant. Analyze the following transcript of a distress call.\n\nTranscript:\n"""${text}"""\n\n1. What is the likely type of distress (e.g., physical assault, harassment, medical emergency, lost, panic, etc.)?\n2. How urgent is the situation? (High/Medium/Low)\n3. Give a one-sentence summary of the situation.\n\nRespond in this format:\nType: <type>\nUrgency: <urgency>\nSummary: <summary>`;
      // const result = await generateResponse([
      //   { role: "user", content: prompt }
      // ]);
      // setAnalysisResult(result);
    } catch (err) {
      // setAnalysisResult("Analysis failed. Please try again.");
    }
  };

  const deactivateSOS = () => {
    setIsSOSActive(false);
    setShowCamera(false);
    disableCamera();
    // Stop the alarm sound
    EmergencyAlarm.stop();
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    transcriptRef.current = "";
    setTranscript("");
    setIsSpeaking(false);
    setSpeechError("");
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    setFullTranscript(""); // Only clear at end
    setThreatLevel(null);
    setThreatType("");
    setThreatAction("");
    toast({
      title: "SOS Deactivated",
      description: "Emergency mode has been turned off",
    });
  };

  // Handle Safe Mode toggle
  const handleSafeModeToggle = async (checked: boolean) => {
    if (checked) {
      if (!isMobile) {
        toast({
          title: "Not Available",
          description: "Safe Mode is only available on mobile devices",
          variant: "destructive",
        });
        return;
      }

      // Show initial toast with device-specific message
      toast({
        title: "Requesting Permissions",
        description: isIOS 
          ? "Please allow sensor access in the popup"
          : "Please ensure motion sensors are enabled",
        duration: 5000,
      });

      try {
        // Request permission
        const hasShakePermission = await enableShake();
        
        if (hasShakePermission) {
          setIsSafeModeEnabled(true);
          toast({
            title: "Safe Mode Activated",
            description: "Shake phone twice quickly to trigger SOS",
            duration: 5000,
          });

          // Add visual feedback for shake detection
          const existingBadge = document.getElementById('shake-alert');
          if (!existingBadge) {
            const alertBadge = document.createElement('div');
            alertBadge.id = 'shake-alert';
            alertBadge.style.cssText = `
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(220, 38, 38, 0.9);
              color: white;
              padding: 12px 24px;
              border-radius: 50px;
              font-size: 14px;
              font-weight: 500;
              z-index: 1000;
              display: none;
              transition: all 0.3s ease;
              opacity: 0;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            `;
            alertBadge.textContent = 'First Shake Detected! Shake Again for SOS';
            document.body.appendChild(alertBadge);
          }
        } else {
          setIsSafeModeEnabled(false);
          if (isIOS) {
            toast({
              title: "Permission Required",
              description: "Please enable motion & orientation access in iOS Settings > Safari",
              variant: "destructive",
              duration: 7000,
            });
          } else {
            const errorMsg = shakeError || "Please check your device's motion sensor settings";
            toast({
              title: "Sensor Access Required",
              description: errorMsg,
              variant: "destructive",
              duration: 7000,
            });
          }
        }
      } catch (error) {
        setIsSafeModeEnabled(false);
        const errorMessage = error instanceof Error ? error.message : "Failed to enable Safe Mode";
        
        // Show a more detailed error message with instructions
        toast({
          title: "Sensor Access Error",
          description: `${errorMessage}. Please ensure:
            ${isIOS 
              ? "1. You're using Safari browser\n2. Motion & Orientation Access is enabled in Safari settings" 
              : "1. Motion sensors are enabled in device settings\n2. The website has permission to access sensors"}`,
          variant: "destructive",
          duration: 10000,
        });
      }
    } else {
      setIsSafeModeEnabled(false);
      disableShake();
      
      // Remove visual feedback element with animation
      const alertBadge = document.getElementById('shake-alert');
      if (alertBadge) {
        alertBadge.style.opacity = '0';
        alertBadge.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => alertBadge.remove(), 300);
      }

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
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      transcriptRef.current = "";
      setIsSpeaking(false);
      setSpeechError("");
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      const alertBadge = document.getElementById('shake-alert');
      if (alertBadge) {
        alertBadge.remove();
      }
    };
  }, [disableShake, disableCamera]);

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

  // Function to handle phone calls
  const handleCall = (contact: TrustedContact) => {
    // Format phone number for tel protocol
    const formattedPhone = contact.phone.replace(/\s+/g, '');
    
    // Attempt to initiate the call
    try {
      window.location.href = `tel:${formattedPhone}`;
      toast({
        title: "Initiating Call",
        description: `Calling ${contact.name} at ${contact.phone}`,
      });
    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: "Call Failed",
        description: "Unable to initiate call. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* User Profile Section */}
      <Card className="shadow-soft rounded-2xl border-0 bg-gradient-blue">
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
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      pattern="^\+[1-9]\d{1,14}$"
                      value={newContact.phone}
                      onChange={(e) => {
                        // Remove any non-digit characters except +
                        const value = e.target.value.replace(/[^\d+]/g, '');
                        setNewContact({...newContact, phone: value});
                      }}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: +[country code][number] (e.g., +919876543210)
                    </p>
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
            {trustedContacts.map((contact, index) => (
              <div 
                key={contact.id} 
                className={cn(
                  "relative overflow-hidden group",
                  "bg-gradient-to-br from-background to-accent/10",
                  "p-4 rounded-xl transition-all duration-300",
                  "hover:shadow-md hover:scale-[1.02]",
                  "border border-border/50",
                  index === 0 && "from-pink-50 to-pink-100/50 dark:from-pink-950/20 dark:to-pink-900/10",
                  index === 1 && "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
                  index === 2 && "from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
                  index === 3 && "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10"
                )}
              >
                {/* Call Button - Absolute positioned */}
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "absolute top-3 right-3 h-7 w-7 rounded-full opacity-0 translate-y-1",
                    "group-hover:opacity-100 group-hover:translate-y-0",
                    "transition-all duration-300",
                    index === 0 && "text-pink-600 hover:text-pink-700 hover:bg-pink-100/50",
                    index === 1 && "text-blue-600 hover:text-blue-700 hover:bg-blue-100/50",
                    index === 2 && "text-purple-600 hover:text-purple-700 hover:bg-purple-100/50",
                    index === 3 && "text-green-600 hover:text-green-700 hover:bg-green-100/50"
                  )}
                  onClick={() => handleCall(contact)}
                >
                  <Phone className="h-4 w-4" />
                </Button>

                <div className="flex items-start space-x-4">
                  <Avatar className={cn(
                    "h-12 w-12 ring-2 ring-primary/20",
                    index === 0 && "ring-pink-500/30",
                    index === 1 && "ring-blue-500/30",
                    index === 2 && "ring-purple-500/30",
                    index === 3 && "ring-green-500/30"
                  )}>
                    <AvatarImage src={contact.imageFile || contact.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {contact.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{contact.name}</p>
                      {index === 0 && (
                        <Badge variant="secondary" className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 text-[10px]">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{contact.relationship}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{contact.phone}</p>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "mt-1.5 text-[10px]",
                        index === 0 && "bg-pink-100 text-pink-700 dark:bg-pink-900/30",
                        index === 1 && "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
                        index === 2 && "bg-purple-100 text-purple-700 dark:bg-purple-900/30",
                        index === 3 && "bg-green-100 text-green-700 dark:bg-green-900/30"
                      )}
                    >
                      {contact.distance} away
                    </Badge>
                  </div>
                </div>

                {/* Mobile Call Button - Only visible on touch devices */}
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "w-full mt-3 rounded-lg md:hidden",
                    "border border-border/50",
                    index === 0 && "text-pink-600 hover:text-pink-700 hover:bg-pink-100/50",
                    index === 1 && "text-blue-600 hover:text-blue-700 hover:bg-blue-100/50",
                    index === 2 && "text-purple-600 hover:text-purple-700 hover:bg-purple-100/50",
                    index === 3 && "text-green-600 hover:text-green-700 hover:bg-green-100/50"
                  )}
                  onClick={() => handleCall(contact)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call {contact.name}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card 
          className="shadow-soft rounded-2xl border-0 hover:shadow-glow transition-all duration-300 cursor-pointer bg-red-50"
          onClick={activateSOS}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm md:text-base truncate text-red-700">Emergency SOS</h3>
                <p className="text-xs text-red-600">Tap to activate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft rounded-2xl border-0 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm md:text-base truncate">Share Location</h3>
                <p className="text-xs text-muted-foreground">Live tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft rounded-2xl border-0 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm md:text-base truncate">Call Police</h3>
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
            className="fixed inset-0 bg-red-500/90 z-50 flex flex-col items-center justify-center p-4"
          >
            <div className="w-full max-w-md text-white text-center space-y-6">
              <AlertTriangle className="h-16 w-16 mx-auto animate-pulse" />
              <h2 className="text-3xl font-bold">SOS ACTIVATED</h2>
              <p className="text-lg mb-4">Emergency services have been notified</p>
              {/* Auto language detection note */}
              <div className="mb-2 text-xs text-white font-semibold">Language will be auto-detected (English, Hindi, Marathi). Detected: {currentLang}</div>
              {/* Live Transcript Section */}
              <div className="bg-black/60 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto text-left relative">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  Live Transcript:
                  {/* Voice Recording Indicator */}
                  <span className="ml-2">
                    {isSpeaking ? (
                      <span className="inline-flex items-center">
                        <svg className="animate-pulse h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a2 2 0 00-2 2v6a2 2 0 104 0V4a2 2 0 00-2-2zm-6 8a1 1 0 011 1v1a7 7 0 0014 0v-1a1 1 0 112 0v1a9 9 0 01-18 0v-1a1 1 0 012 0z" />
                        </svg>
                        <span className="ml-1 text-green-400 text-xs font-semibold animate-pulse">Listening...</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a2 2 0 00-2 2v6a2 2 0 104 0V4a2 2 0 00-2-2zm-6 8a1 1 0 011 1v1a7 7 0 0014 0v-1a1 1 0 112 0v1a9 9 0 01-18 0v-1a1 1 0 012 0z" />
                        </svg>
                        <span className="ml-1 text-gray-400 text-xs font-semibold">Silent</span>
                      </span>
                    )}
                  </span>
                </h4>
                <p className="whitespace-pre-line text-white text-sm min-h-[2rem]">{transcript || "Say something..."}</p>
                {speechError && (
                  <div className="mt-2 text-xs text-red-400 font-semibold">{speechError}</div>
                )}
              </div>
              {/* Full Session Transcript Section */}
              {fullTranscript && (
                <div className="bg-black/40 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto text-left">
                  <h4 className="font-semibold text-white mb-1">Full Session Transcript:</h4>
                  <p className="whitespace-pre-line text-white text-xs">{fullTranscript}</p>
                </div>
              )}
              {/* Real-time Threat Analysis */}
              {isSOSActive && threatLevel !== null && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-3 rounded mb-4">
                  <h4 className="font-semibold mb-1">Threat Level: <span className={threatLevel >= 8 ? 'text-red-600' : threatLevel >= 5 ? 'text-orange-600' : 'text-green-600'}>{threatLevel}/10</span></h4>
                  <div className="mb-1 font-semibold">Type: {threatType}</div>
                  <div className="mb-1">{threatAction}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button
                  variant="outline"
                  className="bg-white text-red-500 hover:bg-red-50"
                  onClick={() => {
                    window.open(`https://www.google.com/maps/search/police+station+near+me`, '_blank');
                  }}
                >
                  <Navigation2 className="h-4 w-4 mr-2" />
                  Nearest Police
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-red-500 hover:bg-red-50"
                  onClick={() => {
                    window.open(`https://www.google.com/maps/search/hospital+near+me`, '_blank');
                  }}
                >
                  <Hospital className="h-4 w-4 mr-2" />
                  Nearest Hospital
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-red-500 hover:bg-red-50"
                  onClick={() => {
                    window.location.href = `tel:181`;
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call 181
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-red-500 hover:bg-red-50"
                  onClick={() => {
                    window.location.href = `tel:112`;
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call 112
                </Button>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setIsSOSActive(false)}
                  className="w-full bg-white text-red-500 hover:bg-red-50"
                >
                  Hide Alert
                </Button>
                <Button
                  variant="outline"
                  onClick={deactivateSOS}
                  className="w-full bg-white text-red-500 hover:bg-red-50"
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
            dragConstraints={{ top: 0, left: 0, right: window.innerWidth - 300, bottom: window.innerHeight - 200 }}
            style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 100 }}
            className="w-64 rounded-lg overflow-hidden shadow-lg bg-black"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <div className="p-2 bg-gray-800 flex justify-between items-center">
              <span className="text-white text-sm flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                Live Camera
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-gray-700"
                onClick={() => {
                  setShowCamera(false);
                  disableCamera();
                }}
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
                  <AlertTriangle className="w-6 h-6 mb-2" />
                  <p>{cameraError}</p>
                </div>
              )}
              {!cameraError && !stream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
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