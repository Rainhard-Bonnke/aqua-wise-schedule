
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, User, MapPin, Sprout, CheckCircle } from "lucide-react";
import { locations, crops } from "@/components/farmer-registration/constants";
import { useToast } from "@/hooks/use-toast";

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
    // Here you would typically save to a public database table for farmers
    // For now, we'll just complete the registration
    toast({
      title: "Registration Successful!",
      description: "Welcome to AquaWise! You can now access all features.",
    });
    
    onComplete(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+254 XXX XXX XXX"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="35"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name *</Label>
                <Input
                  id="farmName"
                  value={formData.farmName}
                  onChange={(e) => setFormData(prev => ({ ...prev, farmName: e.target.value }))}
                  placeholder="Green Valley Farm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, farmSize: e.target.value }))}
                  placeholder="5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Soil Type</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, soilType: value }))}>
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

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Crop *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, primaryCrop: value }))}>
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
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, farmingExperience: value }))}>
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
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, irrigationMethod: value }))}>
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
                onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                placeholder="Describe any farming challenges you face..."
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${currentStep >= step.id 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-0.5 mx-2
                    ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
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

        {/* Navigation */}
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
