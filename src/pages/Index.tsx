
import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import FarmerRegistration from "@/components/FarmerRegistration";
import ScheduleForm from "@/components/ScheduleForm";
import ScheduleDisplay from "@/components/ScheduleDisplay";
import WeatherSettings from "@/components/WeatherSettings";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [scheduleData, setScheduleData] = useState(null);
  const [viewData, setViewData] = useState(null);

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

  // Render based on current view
  switch (currentView) {
    case "register":
      return <FarmerRegistration onBack={handleBack} />;
    
    case "schedule-form":
    case "create-schedule":
      return <ScheduleForm onScheduleGenerated={handleScheduleGenerated} onBack={handleBack} />;
    
    case "schedule":
      return <ScheduleDisplay scheduleData={scheduleData} onBack={handleBack} />;
    
    case "weather-settings":
      return <WeatherSettings onBack={handleBack} />;
    
    case "add-farm":
      return <FarmerRegistration onBack={handleBack} />;
    
    case "dashboard":
    default:
      return <Dashboard onNavigate={handleNavigation} />;
  }
};

export default Index;
