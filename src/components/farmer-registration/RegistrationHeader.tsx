
import { Button } from "@/components/ui/button";
import { Droplets, ArrowLeft } from "lucide-react";

interface RegistrationHeaderProps {
  onBack: () => void;
}

const RegistrationHeader = ({ onBack }: RegistrationHeaderProps) => {
  return (
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
  );
};

export default RegistrationHeader;
