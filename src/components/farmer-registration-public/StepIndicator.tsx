
import { CheckCircle } from "lucide-react";

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={
              currentStep >= step.id 
                ? 'flex items-center justify-center w-10 h-10 rounded-full border-2 bg-green-600 border-green-600 text-white' 
                : 'flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white border-gray-300 text-gray-400'
            }>
              {currentStep > step.id ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={
                currentStep > step.id ? 'w-16 h-0.5 mx-2 bg-green-600' : 'w-16 h-0.5 mx-2 bg-gray-300'
              } />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
