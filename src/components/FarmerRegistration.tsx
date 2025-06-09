
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Droplets, User, MapPin, Briefcase, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dataService, type Farm, type User } from "@/services/dataService";

interface FarmerRegistrationProps {
  onBack: () => void;
}

const FarmerRegistration = ({ onBack }: FarmerRegistrationProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
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
    cropTypes: [] as string[],
    irrigationMethod: "",
    
    // Agreements
    agreesToTerms: false,
    agreesToDataSharing: false
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const locations = [
    "Rachuonyo North", "Rachuonyo South", "Rachuonyo East",
    "Homa Bay Town", "Ndhiwa", "Rangwe", "Suba North", "Suba South"
  ];

  const soilTypes = [
    "Clay", "Sandy", "Loamy", "Silty", "Rocky", "Mixed"
  ];

  const waterSources = [
    "Borehole", "River", "Lake Victoria", "Rainwater", "Dam", "Spring"
  ];

  const cropOptions = [
    "Maize", "Beans", "Rice", "Vegetables", "Tomatoes", "Onions", 
    "Potatoes", "Cassava", "Sweet Potatoes", "Groundnuts"
  ];

  const irrigationMethods = [
    "Drip Irrigation", "Sprinkler", "Furrow", "Flood", "Manual Watering"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final submission
    console.log("Registration data:", formData);
    
    const farmData: Farm = {
      id: Date.now().toString(),
      name: formData.farmName || `${formData.name}'s Farm`,
      location: formData.location,
      size: parseFloat(formData.farmSize) || 0,
      soilType: formData.soilType || "Mixed",
      crops: formData.cropTypes,
      createdAt: new Date().toISOString()
    };
    
    const userData: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      farms: [farmData.id],
      preferences: {
        notifications: {
          sms: true,
          email: true,
          push: true
        },
        units: 'metric',
        language: 'en'
      },
      createdAt: new Date().toISOString()
    };
    
    dataService.saveFarm(farmData);
    dataService.saveUser(userData);
    
    toast({
      title: "Registration Successful!",
      description: "Welcome to Homa Bay County AquaWise System. Your application is being processed.",
    });

    setTimeout(() => {
      onBack();
    }, 2000);
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
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              <p className="text-gray-600">Please provide your basic information</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID Number *</Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange("nationalId", e.target.value)}
                  placeholder="12345678"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+254 XXX XXX XXX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
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
                  onChange={(e) => handleInputChange("farmName", e.target.value)}
                  placeholder="e.g., Green Valley Farm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Sub-County/Ward) *</Label>
                <Select onValueChange={(value) => handleInputChange("location", value)} required>
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
                    onChange={(e) => handleInputChange("farmSize", e.target.value)}
                    placeholder="e.g., 2.5"
                    step="0.1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Select onValueChange={(value) => handleInputChange("soilType", value)}>
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
                <Select onValueChange={(value) => handleInputChange("waterSource", value)}>
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

      case 3:
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
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="e.g., 10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="irrigationMethod">Current Irrigation Method</Label>
                <Select onValueChange={(value) => handleInputChange("irrigationMethod", value)}>
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
                      onCheckedChange={() => handleCropToggle(crop)}
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

      case 4:
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
                  onCheckedChange={(checked) => handleInputChange("agreesToTerms", checked)}
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
                  onCheckedChange={(checked) => handleInputChange("agreesToDataSharing", checked)}
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-2 rounded-lg">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Homa Bay County</h1>
                <p className="text-sm text-gray-600">Farmer Registration System</p>
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Registration Form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Farmer Registration</h2>
              <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
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
                    >
                      Previous
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 ml-auto"
                    disabled={currentStep === 4 && !formData.agreesToTerms}
                  >
                    {currentStep === totalSteps ? "Submit Registration" : "Next"}
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
