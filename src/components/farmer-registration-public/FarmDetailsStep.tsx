
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locations } from "@/components/farmer-registration/constants";

interface FarmDetailsStepProps {
  formData: {
    farmName: string;
    location: string;
    farmSize: string;
    soilType: string;
  };
  onUpdate: (field: string, value: string) => void;
}

const FarmDetailsStep = ({ formData, onUpdate }: FarmDetailsStepProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="farmName">Farm Name *</Label>
          <Input
            id="farmName"
            value={formData.farmName}
            onChange={(e) => onUpdate("farmName", e.target.value)}
            placeholder="Green Valley Farm"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Location *</Label>
          <Select onValueChange={(value) => onUpdate("location", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="farmSize">Farm Size (acres) *</Label>
          <Input
            id="farmSize"
            type="number"
            value={formData.farmSize}
            onChange={(e) => onUpdate("farmSize", e.target.value)}
            placeholder="5"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Soil Type</Label>
          <Select onValueChange={(value) => onUpdate("soilType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select soil type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clay">Clay</SelectItem>
              <SelectItem value="sandy">Sandy</SelectItem>
              <SelectItem value="loamy">Loamy</SelectItem>
              <SelectItem value="silty">Silty</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FarmDetailsStep;
