
import React from 'react';
import Dashboard from '../Dashboard';
import FarmerRegistration from '../FarmerRegistration';
import ScheduleManagement from '../ScheduleManagement';
import AdvancedAnalytics from '../AdvancedAnalytics';
import DataExportImport from '../DataExportImport';
import CostCalculator from '../CostCalculator';
import CommunitySharing from '../CommunitySharing';
import ExtensionOfficerDashboard from '../ExtensionOfficerDashboard';
import SoilMoistureTracker from '../SoilMoistureTracker';
import SettingsPage from '../SettingsPage';

interface MainContentProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  currentView,
  onNavigate
}) => {
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={onNavigate} />;
      case 'farms':
        return <FarmerRegistration onBack={() => onNavigate('dashboard')} />;
      case 'schedules':
        return <ScheduleManagement onBack={() => onNavigate('dashboard')} onCreateSchedule={() => {}} />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'data-management':
        return <DataExportImport onBack={() => onNavigate('dashboard')} />;
      case 'costs':
        return <CostCalculator farmId="default-farm" />;
      case 'community':
        return <CommunitySharing />;
      case 'extension':
        return <ExtensionOfficerDashboard />;
      case 'monitoring':
        return <SoilMoistureTracker farmId="default-farm" />;
      case 'settings':
        return <SettingsPage onBack={() => onNavigate('dashboard')} />;
      default:
        return <Dashboard onNavigate={onNavigate} />;
    }
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-4 lg:p-6">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainContent;
