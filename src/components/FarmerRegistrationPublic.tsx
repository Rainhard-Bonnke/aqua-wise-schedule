
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, User, MapPin, Sprout, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StepIndicator from "./farmer-registration-public/StepIndicator";
import PersonalInfoStep from "./farmer-registration-public/PersonalInfoStep";
import FarmDetailsStep from "./farmer-registration-public/FarmDetailsStep";
import CropInfoStep from "./farmer-registration-public/CropInfoStep";
import ReviewStep from "./farmer-registration-public/ReviewStep";

interface FarmerRegistrationPublicProps {
  onBack: () => void;
  onComplete: (farmerData: any) => void;
}

const FarmerRegistrationPublic = ({ onBack, onComplete }: FarmerRegistrationPublicProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    
    // Farm Info
    farmName: '',
    location: '',
    farmSize: '',
    soilType: '',
    
    // Crops
    primaryCrop: '',
    secondaryCrops: [] as string[],
    farmingExperience: '',
    irrigationMethod: '',
    
    // Additional
    challenges: '',
    goals: ''
  });

  const steps = [
    { id: 1, title: "Personal Information", icon: User },
    { id: 2, title: "Farm Details", icon: MapPin },
    { id: 3, title: "Crop Information", icon: Sprout },
    { id: 4, title: "Review & Submit", icon: CheckCircle }
  ];

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.name || !formData.phone) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields.",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 2:
        if (!formData.farmName || !formData.location || !formData.farmSize) {
          toast({
            title: "Missing Information", 
            description: "Please fill in all required fields.",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 3:
        if (!formData.primaryCrop || !formData.farmingExperience) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields.",
            variant: "destructive"
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = () => {
    toast({
      title: "Registration Successful!",
      description: "Welcome to AquaWise! You can now access all features.",
    });
    
    onComplete(formData);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} onUpdate={updateFormData} />;
      case 2:
        return <FarmDetailsStep formData={formData} onUpdate={updateFormData} />;
      case 3:
        return <CropInfoStep formData={formData} onUpdate={updateFormData} />;
      case 4:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Homepage
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join AquaWise</h1>
            <p className="text-gray-600">Register your farm and start smart irrigation</p>
          </div>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <steps[currentStep - 1].icon className="h-5 w-5 mr-2 text-green-600" />
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        <div className="flex justify-between max-w-2xl mx-auto mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Complete Registration
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerRegistrationPublic;
