
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LocationStats {
  location: string;
  farms: number;
  totalSize: number;
  crops: number;
}

interface LocationTabProps {
  filteredData: LocationStats[];
}

const LocationTab = ({ filteredData }: LocationTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Farms by Location</CardTitle>
        <CardDescription>Distribution of farms across different locations</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="farms" fill="#10B981" name="Number of Farms" />
            <Bar dataKey="totalSize" fill="#3B82F6" name="Total Size (acres)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LocationTab;
