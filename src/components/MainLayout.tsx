
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Droplets, Home, MapPin, Users, Calendar, BarChart3, 
  Settings, Bell, FileText, Calculator, MessageCircle, 
  UserCheck, Activity, Database, Globe, User, LogOut, Menu
} from 'lucide-react';
import Dashboard from './Dashboard';
import FarmerRegistration from './FarmerRegistration';
import NotificationCenter from './NotificationCenter';
import ScheduleManagement from './ScheduleManagement';
import AdvancedAnalytics from './AdvancedAnalytics';
import DataExportImport from './DataExportImport';
import CostCalculator from './CostCalculator';
import CommunitySharing from './CommunitySharing';
import ExtensionOfficerDashboard from './ExtensionOfficerDashboard';
import SoilMoistureTracker from './SoilMoistureTracker';
import SettingsPage from './SettingsPage';

interface MainLayoutProps {
  unreadNotifications?: number;
}

const MainLayout: React.FC<MainLayoutProps> = ({ unreadNotifications = 0 }) => {
  const { user, profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'farms':
        return <FarmerRegistration onBack={() => setCurrentView('dashboard')} />;
      case 'schedules':
        return <ScheduleManagement onBack={() => setCurrentView('dashboard')} onCreateSchedule={() => {}} />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'data-management':
        return <DataExportImport onBack={() => setCurrentView('dashboard')} />;
      case 'costs':
        return <CostCalculator farmId="default-farm" />;
      case 'community':
        return <CommunitySharing />;
      case 'extension':
        return <ExtensionOfficerDashboard />;
      case 'monitoring':
        return <SoilMoistureTracker farmId="default-farm" />;
      case 'settings':
        return <SettingsPage onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-2 rounded-lg shadow-md">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">AquaWise</h1>
              <p className="text-xs text-gray-600">Homa Bay County</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-2">
            {navigationItems.slice(0, 6).map((item) => (
              <Button
                key={item.value}
                variant={currentView === item.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView(item.value)}
                className={currentView === item.value 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }
              >
                <item.icon className="h-4 w-4 mr-2" />
                <span className="hidden xl:inline">{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(true)}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">EN</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Kiswahili</DropdownMenuItem>
                <DropdownMenuItem>Dholuo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={profile?.name || 'User'} />
                    <AvatarFallback>
                      {profile?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium">{profile?.name || 'User'}</span>
                    <span className="text-xs text-gray-500">Farmer</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCurrentView('settings')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowMobileNav(!showMobileNav)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileNav && (
          <div className="lg:hidden border-t bg-white">
            <div className="px-4 py-2 space-y-1 max-h-96 overflow-y-auto">
              {navigationItems.map((item) => (
                <Button
                  key={item.value}
                  variant={currentView === item.value ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    currentView === item.value 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                  onClick={() => {
                    setCurrentView(item.value);
                    setShowMobileNav(false);
                  }}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
};

export default MainLayout;
