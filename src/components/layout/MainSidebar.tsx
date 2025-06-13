
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, Users, Calendar, BarChart3, 
  Settings, Calculator, MessageCircle, Activity, 
  Database, FileText, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose
}) => {
  const navigationItems = [
    { label: "Dashboard", value: "dashboard", icon: Home },
    { label: "Farmers", value: "farmers", icon: Users },
    { label: "Schedules", value: "schedules", icon: Calendar },
    { label: "Analytics", value: "analytics", icon: BarChart3 },
    { label: "Reports", value: "reports", icon: FileText },
    { label: "Cost Calculator", value: "costs", icon: Calculator },
    { label: "Community", value: "community", icon: MessageCircle },
    { label: "Monitoring", value: "monitoring", icon: Activity },
    { label: "Data Management", value: "data-management", icon: Database },
    { label: "Settings", value: "settings", icon: Settings }
  ];

  const handleNavigation = (value: string) => {
    onNavigate(value);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:transform-none",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          <h2 className="font-semibold text-gray-900">Navigation</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.value}
                variant={currentView === item.value ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  currentView === item.value 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                )}
                onClick={() => handleNavigation(item.value)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default MainSidebar;
