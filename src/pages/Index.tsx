
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Calendar, Download, Print } from "lucide-react";
import FarmerRegistration from "@/components/FarmerRegistration";
import ScheduleForm from "@/components/ScheduleForm";
import ScheduleDisplay from "@/components/ScheduleDisplay";

const Index = () => {
  const [currentView, setCurrentView] = useState("home");
  const [scheduleData, setScheduleData] = useState(null);

  const handleScheduleGenerated = (data) => {
    setScheduleData(data);
    setCurrentView("schedule");
  };

  const renderHome = () => (
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
            <nav className="hidden md:flex space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentView("register")}
                className="text-gray-600 hover:text-green-600"
              >
                Register
              </Button>
              <Button 
                onClick={() => setCurrentView("schedule-form")}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Scheduling
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Irrigation for
            <span className="text-green-600"> Better Harvests</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Optimize your water usage and improve crop yields with AI-powered irrigation scheduling 
            based on weather forecasts, crop types, and soil conditions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setCurrentView("schedule-form")}
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4"
            >
              Create Schedule Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setCurrentView("register")}
              className="border-green-600 text-green-600 hover:bg-green-50 text-lg px-8 py-4"
            >
              Register as Farmer
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose AquaWise?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplets className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Water Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Reduce water waste by up to 40% with intelligent scheduling based on real weather data and soil conditions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-800">Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Get personalized irrigation schedules that adapt to your crop type, soil, and 7-day weather forecasts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-purple-800">Easy Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Download or print your schedules. Get SMS reminders to never miss an irrigation cycle.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Farming?
          </h3>
          <p className="text-green-100 text-lg mb-8">
            Join thousands of farmers who have increased their yields while saving water.
          </p>
          <Button 
            size="lg"
            onClick={() => setCurrentView("schedule-form")}
            className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );

  if (currentView === "register") {
    return <FarmerRegistration onBack={() => setCurrentView("home")} />;
  }

  if (currentView === "schedule-form") {
    return <ScheduleForm onScheduleGenerated={handleScheduleGenerated} onBack={() => setCurrentView("home")} />;
  }

  if (currentView === "schedule") {
    return <ScheduleDisplay scheduleData={scheduleData} onBack={() => setCurrentView("schedule-form")} />;
  }

  return renderHome();
};

export default Index;
