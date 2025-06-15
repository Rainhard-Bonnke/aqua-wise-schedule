
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

interface OverviewTabProps {
  farms: any[];
  cropDistribution: { [key: string]: number };
  pieData: { name: string; value: number }[];
  cropData: { name: string; value: number }[];
}

const OverviewTab = ({ farms, cropDistribution, pieData, cropData }: OverviewTabProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Total Farms</h3>
          <p className="text-3xl font-bold text-green-900">{farms.length}</p>
          <p className="text-sm text-green-600">Active across county</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Total Area</h3>
          <p className="text-3xl font-bold text-blue-900">
            {farms.reduce((sum, farm) => sum + (farm.size || 0), 0).toFixed(1)} acres
          </p>
          <p className="text-sm text-blue-600">Under irrigation</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">Crop Varieties</h3>
          <p className="text-3xl font-bold text-purple-900">{Object.keys(cropDistribution).length}</p>
          <p className="text-sm text-purple-600">Different crops</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Soil Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crop Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cropData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OverviewTab;
