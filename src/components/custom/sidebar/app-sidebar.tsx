import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Map, Shield, Users, MessageCircle, Settings } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/user",
    icon: Home,
  },
  {
    title: "Map",
    url: "/user/map",
    icon: Map,
  },
  {
    title: "SOS",
    url: "/user/sos",
    icon: Shield,
  },
  {
    title: "Alerts",
    url: "/user/alerts",
    icon: MessageCircle,
  },
  {
    title: "Community",
    url: "/user/community",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/user/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarHeader className="border-b border-border p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-xl font-bold text-foreground">Suraksha</h2>
              <p className="text-sm text-muted-foreground">Safety First</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="rounded-xl"
                    >
                      <Link to={item.url} className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}