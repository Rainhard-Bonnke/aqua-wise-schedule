
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";

interface NextStepsProps {
  onContinue: () => void;
}

const NextSteps = ({ onContinue }: NextStepsProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-purple-500" />
          Next Steps: Start Your Smart Farming Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 border rounded-lg">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">1</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Add Your Crops</h4>
            <p className="text-sm text-gray-600">Tell us what you're growing so we can provide specific care recommendations.</p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Create Schedule</h4>
            <p className="text-sm text-gray-600">Set up your first irrigation schedule based on weather and crop needs.</p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">3</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Monitor & Optimize</h4>
            <p className="text-sm text-gray-600">Track water usage, get insights, and optimize your farming efficiency.</p>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={onContinue}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
          >
            Continue to Dashboard
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextSteps;
