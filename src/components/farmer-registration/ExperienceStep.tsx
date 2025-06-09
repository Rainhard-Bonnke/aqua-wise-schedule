
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";
import { StepProps } from "./types";
import { cropOptions, irrigationMethods } from "./constants";

const ExperienceStep = ({ formData, onInputChange, onCropToggle }: StepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Briefcase className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">Farming Experience</h3>
        <p className="text-gray-600">Help us understand your farming background</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="experience">Farming Experience (Years)</Label>
          <Input
            id="experience"
            type="number"
            value={formData.experience}
            onChange={(e) => onInputChange("experience", e.target.value)}
            placeholder="e.g., 10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="irrigationMethod">Current Irrigation Method</Label>
          <Select onValueChange={(value) => onInputChange("irrigationMethod", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {irrigationMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Crops You Grow (Select all that apply)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {cropOptions.map((crop) => (
            <div key={crop} className="flex items-center space-x-2">
              <Checkbox
                id={crop}
                checked={formData.cropTypes.includes(crop)}
                onCheckedChange={() => onCropToggle && onCropToggle(crop)}
              />
              <Label htmlFor={crop} className="text-sm">
                {crop}
              </Label>
            </div>
          ))}
        </div>
        {formData.cropTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.cropTypes.map((crop) => (
              <Badge key={crop} variant="secondary" className="bg-green-100 text-green-800">
                {crop}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceStep;
