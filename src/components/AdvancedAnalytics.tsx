
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { Download, Calendar, MapPin, Droplets } from "lucide-react";

const AdvancedAnalytics = () => {
  // Sample data for charts
  const waterUsageData = [
    { month: "Jan", usage: 45000, target: 40000, efficiency: 89 },
    { month: "Feb", usage: 38000, target: 40000, efficiency: 92 },
    { month: "Mar", usage: 42000, target: 40000, efficiency: 87 },
    { month: "Apr", usage: 35000, target: 40000, efficiency: 94 },
    { month: "May", usage: 48000, target: 40000, efficiency: 83 },
    { month: "Jun", usage: 52000, target: 40000, efficiency: 78 }
  ];

  const subCountyData = [
    { name: "Rachuonyo North", farms: 125, efficiency: 92 },
    { name: "Rachuonyo South", farms: 98, efficiency: 88 },
    { name: "Homa Bay Town", farms: 76, efficiency: 85 },
    { name: "Ndhiwa", farms: 143, efficiency: 91 },
    { name: "Rangwe", farms: 87, efficiency: 89 },
    { name: "Suba North", farms: 112, efficiency: 87 },
    { name: "Suba South", farms: 95, efficiency: 90 }
  ];

  const cropDistribution = [
    { name: "Maize", value: 35, count: 287 },
    { name: "Beans", value: 20, count: 164 },
    { name: "Vegetables", value: 25, count: 205 },
    { name: "Rice", value: 15, count: 123 },
    { name: "Others", value: 5, count: 41 }
  ];

  const dailyIrrigation = [
    { time: "6 AM", active: 45 },
    { time: "7 AM", active: 78 },
    { time: "8 AM", active: 92 },
    { time: "9 AM", active: 65 },
    { time: "10 AM", active: 34 },
    { time: "5 PM", active: 87 },
    { time: "6 PM", active: 112 },
    { time: "7 PM", active: 98 }
  ];

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Comprehensive irrigation system performance insights</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Water Conservation</CardTitle>
            <CardDescription>Monthly water usage vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={waterUsageData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorUsage)" 
                />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sub-County Performance</CardTitle>
            <CardDescription>Farms and efficiency by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subCountyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="farms" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Daily Irrigation Pattern</CardTitle>
            <CardDescription>Active schedules by time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyIrrigation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="active" stroke="#f59e0b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crop Distribution</CardTitle>
            <CardDescription>Types of crops being irrigated across the county</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={cropDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cropDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {cropDistribution.map((crop, index) => (
                  <div key={crop.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm font-medium">{crop.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{crop.value}%</p>
                      <p className="text-xs text-gray-500">{crop.count} farms</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Efficiency Trends</CardTitle>
            <CardDescription>Water usage efficiency over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={waterUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Efficiency Rate</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Target: 85%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Summary</CardTitle>
          <CardDescription>Detailed breakdown by sub-county</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Sub-County</th>
                  <th className="text-left p-3 font-medium">Active Farms</th>
                  <th className="text-left p-3 font-medium">Water Efficiency</th>
                  <th className="text-left p-3 font-medium">Avg Farm Size</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {subCountyData.map((region, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{region.name}</td>
                    <td className="p-3">{region.farms}</td>
                    <td className="p-3">{region.efficiency}%</td>
                    <td className="p-3">2.3 acres</td>
                    <td className="p-3">
                      <Badge 
                        variant={region.efficiency > 90 ? "default" : region.efficiency > 85 ? "secondary" : "destructive"}
                      >
                        {region.efficiency > 90 ? "Excellent" : region.efficiency > 85 ? "Good" : "Needs Improvement"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
