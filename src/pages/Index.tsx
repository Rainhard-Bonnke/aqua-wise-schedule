import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/components/auth/AuthPage";
import MainLayout from "@/components/MainLayout";
import { useEffect, useState } from "react";
import { realNotificationService } from "@/services/realNotificationService";

const Index = () => {
  const { user, loading } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

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

  if (!user) {
    return <AuthPage />;
  }

  return <MainLayout unreadNotifications={unreadNotifications} />;
};

export default Index;
