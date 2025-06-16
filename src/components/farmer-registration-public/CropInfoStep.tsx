
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { crops } from "@/components/farmer-registration/constants";

interface CropInfoStepProps {
  formData: {
    primaryCrop: string;
    farmingExperience: string;
    irrigationMethod: string;
    challenges: string;
  };
  onUpdate: (field: string, value: string) => void;
}

const CropInfoStep = ({ formData, onUpdate }: CropInfoStepProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Primary Crop *</Label>
          <Select onValueChange={(value) => onUpdate("primaryCrop", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select primary crop" />
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (
                <SelectItem key={crop} value={crop}>{crop}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Farming Experience *</Label>
          <Select onValueChange={(value) => onUpdate("farmingExperience", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
              <SelectItem value="intermediate">Intermediate (3-10 years)</SelectItem>
              <SelectItem value="experienced">Experienced (10+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Current Irrigation Method</Label>
        <Select onValueChange={(value) => onUpdate("irrigationMethod", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select irrigation method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual watering</SelectItem>
            <SelectItem value="sprinkler">Sprinkler system</SelectItem>
            <SelectItem value="drip">Drip irrigation</SelectItem>
            <SelectItem value="furrow">Furrow irrigation</SelectItem>
            <SelectItem value="none">No irrigation system</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="challenges">Current Challenges (Optional)</Label>
        <Textarea
          id="challenges"
          value={formData.challenges}
          onChange={(e) => onUpdate("challenges", e.target.value)}
          placeholder="Describe any farming challenges you face..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default CropInfoStep;
