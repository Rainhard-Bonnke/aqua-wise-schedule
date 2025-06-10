
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Droplets, Home, MapPin, Users, Calendar, BarChart3, 
  Settings, Bell, FileText, Calculator, MessageCircle, 
  UserCheck, Activity, Database, Globe, User, LogOut, 
  ChevronLeft, ChevronRight, Menu
} from "lucide-react";

interface AppSidebarProps {
  onNavigate: (view: string) => void;
  currentUser?: string;
  unreadNotifications?: number;
  onShowNotifications?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AppSidebar = ({ 
  onNavigate, 
  currentUser = "Admin User", 
  unreadNotifications = 0, 
  onShowNotifications,
  collapsed = false,
  onToggleCollapse
}: AppSidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationItems = [
    { label: "Dashboard", value: "dashboard", icon: Home },
    { label: "Farms", value: "farms", icon: MapPin },
    { label: "Farmers", value: "farmers", icon: Users },
    { label: "Schedules", value: "schedules", icon: Calendar },
    { label: "Analytics", value: "analytics", icon: BarChart3 },
    { label: "Reports", value: "reports", icon: FileText },
    { label: "Cost Calculator", value: "costs", icon: Calculator },
    { label: "Community", value: "community", icon: MessageCircle },
    { label: "Extension Officers", value: "extension", icon: UserCheck },
    { label: "Soil Monitoring", value: "monitoring", icon: Activity },
    { label: "Data Management", value: "data-management", icon: Database },
    { label: "Settings", value: "settings", icon: Settings }
  ];

  const isActive = (value: string) => {
    if (value === "dashboard" && currentPath === "/") return true;
    return currentPath.includes(value);
  };

  return (
    <div className={`bg-white shadow-lg border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-2 rounded-lg shadow-md">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">AquaWise</h1>
                <p className="text-xs text-gray-600 truncate">Homa Bay County</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.value}
              variant={isActive(item.value) ? "default" : "ghost"}
              className={`w-full justify-start text-left ${collapsed ? 'px-2' : 'px-4'} ${
                isActive(item.value) 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
              onClick={() => onNavigate(item.value)}
            >
              <item.icon className={`h-4 w-4 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className={`w-full justify-start mb-2 ${collapsed ? 'px-2' : 'px-4'}`}>
              <Globe className={`h-4 w-4 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!collapsed && <span>EN</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right">
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>Kiswahili</DropdownMenuItem>
            <DropdownMenuItem>Dholuo</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowNotifications}
          className={`w-full justify-start relative mb-2 ${collapsed ? 'px-2' : 'px-4'}`}
        >
          <Bell className={`h-4 w-4 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
          {!collapsed && <span>Notifications</span>}
          {unreadNotifications > 0 && (
            <Badge 
              variant="destructive" 
              className={`absolute h-5 w-5 flex items-center justify-center text-xs ${
                collapsed ? 'top-1 right-1' : 'top-1 right-2'
              }`}
            >
              {unreadNotifications}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`w-full justify-start ${collapsed ? 'px-2' : 'px-4'}`}>
              <Avatar className="h-6 w-6 mr-3 flex-shrink-0">
                <AvatarImage src="/placeholder-avatar.jpg" alt={currentUser} />
                <AvatarFallback>AU</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">{currentUser}</span>
                  <span className="text-xs text-gray-500 truncate">Administrator</span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  County Administrator
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate("profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate("settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AppSidebar;
