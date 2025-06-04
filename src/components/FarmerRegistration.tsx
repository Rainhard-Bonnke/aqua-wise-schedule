
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dataService } from "@/services/dataService";

interface FarmerRegistrationProps {
  onBack: () => void;
}

const FarmerRegistration = ({ onBack }: FarmerRegistrationProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    farmSize: "",
    experience: ""
  });

  const locations = [
    "Rachuonyo North",
    "Rachuonyo South", 
    "Rachuonyo East",
    "Homa Bay Town",
    "Ndhiwa",
    "Rangwe",
    "Suba North",
    "Suba South"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration data:", formData);
    
    // Save farmer data
    const farmData = {
      name: `${formData.name}'s Farm`,
      location: formData.location,
      size: parseFloat(formData.farmSize) || 0,
      soilType: "Mixed", // Default value
      crops: [], // Start with empty crops array
      farmer: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        experience: parseInt(formData.experience) || 0
      }
    };
    
    dataService.addFarm(farmData);
    
    toast({
      title: "Registration Successful!",
      description: "Welcome to AquaWise Scheduler. Redirecting to your dashboard...",
    });

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      onBack(); // This will navigate back to dashboard
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AquaWise Scheduler</h1>
            </div>
            <Button variant="outline" onClick={onBack}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Registration Form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-green-800">Farmer Registration</CardTitle>
              <CardDescription className="text-gray-600">
                Join our community of smart farmers and start optimizing your irrigation today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Label htmlFor="farmSize">Farm Size (Acres)</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      value={formData.farmSize}
                      onChange={(e) => handleInputChange("farmSize", e.target.value)}
                      placeholder="e.g., 2.5"
                      step="0.1"
                    />
                  </div>
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
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Register as Farmer
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default FarmerRegistration;
