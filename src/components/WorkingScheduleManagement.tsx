
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Droplets } from "lucide-react";
import CreateScheduleModal from "./CreateScheduleModal";
import ActiveSchedulesList from "./ActiveSchedulesList";

interface WorkingScheduleManagementProps {
  onBack: () => void;
}

const WorkingScheduleManagement = ({ onBack }: WorkingScheduleManagementProps) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleScheduleCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Irrigation Schedules</h1>
                <p className="text-gray-600">Manage automated irrigation for your crops</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CreateScheduleModal onScheduleCreated={handleScheduleCreated} />
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
          {/* Instructions Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Droplets className="h-5 w-5" />
                How Irrigation Schedules Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700">
                <div>
                  <h4 className="font-semibold mb-1">1. Create Schedule</h4>
                  <p>Set frequency, duration, and timing for each crop on your farms.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">2. Automated Notifications</h4>
                  <p>Get alerts when it's time to irrigate based on your schedule.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">3. Track Progress</h4>
                  <p>Monitor water usage and irrigation history for each schedule.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Schedules */}
          <Card>
            <CardHeader>
              <CardTitle>Active Irrigation Schedules</CardTitle>
              <CardDescription>
                Manage your automated irrigation schedules for all farms and crops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div key={refreshKey}>
                <ActiveSchedulesList />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default WorkingScheduleManagement;
