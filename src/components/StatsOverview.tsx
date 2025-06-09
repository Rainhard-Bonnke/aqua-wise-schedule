
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  MapPin, 
  Droplets, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface StatsOverviewProps {
  data: {
    totalFarmers: number;
    activeFarms: number;
    totalWaterUsed: number;
    efficiency: number;
    activeSchedules: number;
    pendingApprovals: number;
    completedIrrigations: number;
    upcomingIrrigations: number;
  };
}

const StatsOverview = ({ data }: StatsOverviewProps) => {
  const stats = [
    {
      title: "Registered Farmers",
      value: data.totalFarmers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12.5%",
      changeType: "positive"
    },
    {
      title: "Active Farms",
      value: data.activeFarms.toLocaleString(),
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8.2%",
      changeType: "positive"
    },
    {
      title: "Water Conservation",
      value: `${data.totalWaterUsed.toLocaleString()}L`,
      icon: Droplets,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      change: "-15.3%",
      changeType: "positive"
    },
    {
      title: "System Efficiency",
      value: `${data.efficiency.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+5.7%",
      changeType: "positive"
    }
  ];

  const operationalStats = [
    {
      title: "Active Schedules",
      value: data.activeSchedules,
      icon: Calendar,
      color: "text-emerald-600"
    },
    {
      title: "Pending Approvals",
      value: data.pendingApprovals,
      icon: AlertTriangle,
      color: "text-orange-600"
    },
    {
      title: "Completed Today",
      value: data.completedIrrigations,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Upcoming (24h)",
      value: data.upcomingIrrigations,
      icon: Clock,
      color: "text-blue-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <Badge 
                      variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-2">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Operational Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Operations</CardTitle>
          <CardDescription>Real-time irrigation system status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {operationalStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex p-3 rounded-full ${stat.color} bg-opacity-10 mb-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            ))}
          </div>
          
          {/* Efficiency Progress */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Water Usage Efficiency</span>
              <span className="text-sm text-gray-600">{data.efficiency.toFixed(1)}%</span>
            </div>
            <Progress value={data.efficiency} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">Target: 85% | Current: {data.efficiency.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
