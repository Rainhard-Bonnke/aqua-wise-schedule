
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/components/auth/AuthPage";
import MainLayout from "@/components/MainLayout";
import LandingPage from "@/components/LandingPage";
import { useEffect, useState } from "react";
import { realNotificationService } from "@/services/realNotificationService";

const Index = () => {
  const { user, loading } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (user) {
      // Subscribe to real-time notifications
      const unsubscribe = realNotificationService.subscribe(() => {
        setUnreadNotifications(realNotificationService.getUnreadCount());
      });

      // Request notification permissions
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return unsubscribe;
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show dashboard if user is authenticated (extension officer/admin)
  if (user && showDashboard) {
    return <MainLayout unreadNotifications={unreadNotifications} />;
  }

  // Show auth page if requested
  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  // Show landing page by default (accessible to farmers)
  return (
    <LandingPage 
      onGetStarted={() => setShowDashboard(true)}
      onLogin={() => setShowAuth(true)}
    />
  );
};

export default Index;
