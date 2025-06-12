
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainHeader from './layout/MainHeader';
import MainSidebar from './layout/MainSidebar';
import MainContent from './layout/MainContent';

interface MainLayoutProps {
  unreadNotifications?: number;
}

const MainLayout: React.FC<MainLayoutProps> = ({ unreadNotifications = 0 }) => {
  const { user, profile } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <MainSidebar 
        currentView={currentView}
        onNavigate={setCurrentView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <MainHeader 
          user={user}
          profile={profile}
          unreadNotifications={unreadNotifications}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Content */}
        <MainContent 
          currentView={currentView}
          onNavigate={setCurrentView}
        />
      </div>
    </div>
  );
};

export default MainLayout;
