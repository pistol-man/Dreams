"use client";
import React from "react";
import { LayoutDashboard, Map, LineChart, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  const routes = isAdmin ? [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
    },
    {
      label: "Map",
      icon: Map,
      href: "/admin/map",
    },
    {
      label: "Predictions",
      icon: LineChart,
      href: "/admin/predictions",
    }
  ] : [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/user",
    },
    {
      label: "Map",
      icon: Map,
      href: "/user/map",
    },
    {
      label: "Info",
      icon: Shield,
      href: "/user/info",
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around p-2">
        {routes.map((route) => (
          <a
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground",
              window.location.pathname === route.href && "text-foreground"
            )}
          >
            <route.icon className="h-5 w-5" />
            <span className="text-xs">{route.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}