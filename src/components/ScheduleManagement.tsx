import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, Clock, Droplets, MapPin, Search, Filter, 
  Plus, Edit, Trash2, Play, Pause, ArrowLeft, Eye,
  CheckCircle, AlertCircle, XCircle
} from "lucide-react";
import { dataService, IrrigationSchedule, Farm } from "@/services/dataService";
import { useToast } from "@/hooks/use-toast";

interface ScheduleManagementProps {
  onBack: () => void;
  onCreateSchedule: () => void;
}

const ScheduleManagement = ({ onBack, onCreateSchedule }: ScheduleManagementProps) => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const schedulesData = dataService.getSchedules();
    const farmsData = dataService.getFarms();
    setSchedules(schedulesData);
    setFarms(farmsData);
  };

  const getFarmName = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    return farm ? farm.name : "Unknown Farm";
  };

  const getStatusIcon = (schedule: IrrigationSchedule) => {
    if (!schedule.isActive) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    const nextIrrigation = new Date(schedule.nextIrrigation);
    const now = new Date();
    const timeDiff = nextIrrigation.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 0) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    } else if (hoursDiff < 24) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusText = (schedule: IrrigationSchedule) => {
    if (!schedule.isActive) return "Inactive";
    
    const nextIrrigation = new Date(schedule.nextIrrigation);
    const now = new Date();
    const timeDiff = nextIrrigation.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 0) return "Overdue";
    if (hoursDiff < 24) return "Upcoming";
    return "Scheduled";
  };

  const toggleScheduleStatus = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      const updatedSchedule = { ...schedule, isActive: !schedule.isActive };
      dataService.saveSchedule(updatedSchedule);
      loadData();
      
      toast({
        title: `Schedule ${updatedSchedule.isActive ? 'Activated' : 'Deactivated'}`,
        description: `The irrigation schedule has been ${updatedSchedule.isActive ? 'activated' : 'deactivated'}.`,
      });
    }
  };

  const deleteSchedule = (scheduleId: string) => {
    dataService.deleteSchedule(scheduleId);
    loadData();
    
    toast({
      title: "Schedule Deleted",
      description: "The irrigation schedule has been removed.",
      variant: "destructive"
    });
  };

  const filteredSchedules = schedules.filter(schedule => {
    const farmName = getFarmName(schedule.farmId).toLowerCase();
    const matchesSearch = farmName.includes(searchTerm.toLowerCase()) || 
                         schedule.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === "active") return schedule.isActive && matchesSearch;
    if (selectedTab === "inactive") return !schedule.isActive && matchesSearch;
    return matchesSearch;
  });

  const getUpcomingSchedules = () => {
    const now = new Date();
    return schedules
      .filter(s => s.isActive)
      .map(s => ({
        ...s,
        nextDate: new Date(s.nextIrrigation)
      }))
      .filter(s => s.nextDate > now)
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
      .slice(0, 5);
  };

  const getTodaySchedules = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return schedules
      .filter(s => s.isActive)
      .filter(s => {
        const scheduleDate = new Date(s.nextIrrigation);
        return scheduleDate >= today && scheduleDate < tomorrow;
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
                <p className="text-gray-600">Manage irrigation schedules across all farms</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={onCreateSchedule} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Schedules</p>
                    <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Schedules</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {schedules.filter(s => s.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Today's Irrigations</p>
                    <p className="text-2xl font-bold text-gray-900">{getTodaySchedules().length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Droplets className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-900">{getUpcomingSchedules().length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <TabsList>
                <TabsTrigger value="all">All Schedules</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              {filteredSchedules.length === 0 ? (
                <Card>
                  <CardContent className="p-12">
                    <div className="text-center">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules found</h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm ? 'No schedules match your search.' : 'No irrigation schedules have been created yet.'}
                      </p>
                      <Button onClick={onCreateSchedule} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredSchedules.map((schedule) => (
                    <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getStatusIcon(schedule)}
                              <h3 className="font-semibold text-gray-900">
                                {getFarmName(schedule.farmId)}
                              </h3>
                              <Badge variant="outline" className={
                                schedule.isActive ? "bg-green-50 text-green-700 border-green-200" : 
                                "bg-gray-50 text-gray-700 border-gray-200"
                              }>
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
                                <span>{schedule.bestTime}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>Next: {new Date(schedule.nextIrrigation).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleScheduleStatus(schedule.id)}
                            >
                              {schedule.isActive ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
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
              )}
            </TabsContent>

            <TabsContent value="active">
              <div className="space-y-4">
                {filteredSchedules.filter(s => s.isActive).map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(schedule)}
                            <h3 className="font-semibold text-gray-900">
                              {getFarmName(schedule.farmId)}
                            </h3>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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
                              <span>{schedule.bestTime}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>Next: {new Date(schedule.nextIrrigation).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => toggleScheduleStatus(schedule.id)}>
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
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
            </TabsContent>

            <TabsContent value="inactive">
              <div className="space-y-4">
                {filteredSchedules.filter(s => !s.isActive).map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-md transition-shadow opacity-75">
                    <CardContent className="p-6">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(schedule)}
                            <h3 className="font-semibold text-gray-900">
                              {getFarmName(schedule.farmId)}
                            </h3>
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              Inactive
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
                              <span>{schedule.bestTime}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>Last: {new Date(schedule.nextIrrigation).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => toggleScheduleStatus(schedule.id)}>
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
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
            </TabsContent>

            <TabsContent value="upcoming">
              <div className="space-y-4">
                {getUpcomingSchedules().map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <h3 className="font-semibold text-gray-900">
                              {getFarmName(schedule.farmId)}
                            </h3>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Next: {schedule.nextDate.toLocaleDateString()} at {schedule.bestTime}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
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
                              <span>
                                {Math.ceil((schedule.nextDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days remaining
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default ScheduleManagement;
