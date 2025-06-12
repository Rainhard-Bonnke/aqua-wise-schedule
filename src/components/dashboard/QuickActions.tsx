
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, Activity, Calculator, MessageCircle, 
  Database, Settings, Zap
} from "lucide-react";

interface QuickActionsProps {
  onNavigate: (view: string) => void;
}

const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  const actions = [
    {
      icon: Calendar,
      label: "Create Schedule",
      action: () => onNavigate("schedules"),
      color: "hover:bg-green-50 hover:border-green-200"
    },
    {
      icon: Activity,
      label: "Soil Monitoring",
      action: () => onNavigate("monitoring"),
      color: "hover:bg-blue-50 hover:border-blue-200"
    },
    {
      icon: Calculator,
      label: "Cost Calculator",
      action: () => onNavigate("costs"),
      color: "hover:bg-purple-50 hover:border-purple-200"
    },
    {
      icon: MessageCircle,
      label: "Community",
      action: () => onNavigate("community"),
      color: "hover:bg-orange-50 hover:border-orange-200"
    },
    {
      icon: Database,
      label: "Data Management",
      action: () => onNavigate("data-management"),
      color: "hover:bg-indigo-50 hover:border-indigo-200"
    },
    {
      icon: Settings,
      label: "Settings",
      action: () => onNavigate("settings"),
      color: "hover:bg-gray-50 hover:border-gray-200"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, index) => (
          <Button 
            key={index}
            variant="outline" 
            className={`w-full justify-start ${action.color}`}
            onClick={action.action}
          >
            <action.icon className="h-4 w-4 mr-3" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
