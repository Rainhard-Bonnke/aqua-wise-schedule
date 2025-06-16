
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import MainSidebar from "./layout/MainSidebar";
import MainHeader from "./layout/MainHeader";
import MainContent from "./layout/MainContent";

interface MainLayoutProps {
  unreadNotifications: number;
}

const MainLayout = ({ unreadNotifications }: MainLayoutProps) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { signOut, user, profile } = useAuth();

  // Redirect to landing if not authenticated
  if (!user) {
    window.location.href = '/';
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <MainSidebar 
        currentView={currentView} 
        onNavigate={setCurrentView}
        userRole={profile?.name || 'Extension Officer'}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MainHeader 
          currentView={currentView}
          unreadNotifications={unreadNotifications}
          userRole={profile?.name || 'Extension Officer'}
          onSignOut={handleSignOut}
        />
        
        <MainContent 
          currentView={currentView} 
          onNavigate={setCurrentView} 
        />
      </div>
    </div>
  );
};

export default MainLayout;
