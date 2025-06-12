
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus } from "lucide-react";
import { Farm } from "@/services/dataService";

interface FarmsListProps {
  farms: Farm[];
  onAddFarm: () => void;
  onViewFarm: (farm: Farm) => void;
}

const FarmsList = ({ farms, onAddFarm, onViewFarm }: FarmsListProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              Registered Farms
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {farms.length} active farms across Homa Bay County
            </p>
          </div>
          <Button 
            onClick={onAddFarm}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Farm
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {farms.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No farms registered</h3>
            <p className="text-gray-600 mb-6">Start by registering your first farm</p>
            <Button 
              onClick={onAddFarm}
              className="bg-green-600 hover:bg-green-700"
            >
              Register First Farm
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {farms.slice(0, 6).map((farm) => (
              <div 
                key={farm.id}
                className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-white"
                onClick={() => onViewFarm(farm)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{farm.name}</h4>
                      <p className="text-sm text-gray-600">
                        {farm.location} • {farm.size} acres
                      </p>
                      <p className="text-sm text-gray-500">
                        {farm.crops.length} crops planted
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
            {farms.length > 6 && (
              <Button variant="outline" className="w-full">
                View All {farms.length} Farms
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FarmsList;
