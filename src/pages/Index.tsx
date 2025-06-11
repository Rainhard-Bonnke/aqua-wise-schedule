
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/components/auth/AuthPage";
import Dashboard from "@/components/Dashboard";
import FarmerRegistration from "@/components/FarmerRegistration";
import WelcomeFarmer from "@/components/WelcomeFarmer";
import ScheduleForm from "@/components/ScheduleForm";
import ScheduleDisplay from "@/components/ScheduleDisplay";
import WeatherSettings from "@/components/WeatherSettings";
import SettingsPage from "@/components/SettingsPage";
import ScheduleManagement from "@/components/ScheduleManagement";
import EnhancedDataExportImport from "@/components/EnhancedDataExportImport";
import LandingPage from "@/components/LandingPage";
import NotificationCenter from "@/components/NotificationCenter";
import { supabaseDataService } from "@/services/supabaseDataService";
import { realTimeNotificationService } from "@/services/realTimeNotificationService";
import { realTimeWeatherService } from "@/services/realTimeWeatherService";

const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState("landing");
  const [scheduleData, setScheduleData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [newFarmerData, setNewFarmerData] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasCheckedFarms, setHasCheckedFarms] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setCurrentView("landing");
      return;
    }

    // Check if user has any farms to determine initial view
    const checkUserFarms = async () => {
      try {
        const farms = await supabaseDataService.getFarms();
        if (farms.length > 0) {
          setCurrentView("dashboard");
        } else {
          setCurrentView("register");
        }
        setHasCheckedFarms(true);
      } catch (error) {
        console.error("Error checking farms:", error);
        setCurrentView("register");
        setHasCheckedFarms(true);
      }
    };

    if (!hasCheckedFarms) {
      checkUserFarms();
    }

    // Subscribe to notification updates
    const unsubscribe = realTimeNotificationService.subscribe((notifications) => {
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    });

    // Start real-time weather updates if user is authenticated
    realTimeWeatherService.startRealTimeUpdates();
    
    // Generate some demo notifications for demonstration
    setTimeout(() => {
      realTimeNotificationService.generateDemoNotifications();
    }, 2000);

    return () => {
      unsubscribe();
      realTimeWeatherService.stopRealTimeUpdates();
    };
  }, [user, loading, hasCheckedFarms]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication page if user is not logged in
  if (!user) {
    if (currentView === "landing") {
      return (
        <LandingPage 
          onGetStarted={() => setCurrentView("auth")}
          onLogin={() => setCurrentView("auth")}
        />
      );
    }
    return <AuthPage />;
  }

  const handleNavigation = (view: string, data?: any) => {
    setCurrentView(view);
    setViewData(data);
  };

  const handleScheduleGenerated = (data: any) => {
    setScheduleData(data);
    setCurrentView("schedule");
  };

  const handleBack = () => {
    setCurrentView("dashboard");
    setViewData(null);
  };

  const handleFarmerRegistered = (farmerData: any) => {
    setNewFarmerData(farmerData);
    setCurrentView("welcome-farmer");
  };

  const handleWelcomeComplete = () => {
    setNewFarmerData(null);
    setCurrentView("dashboard");
  };

  // Render based on current view
  switch (currentView) {
    case "register":
      return <FarmerRegistration onBack={() => setCurrentView("dashboard")} />;
    
    case "welcome-farmer":
      return newFarmerData ? (
        <WelcomeFarmer 
          farmerData={newFarmerData} 
          onContinue={handleWelcomeComplete}
        />
      ) : (
        <Dashboard 
          onNavigate={handleNavigation}
          unreadNotifications={unreadCount}
          onShowNotifications={() => setShowNotifications(true)}
        />
      );
    
    case "schedule-form":
    case "create-schedule":
      return <ScheduleForm onScheduleGenerated={handleScheduleGenerated} onBack={handleBack} />;
    
    case "schedule":
      return <ScheduleDisplay scheduleData={scheduleData} onBack={handleBack} />;
    
    case "weather-settings":
      return <WeatherSettings onBack={handleBack} />;
    
    case "settings":
      return <SettingsPage onBack={handleBack} />;
    
    case "schedules":
      return (
        <ScheduleManagement 
          onBack={handleBack} 
          onCreateSchedule={() => setCurrentView("create-schedule")}
        />
      );
    
    case "add-farm":
      return <FarmerRegistration onBack={handleBack} />;

    case "data-management":
      return <EnhancedDataExportImport onBack={handleBack} />;
    
    case "dashboard":
    default:
      return (
        <>
          <Dashboard 
            onNavigate={handleNavigation}
            unreadNotifications={unreadCount}
            onShowNotifications={() => setShowNotifications(true)}
          />
          <NotificationCenter 
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </>
      );
  }
};

export default Index;
