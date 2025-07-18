import React from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { Home, LogIn, User, Shield, Mail } from "lucide-react";

const navItems = [
  {
    name: "Home",
    link: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    name: "Login",
    link: "/login",
    icon: <LogIn className="h-4 w-4" />,
  },
  {
    name: "User",
    link: "/user",
    icon: <User className="h-4 w-4" />,
  },
  {
    name: "Admin",
    link: "/admin",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    name: "Contact",
    link: "/contact",
    icon: <Mail className="h-4 w-4" />,
  },
];

const Landing = () => {
  return (
    <main className="min-h-screen bg-gradient-subtle">
      <FloatingNav navItems={navItems} />
      
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Suraksha
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Your trusted companion for safety and security
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex items-center justify-center space-x-8 mt-12">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse" />
            <div className="w-12 h-12 bg-primary/30 rounded-full animate-pulse delay-75" />
            <div className="w-20 h-20 bg-primary/10 rounded-full animate-pulse delay-150" />
          </div>
        </div>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
    </main>
  );
};

export default Landing;