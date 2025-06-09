
import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import FarmerRegistration from "@/components/FarmerRegistration";
import WelcomeFarmer from "@/components/WelcomeFarmer";
import ScheduleForm from "@/components/ScheduleForm";
import ScheduleDisplay from "@/components/ScheduleDisplay";
import WeatherSettings from "@/components/WeatherSettings";
import LandingPage from "@/components/LandingPage";
import DataExportImport from "@/components/DataExportImport";
import NotificationCenter from "@/components/NotificationCenter";
import { dataService } from "@/services/dataService";
import { realTimeNotificationService } from "@/services/realTimeNotificationService";

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

    // Generate some demo notifications for demonstration
    if (farms.length > 0) {
      setTimeout(() => {
        realTimeNotificationService.generateDemoNotifications();
      }, 2000);
    }

    return unsubscribe;
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
    
    case "add-farm":
      return <FarmerRegistration onBack={handleBack} />;

    case "data-management":
      return <DataExportImport onBack={handleBack} />;
    
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
