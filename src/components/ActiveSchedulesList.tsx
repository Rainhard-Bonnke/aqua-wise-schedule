
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Droplets, Clock, Calendar, MapPin, Play, Pause, 
  Edit, Trash2, AlertCircle, CheckCircle 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Schedule {
  id: string;
  farm_id: string;
  crop_id: string;
  frequency: number;
  duration: number;
  best_time: string;
  next_irrigation: string;
  is_active: boolean;
  created_at: string;
  farms: {
    name: string;
    location: string;
  };
  crops: {
    name: string;
    area: number;
  };
}

const ActiveSchedulesList = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchedules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('irrigation_schedules')
        .select(`
          *,
          farms (name, location),
          crops (name, area)
        `)
        .eq('farms.farmer_id', user.id)
        .order('next_irrigation', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load irrigation schedules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [user]);

  const toggleScheduleStatus = async (scheduleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('irrigation_schedules')
        .update({ is_active: !currentStatus })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: `Schedule ${!currentStatus ? 'Activated' : 'Deactivated'}`,
        description: `The irrigation schedule has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
      });

      loadSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule status",
        variant: "destructive"
      });
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('irrigation_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Schedule Deleted",
        description: "The irrigation schedule has been removed.",
      });

      loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (schedule: Schedule) => {
    if (!schedule.is_active) {
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
    
    const nextIrrigation = new Date(schedule.next_irrigation);
    const now = new Date();
    const timeDiff = nextIrrigation.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 0) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else if (hoursDiff < 24) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusText = (schedule: Schedule) => {
    if (!schedule.is_active) return "Inactive";
    
    const nextIrrigation = new Date(schedule.next_irrigation);
    const now = new Date();
    const timeDiff = nextIrrigation.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 0) return "Overdue";
    if (hoursDiff < 24) return "Due Soon";
    return "Scheduled";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-600">Loading schedules...</div>
        </CardContent>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Irrigation Schedules</h3>
            <p className="text-gray-600">
              Create your first irrigation schedule to start automated watering.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <Card key={schedule.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(schedule)}
                  <h3 className="font-semibold text-gray-900">
                    {schedule.farms.name} - {schedule.crops.name}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={
                      schedule.is_active 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }
                  >
                    {getStatusText(schedule)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Every {schedule.frequency} days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4" />
                    <span>{schedule.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{schedule.best_time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      Next: {formatDistanceToNow(new Date(schedule.next_irrigation), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleScheduleStatus(schedule.id, schedule.is_active)}
                >
                  {schedule.is_active ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteSchedule(schedule.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActiveSchedulesList;
