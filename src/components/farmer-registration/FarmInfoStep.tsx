
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { StepProps } from "./types";
import { locations, soilTypes, waterSources } from "./constants";

const FarmInfoStep = ({ formData, onInputChange }: StepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">Farm Information</h3>
        <p className="text-gray-600">Tell us about your farm</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="farmName">Farm Name</Label>
          <Input
            id="farmName"
            value={formData.farmName}
            onChange={(e) => onInputChange("farmName", e.target.value)}
            placeholder="e.g., Green Valley Farm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location (Sub-County/Ward) *</Label>
          <Select onValueChange={(value) => onInputChange("location", value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select your location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="farmSize">Farm Size (Acres) *</Label>
            <Input
              id="farmSize"
              type="number"
              value={formData.farmSize}
              onChange={(e) => onInputChange("farmSize", e.target.value)}
              placeholder="e.g., 2.5"
              step="0.1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="soilType">Soil Type</Label>
            <Select onValueChange={(value) => onInputChange("soilType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select soil type" />
              </SelectTrigger>
              <SelectContent>
                {soilTypes.map((soil) => (
                  <SelectItem key={soil} value={soil}>
                    {soil}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="waterSource">Primary Water Source</Label>
          <Select onValueChange={(value) => onInputChange("waterSource", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select water source" />
            </SelectTrigger>
            <SelectContent>
              {waterSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FarmInfoStep;
