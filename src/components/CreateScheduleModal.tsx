
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Droplets, Clock, Calendar } from "lucide-react";

interface CreateScheduleModalProps {
  onScheduleCreated: () => void;
}

const CreateScheduleModal = ({ onScheduleCreated }: CreateScheduleModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    farmId: "",
    cropId: "",
    frequency: "",
    duration: "",
    bestTime: "",
    startDate: "",
    notes: ""
  });

  const [farms, setFarms] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);

  // Load farms and crops when modal opens
  const loadFarmsAndCrops = async () => {
    if (!user) return;

    try {
      const { data: farmsData, error: farmsError } = await supabase
        .from('farms')
        .select('*')
        .eq('farmer_id', user.id);

      if (farmsError) throw farmsError;
      setFarms(farmsData || []);

      if (farmsData && farmsData.length > 0) {
        const { data: cropsData, error: cropsError } = await supabase
          .from('crops')
          .select('*')
          .in('farm_id', farmsData.map(f => f.id));

        if (cropsError) throw cropsError;
        setCrops(cropsData || []);
      }
    } catch (error) {
      console.error('Error loading farms and crops:', error);
      toast({
        title: "Error",
        description: "Failed to load farms and crops",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Calculate next irrigation date
      const startDate = new Date(formData.startDate);
      const nextIrrigation = new Date(startDate);
      
      // Set the time
      const [hours, minutes] = formData.bestTime.split(':').map(Number);
      nextIrrigation.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from('irrigation_schedules')
        .insert({
          farm_id: formData.farmId,
          crop_id: formData.cropId,
          frequency: parseInt(formData.frequency),
          duration: parseInt(formData.duration),
          best_time: formData.bestTime,
          next_irrigation: nextIrrigation.toISOString(),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Schedule Created",
        description: "Irrigation schedule has been created successfully",
      });

      setFormData({
        farmId: "",
        cropId: "",
        frequency: "",
        duration: "",
        bestTime: "",
        startDate: "",
        notes: ""
      });
      
      setOpen(false);
      onScheduleCreated();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create irrigation schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCrops = crops.filter(crop => crop.farm_id === formData.farmId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={loadFarmsAndCrops}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-green-600" />
            Create Irrigation Schedule
          </DialogTitle>
          <DialogDescription>
            Set up an automated irrigation schedule for your crops
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farm">Farm *</Label>
              <Select
                value={formData.farmId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, farmId: value, cropId: "" }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select farm" />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      {farm.name} - {farm.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crop">Crop *</Label>
              <Select
                value={formData.cropId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, cropId: value }))}
                required
                disabled={!formData.farmId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCrops.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id}>
                      {crop.name} ({crop.area} acres)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency (days) *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Every X days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Every day</SelectItem>
                  <SelectItem value="2">Every 2 days</SelectItem>
                  <SelectItem value="3">Every 3 days</SelectItem>
                  <SelectItem value="4">Every 4 days</SelectItem>
                  <SelectItem value="5">Every 5 days</SelectItem>
                  <SelectItem value="7">Weekly</SelectItem>
                  <SelectItem value="14">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="30"
                min="1"
                max="480"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bestTime">Best Time *</Label>
              <Input
                type="time"
                value={formData.bestTime}
                onChange={(e) => setFormData(prev => ({ ...prev, bestTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {farms.length === 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <p className="text-orange-800 text-sm">
                  You need to register at least one farm before creating irrigation schedules.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={loading || farms.length === 0}
            >
              {loading ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateScheduleModal;
