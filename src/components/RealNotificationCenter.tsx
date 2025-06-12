
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Bell, BellRing, Check, CheckCheck, X, AlertTriangle, 
  Droplets, Clock, Calendar, CheckCircle
} from "lucide-react";
import { realNotificationService, RealNotification } from "@/services/realNotificationService";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface RealNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const RealNotificationCenter = ({ isOpen, onClose }: RealNotificationCenterProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<RealNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionRequired'>('all');
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<RealNotification | null>(null);
  const [waterUsed, setWaterUsed] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const unsubscribe = realNotificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const getNotificationIcon = (type: RealNotification['type']) => {
    switch (type) {
      case 'irrigation_due': return Clock;
      case 'irrigation_overdue': return AlertTriangle;
      case 'weather_alert': return AlertTriangle;
      case 'system_alert': return Bell;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: RealNotification['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'actionRequired': return notification.actionRequired && !notification.read;
      default: return true;
    }
  });

  const handleMarkAsRead = (notificationId: string) => {
    realNotificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    realNotificationService.markAllAsRead();
  };

  const handleCompleteIrrigation = (notification: RealNotification) => {
    setSelectedNotification(notification);
    setWaterUsed("");
    setNotes("");
    setShowCompleteDialog(true);
  };

  const submitIrrigationCompletion = async () => {
    if (!selectedNotification || !waterUsed) {
      toast({
        title: "Missing Information",
        description: "Please enter the amount of water used.",
        variant: "destructive"
      });
      return;
    }

    const success = await realNotificationService.markIrrigationCompleted(
      selectedNotification.scheduleId!,
      parseFloat(waterUsed),
      notes
    );

    if (success) {
      toast({
        title: "Irrigation Completed",
        description: "Irrigation has been logged and next schedule updated.",
      });
      setShowCompleteDialog(false);
      setSelectedNotification(null);
    } else {
      toast({
        title: "Error",
        description: "Failed to complete irrigation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const unreadCount = realNotificationService.getUnreadCount();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16 pr-4">
        <Card className="w-96 max-h-[80vh] shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BellRing className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex space-x-2 mt-3">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="text-xs"
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
                className="text-xs"
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === 'actionRequired' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('actionRequired')}
                className="text-xs"
              >
                Action Required
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="mt-2 w-full text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark All as Read
              </Button>
            )}
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            notification.type === 'irrigation_due' ? 'bg-blue-100' :
                            notification.type === 'irrigation_overdue' ? 'bg-red-100' :
                            notification.type === 'weather_alert' ? 'bg-orange-100' :
                            'bg-gray-100'
                          }`}>
                            <IconComponent className={`h-4 w-4 ${
                              notification.type === 'irrigation_due' ? 'text-blue-600' :
                              notification.type === 'irrigation_overdue' ? 'text-red-600' :
                              notification.type === 'weather_alert' ? 'text-orange-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                              </span>
                              
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-xs px-2 py-1 h-auto"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                            </div>

                            {notification.actionRequired && !notification.read && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full text-xs"
                                onClick={() => {
                                  if (notification.type === 'irrigation_due' || notification.type === 'irrigation_overdue') {
                                    handleCompleteIrrigation(notification);
                                  } else {
                                    handleMarkAsRead(notification.id);
                                  }
                                }}
                              >
                                {notification.type === 'irrigation_due' || notification.type === 'irrigation_overdue' 
                                  ? 'Complete Irrigation' 
                                  : 'Take Action'
                                }
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Complete Irrigation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Complete Irrigation
            </DialogTitle>
            <DialogDescription>
              Record the completion of this irrigation session.
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Farm:</strong> {selectedNotification.actionData?.farmName}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Crop:</strong> {selectedNotification.actionData?.cropName}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Planned Duration:</strong> {selectedNotification.actionData?.duration} minutes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waterUsed">Water Used (liters) *</Label>
                <Input
                  id="waterUsed"
                  type="number"
                  value={waterUsed}
                  onChange={(e) => setWaterUsed(e.target.value)}
                  placeholder="Enter amount of water used"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any observations or issues"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCompleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitIrrigationCompletion}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete Irrigation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RealNotificationCenter;
