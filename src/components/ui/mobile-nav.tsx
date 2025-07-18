"use client";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Map, Shield, Users, MessageCircle } from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: Home, link: "/user" },
  { name: "Map", icon: Map, link: "/user/map" },
  { name: "SOS", icon: Shield, link: "/user/sos" },
  { name: "Alerts", icon: MessageCircle, link: "/user/alerts" },
  { name: "Community", icon: Users, link: "/user/community" },
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.link;
          
          return (
            <Link
              key={item.name}
              to={item.link}
              className={cn(
                "flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-glow" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};