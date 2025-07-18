import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Phone, MapPin, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  avatar?: string;
}

const UserDashboard = () => {
  const { toast } = useToast();
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([
    {
      id: "1",
      name: "Mom",
      phone: "+91 9876543210",
      relationship: "Mother",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mom"
    },
    {
      id: "2", 
      name: "Dad",
      phone: "+91 9876543211",
      relationship: "Father",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dad"
    },
    {
      id: "3",
      name: "Sister",
      phone: "+91 9876543212", 
      relationship: "Sister",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sister"
    },
    {
      id: "4",
      name: "Best Friend",
      phone: "+91 9876543213",
      relationship: "Friend",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bestfriend"
    }
  ]);

  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relationship: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newContact.name.toLowerCase()}`
    };

    setTrustedContacts([...trustedContacts, contact]);
    setNewContact({ name: "", phone: "", relationship: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Trusted contact added successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <Card className="shadow-soft rounded-2xl border-0 bg-gradient-pink">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20 ring-4 ring-primary-light">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                VV
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">Priya Sharma</h2>
              <p className="text-muted-foreground mb-2">priya.sharma@email.com</p>
              
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trustedContacts.map((contact) => (
              <div 
                key={contact.id} 
                className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {contact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-sm font-medium truncate w-full">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.relationship}</p>
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
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold mb-1">Emergency SOS</h3>
            <p className="text-sm text-muted-foreground">Quick help</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft rounded-2xl border-0 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1">Share Location</h3>
            <p className="text-sm text-muted-foreground">Live tracking</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft rounded-2xl border-0 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">Call Police</h3>
            <p className="text-sm text-muted-foreground">100/112</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft rounded-2xl border-0 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">Safe Mode</h3>
            <p className="text-sm text-muted-foreground">Activate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;