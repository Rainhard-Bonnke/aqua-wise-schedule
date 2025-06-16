
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewStepProps {
  formData: {
    name: string;
    phone: string;
    email: string;
    age: string;
    farmName: string;
    location: string;
    farmSize: string;
    soilType: string;
    primaryCrop: string;
    farmingExperience: string;
    irrigationMethod: string;
  };
}

const ReviewStep = ({ formData }: ReviewStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Your Information</h3>
        <p className="text-gray-600">Please verify your details before submitting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Phone:</strong> {formData.phone}</p>
            {formData.email && <p><strong>Email:</strong> {formData.email}</p>}
            {formData.age && <p><strong>Age:</strong> {formData.age}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Farm Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Farm Name:</strong> {formData.farmName}</p>
            <p><strong>Location:</strong> {formData.location}</p>
            <p><strong>Size:</strong> {formData.farmSize} acres</p>
            {formData.soilType && <p><strong>Soil Type:</strong> {formData.soilType}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Crop Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Primary Crop:</strong> {formData.primaryCrop}</p>
          <p><strong>Experience:</strong> {formData.farmingExperience}</p>
          {formData.irrigationMethod && <p><strong>Irrigation Method:</strong> {formData.irrigationMethod}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewStep;
