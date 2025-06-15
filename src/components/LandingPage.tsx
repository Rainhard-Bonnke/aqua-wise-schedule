
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, Users, TrendingUp, Smartphone, Shield, BarChart3, 
  CheckCircle, ArrowRight, MapPin, Calendar, Zap, Award, Star
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
      title: "Smart Irrigation",
      description: "AI-powered irrigation recommendations based on weather and soil conditions",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive water usage analytics and efficiency reporting",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Smartphone,
      title: "Mobile Alerts",
      description: "Real-time SMS notifications and mobile app integration",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Users,
      title: "Community Hub",
      description: "Connect farmers with extension officers and share best practices",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Government-grade security with role-based access control",
      color: "from-gray-500 to-slate-500"
    },
    {
      icon: TrendingUp,
      title: "Cost Optimization",
      description: "Track costs and optimize water usage for maximum efficiency",
      color: "from-cyan-500 to-blue-500"
    }
  ];

  const stats = [
    { label: "Active Farmers", value: animatedCounter, suffix: "+" },
    { label: "Water Saved", value: "2.3M", suffix: " L" },
    { label: "Yield Increase", value: "34", suffix: "%" },
    { label: "Cost Reduction", value: "28", suffix: "%" }
  ];

  return (
    <div className="min-h-screen bg-white animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Award className="h-4 w-4 mr-2" />
              Homa Bay County Official Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight font-serif">
              AquaWise
              <span className="block text-green-300">Irrigation Management</span>
            </h1>
            <p className="text-xl lg:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform agriculture in Homa Bay County with intelligent water management. 
              Increase yields, reduce costs, and optimize resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-white text-green-700 hover:bg-green-50 px-8 py-4 text-lg font-semibold"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={onLogin}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Complete Irrigation Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to modernize agriculture in Homa Bay County
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
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
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 font-serif">
                Why Choose AquaWise?
              </h2>
              <div className="space-y-4">
                {[
                  "Reduce water usage by up to 40%",
                  "Increase crop yields with precision timing",
                  "Real-time weather integration",
                  "Government-backed support",
                  "Community knowledge sharing",
                  "Complete cost tracking"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
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
                <Star className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-orange-700">4.9</div>
                <div className="text-sm text-orange-600">Rating</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 font-serif">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join hundreds of farmers already saving water and increasing yields
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">AquaWise</span>
              </div>
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
              <p className="text-gray-300">24/7 Technical Support</p>
              <p className="text-gray-300">Extension Officers Available</p>
              <p className="text-gray-300">Training & Resources</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Homa Bay County Government. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
