import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Add this import
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FarmerFormData } from "./farmer-registration/types";
import { TOTAL_STEPS } from "./farmer-registration/constants";
import { submitRegistration } from "./farmer-registration/utils";
import RegistrationHeader from "./farmer-registration/RegistrationHeader";
import PersonalInfoStep from "./farmer-registration/PersonalInfoStep";
import FarmInfoStep from "./farmer-registration/FarmInfoStep";
import ExperienceStep from "./farmer-registration/ExperienceStep";
import ReviewStep from "./farmer-registration/ReviewStep";

interface FarmerRegistrationProps {
  onBack: () => void;
}

const FarmerRegistration = ({ onBack }: FarmerRegistrationProps) => {
  const { toast } = useToast();
  const navigate = useNavigate(); // <-- Add this line
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FarmerFormData>({
    // Personal Information
    name: "",
    phone: "",
    email: "",
    nationalId: "",
    gender: "",
    dateOfBirth: "",
    
    // Farm Information
    farmName: "",
    location: "",
    farmSize: "",
    soilType: "",
    waterSource: "",
    
    // Experience & Crops
    experience: "",
    cropTypes: [],
    irrigationMethod: "",
    
    // Agreements
    agreesToTerms: false,
    agreesToDataSharing: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final submission
    setIsSubmitting(true);
    try {
      await submitRegistration(formData);

      toast({
        title: "Registration Successful!",
        description: "Welcome to Homa Bay County AquaWise System. Your application is being processed.",
      });

      setTimeout(() => {
        navigate("/dashboard"); // <-- Redirect to dashboard after registration
      }, 2000);
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "An error occurred during registration. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCropToggle = (crop: string) => {
    const newCrops = formData.cropTypes.includes(crop)
      ? formData.cropTypes.filter(c => c !== crop)
      : [...formData.cropTypes, crop];
    handleInputChange("cropTypes", newCrops);
  };

  const renderStepContent = () => {
    const stepProps = {
      formData,
      onInputChange: handleInputChange,
      onCropToggle: handleCropToggle
    };

    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...stepProps} />;
      case 2:
        return <FarmInfoStep {...stepProps} />;
      case 3:
        return <ExperienceStep {...stepProps} />;
      case 4:
        return <ReviewStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <RegistrationHeader onBack={onBack} />

      {/* Registration Form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Farmer Registration</h2>
              <span className="text-sm text-gray-600">Step {currentStep} of {TOTAL_STEPS}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Personal Info</span>
              <span>Farm Details</span>
              <span>Experience</span>
              <span>Review</span>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit}>
                {renderStepContent()}

                <div className="flex justify-between mt-8 pt-6 border-t">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      disabled={isSubmitting}
                    >
                      Previous
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 ml-auto"
                    disabled={isSubmitting || (currentStep === 4 && !formData.agreesToTerms)}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : currentStep === TOTAL_STEPS
                        ? "Submit Registration"
                        : "Next"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default FarmerRegistration;