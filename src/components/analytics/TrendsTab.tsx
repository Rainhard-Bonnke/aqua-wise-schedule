
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const TrendsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Trends</CardTitle>
        <CardDescription>Farm registration and expansion patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Trend Analysis</h3>
          <p className="text-gray-600">Historical trend data will appear here as more farms are registered over time.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendsTab;
