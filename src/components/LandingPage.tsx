
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, Users, TrendingUp, Smartphone, Shield, BarChart3, 
  CheckCircle, ArrowRight, MapPin, Calendar, Zap, Award
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage = ({ onGetStarted, onLogin }: LandingPageProps) => {
  const [animatedCounter, setAnimatedCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedCounter(prev => prev < 836 ? prev + 15 : 836);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Droplets,
      title: "Smart Irrigation Scheduling",
      description: "AI-powered irrigation recommendations based on weather, soil moisture, and crop requirements",
      color: "text-blue-600"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive water usage analytics and efficiency reporting for informed decision making",
      color: "text-green-600"
    },
    {
      icon: Smartphone,
      title: "SMS & Mobile Alerts",
      description: "Real-time notifications and reminders sent directly to farmers' mobile phones",
      color: "text-purple-600"
    },
    {
      icon: Users,
      title: "Community Platform",
      description: "Connect farmers with extension officers and share best practices across the county",
      color: "text-orange-600"
    },
    {
      icon: Shield,
      title: "Government Grade Security",
      description: "Secure data management with role-based access control and audit trails",
      color: "text-red-600"
    },
    {
      icon: TrendingUp,
      title: "Cost Optimization",
      description: "Track irrigation costs and optimize water usage for maximum crop yield efficiency",
      color: "text-cyan-600"
    }
  ];

  const stats = [
    { label: "Registered Farmers", value: animatedCounter, suffix: "+" },
    { label: "Water Saved", value: "2.3M", suffix: " Liters" },
    { label: "Crop Yield Increase", value: "34", suffix: "%" },
    { label: "Cost Reduction", value: "28", suffix: "%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Badge className="mb-6 bg-green-100 text-green-800 border-green-200 text-sm px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              Homa Bay County Official System
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AquaWise
              <span className="text-green-600 block">Irrigation Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform agriculture in Homa Bay County with intelligent irrigation management. 
              Optimize water usage, increase crop yields, and empower farmers with data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
              >
                Register Your Farm
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={onLogin}
                variant="outline"
                size="lg"
                className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg"
              >
                Access Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Irrigation Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to modernize agriculture and optimize water resources in Homa Bay County
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose AquaWise?
              </h2>
              <div className="space-y-6">
                {[
                  "Reduce water usage by up to 40% through smart scheduling",
                  "Increase crop yields with precision irrigation timing",
                  "Real-time weather integration for optimal planning",
                  "Government-backed extension officer support",
                  "Community knowledge sharing platform",
                  "Comprehensive cost tracking and ROI analysis"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-700">8</div>
                <div className="text-sm text-green-600">Sub-Counties</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-700">24/7</div>
                <div className="text-sm text-blue-600">Monitoring</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-purple-700">98%</div>
                <div className="text-sm text-purple-600">Uptime</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-orange-700">50+</div>
                <div className="text-sm text-orange-600">Extension Officers</div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join hundreds of farmers in Homa Bay County who are already saving water and increasing yields
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
          >
            Start Free Registration
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">AquaWise</h3>
              <p className="text-gray-300">
                Official irrigation management system for Homa Bay County Government.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-300">Homa Bay County Government</p>
              <p className="text-gray-300">Department of Agriculture</p>
              <p className="text-gray-300">+254 XXX XXX XXX</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <p className="text-gray-300">Technical Support: 24/7</p>
              <p className="text-gray-300">Extension Officers Available</p>
              <p className="text-gray-300">Training & Resources</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Homa Bay County Government. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
