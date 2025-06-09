
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle } from "lucide-react";
import { StepProps } from "./types";

const ReviewStep = ({ formData, onInputChange }: StepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">Review & Submit</h3>
        <p className="text-gray-600">Please review your information and agree to terms</p>
      </div>

      {/* Registration Summary */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="font-semibold text-gray-900">Registration Summary</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium">Name:</span> {formData.name}</p>
            <p><span className="font-medium">Phone:</span> {formData.phone}</p>
            <p><span className="font-medium">Location:</span> {formData.location}</p>
          </div>
          <div>
            <p><span className="font-medium">Farm Size:</span> {formData.farmSize} acres</p>
            <p><span className="font-medium">Experience:</span> {formData.experience} years</p>
            <p><span className="font-medium">Crops:</span> {formData.cropTypes.length} types</p>
          </div>
        </div>
      </div>

      {/* Terms and Agreements */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={formData.agreesToTerms}
            onCheckedChange={(checked) => onInputChange("agreesToTerms", checked)}
            required
          />
          <div className="text-sm">
            <Label htmlFor="terms" className="font-medium">
              I agree to the Terms and Conditions *
            </Label>
            <p className="text-gray-600 mt-1">
              By checking this box, you agree to participate in the Homa Bay County 
              AquaWise Irrigation Program and follow the guidelines provided.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="dataSharing"
            checked={formData.agreesToDataSharing}
            onCheckedChange={(checked) => onInputChange("agreesToDataSharing", checked)}
          />
          <div className="text-sm">
            <Label htmlFor="dataSharing" className="font-medium">
              I consent to data sharing for research purposes
            </Label>
            <p className="text-gray-600 mt-1">
              Allow anonymous usage of your farming data to improve irrigation 
              recommendations for the county.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
