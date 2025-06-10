
import { useState, useEffect } from "react";
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
import { dataService } from "@/services/dataService";
import { realTimeNotificationService } from "@/services/realTimeNotificationService";
import { realTimeWeatherService } from "@/services/realTimeWeatherService";

const Index = () => {
  const [currentView, setCurrentView] = useState("landing");
  const [scheduleData, setScheduleData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [newFarmerData, setNewFarmerData] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check if user has any data (farms) to determine if they should see landing page
    const farms = dataService.getFarms();
    if (farms.length > 0) {
      setCurrentView("dashboard");
    }

    // Subscribe to notification updates
    const unsubscribe = realTimeNotificationService.subscribe((notifications) => {
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    });

    // Start real-time weather updates if farms exist
    if (farms.length > 0) {
      realTimeWeatherService.startRealTimeUpdates();
      
      // Generate some demo notifications for demonstration
      setTimeout(() => {
        realTimeNotificationService.generateDemoNotifications();
      }, 2000);
    }

    return () => {
      unsubscribe();
      realTimeWeatherService.stopRealTimeUpdates();
    };
  }, []);

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

  const handleGetStarted = () => {
    setCurrentView("register");
  };

  const handleLogin = () => {
    setCurrentView("dashboard");
  };

  // Render based on current view
  switch (currentView) {
    case "landing":
      return (
        <LandingPage 
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
        />
      );

    case "register":
      return <FarmerRegistration onBack={() => setCurrentView("landing")} />;
    
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
