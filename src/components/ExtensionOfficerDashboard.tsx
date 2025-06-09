
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserCheck, Users, AlertTriangle, Calendar, MapPin, Phone, 
  Mail, CheckCircle, Clock, TrendingUp, FileText, Send
} from "lucide-react";
import { dataService, Farm } from "@/services/dataService";
import { communityService, CommunityPost } from "@/services/communityService";
import { locations } from "@/components/farmer-registration/constants";
import { useToast } from "@/hooks/use-toast";

interface FarmVisit {
  id: string;
  farmId: string;
  farmName: string;
  farmerName: string;
  location: string;
  purpose: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledDate: string;
  notes?: string;
  recommendations?: string;
}

interface ExtensionAlert {
  id: string;
  type: 'pest' | 'disease' | 'weather' | 'technical' | 'emergency';
  title: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
  createdAt: string;
  reportedBy: string;
}

const ExtensionOfficerDashboard = () => {
  const { toast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [visits, setVisits] = useState<FarmVisit[]>([]);
  const [alerts, setAlerts] = useState<ExtensionAlert[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLocation, setSelectedLocation] = useState('all');

  const [newVisit, setNewVisit] = useState({
    farmId: '',
    purpose: '',
    scheduledDate: '',
    notes: ''
  });

  const [newAlert, setNewAlert] = useState({
    type: '',
    title: '',
    description: '',
    location: '',
    severity: 'medium'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    
    // Load farms
    const farmsData = dataService.getFarms();
    setFarms(farmsData);
    
    // Load community posts (filter for problems/questions)
    const posts = communityService.getAllPosts()
      .filter(post => ['problems', 'question'].includes(post.category));
    setCommunityPosts(posts);
    
    // Load sample visits and alerts
    setVisits(getSampleVisits());
    setAlerts(getSampleAlerts());
    
    setLoading(false);
  };

  const getSampleVisits = (): FarmVisit[] => {
    return [
      {
        id: '1',
        farmId: 'farm1',
        farmName: 'Ochieng Farm',
        farmerName: 'John Ochieng',
        location: 'Rachuonyo North',
        purpose: 'Irrigation system inspection',
        status: 'scheduled',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Follow up on drip irrigation installation'
      },
      {
        id: '2',
        farmId: 'farm2',
        farmName: 'Akinyi Gardens',
        farmerName: 'Mary Akinyi',
        location: 'Homa Bay Town',
        purpose: 'Disease diagnosis',
        status: 'completed',
        scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        recommendations: 'Applied fungicide treatment, recommended improved drainage'
      }
    ];
  };

  const getSampleAlerts = (): ExtensionAlert[] => {
    return [
      {
        id: '1',
        type: 'disease',
        title: 'Leaf Blight Outbreak in Maize',
        description: 'Multiple farmers in Rachuonyo North reporting brown spots on maize leaves',
        location: 'Rachuonyo North',
        severity: 'high',
        status: 'active',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        reportedBy: 'Multiple farmers'
      },
      {
        id: '2',
        type: 'weather',
        title: 'Heavy Rainfall Warning',
        description: 'Expected heavy rains may affect irrigation schedules this week',
        location: 'Homa Bay County',
        severity: 'medium',
        status: 'active',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        reportedBy: 'Weather Service'
      }
    ];
  };

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVisit.farmId || !newVisit.purpose || !newVisit.scheduledDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const selectedFarm = farms.find(f => f.id === newVisit.farmId);
    if (!selectedFarm) return;

    const visit: FarmVisit = {
      id: Date.now().toString(),
      farmId: newVisit.farmId,
      farmName: selectedFarm.name,
      farmerName: selectedFarm.farmerName,
      location: selectedFarm.location,
      purpose: newVisit.purpose,
      status: 'scheduled',
      scheduledDate: newVisit.scheduledDate,
      notes: newVisit.notes
    };

    setVisits(prev => [visit, ...prev]);
    setNewVisit({ farmId: '', purpose: '', scheduledDate: '', notes: '' });

    toast({
      title: "Visit Scheduled",
      description: `Farm visit scheduled for ${selectedFarm.farmerName}`,
    });
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAlert.type || !newAlert.title || !newAlert.description || !newAlert.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const alert: ExtensionAlert = {
      id: Date.now().toString(),
      type: newAlert.type as any,
      title: newAlert.title,
      description: newAlert.description,
      location: newAlert.location,
      severity: newAlert.severity as any,
      status: 'active',
      createdAt: new Date().toISOString(),
      reportedBy: 'Extension Officer'
    };

    setAlerts(prev => [alert, ...prev]);
    setNewAlert({ type: '', title: '', description: '', location: '', severity: 'medium' });

    toast({
      title: "Alert Created",
      description: "Extension alert has been broadcasted to farmers",
    });
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));

    toast({
      title: "Alert Resolved",
      description: "Alert status updated to resolved",
    });
  };

  const completeVisit = (visitId: string) => {
    setVisits(prev => prev.map(visit => 
      visit.id === visitId ? { ...visit, status: 'completed' } : visit
    ));

    toast({
      title: "Visit Completed",
      description: "Farm visit marked as completed",
    });
  };

  const getFilteredFarms = () => {
    if (selectedLocation === 'all') return farms;
    return farms.filter(farm => farm.location === selectedLocation);
  };

  const getStatusColor = (status: string, type: 'visit' | 'alert') => {
    if (type === 'visit') {
      switch (status) {
        case 'scheduled': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'active': return 'bg-orange-100 text-orange-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <UserCheck className="h-8 w-8 animate-pulse text-green-500" />
        </CardContent>
      </Card>
    );
  }

  const stats = {
    totalFarms: farms.length,
    activeAlerts: alerts.filter(a => a.status === 'active').length,
    scheduledVisits: visits.filter(v => v.status === 'scheduled').length,
    recentPosts: communityPosts.length
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-green-600" />
            Extension Officer Dashboard
          </CardTitle>
          <CardDescription>Manage farmer support and agricultural extension services</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="farms">Farms</TabsTrigger>
              <TabsTrigger value="visits">Visits</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Total Farms</h3>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalFarms}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800">Active Alerts</h3>
                  <p className="text-2xl font-bold text-orange-900">{stats.activeAlerts}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800">Scheduled Visits</h3>
                  <p className="text-2xl font-bold text-green-900">{stats.scheduledVisits}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800">Help Requests</h3>
                  <p className="text-2xl font-bold text-purple-900">{stats.recentPosts}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {alerts.filter(a => a.status === 'active').slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg mb-3">
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-gray-600">{alert.location}</p>
                        </div>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Upcoming Visits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Visits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {visits.filter(v => v.status === 'scheduled').slice(0, 3).map((visit) => (
                      <div key={visit.id} className="flex items-center justify-between p-3 border rounded-lg mb-3">
                        <div>
                          <h4 className="font-medium">{visit.farmerName}</h4>
                          <p className="text-sm text-gray-600">{visit.purpose}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(visit.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          Scheduled
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Farms Tab */}
            <TabsContent value="farms">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label>Filter by Location:</Label>
                  <Select onValueChange={setSelectedLocation} defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredFarms().map((farm) => (
                    <Card key={farm.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{farm.name}</h4>
                            <Badge variant="outline">Active</Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{farm.farmerName}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{farm.location}</span>
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{farm.size} acres</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setNewVisit(prev => ({ ...prev, farmId: farm.id }));
                                setActiveTab("visits");
                              }}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Visit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Visits Tab */}
            <TabsContent value="visits">
              <div className="space-y-6">
                {/* Schedule New Visit */}
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Farm Visit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleScheduleVisit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Farm *</Label>
                        <Select onValueChange={(value) => setNewVisit(prev => ({...prev, farmId: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select farm" />
                          </SelectTrigger>
                          <SelectContent>
                            {farms.map((farm) => (
                              <SelectItem key={farm.id} value={farm.id}>
                                {farm.name} - {farm.farmerName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Purpose *</Label>
                        <Input
                          value={newVisit.purpose}
                          onChange={(e) => setNewVisit(prev => ({...prev, purpose: e.target.value}))}
                          placeholder="e.g., Irrigation inspection"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Date *</Label>
                        <Input
                          type="datetime-local"
                          value={newVisit.scheduledDate}
                          onChange={(e) => setNewVisit(prev => ({...prev, scheduledDate: e.target.value}))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={newVisit.notes}
                          onChange={(e) => setNewVisit(prev => ({...prev, notes: e.target.value}))}
                          placeholder="Additional notes..."
                          rows={2}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Button type="submit">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Visit
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Visits List */}
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <Card key={visit.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-4">
                              <h4 className="font-semibold">{visit.farmerName}</h4>
                              <Badge className={getStatusColor(visit.status, 'visit')}>
                                {visit.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600">{visit.purpose}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{new Date(visit.scheduledDate).toLocaleString()}</span>
                              <span className="mx-2">•</span>
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{visit.location}</span>
                            </div>
                            {visit.notes && (
                              <p className="text-sm text-gray-600">Notes: {visit.notes}</p>
                            )}
                            {visit.recommendations && (
                              <p className="text-sm text-green-600">Recommendations: {visit.recommendations}</p>
                            )}
                          </div>
                          {visit.status === 'scheduled' && (
                            <Button
                              size="sm"
                              onClick={() => completeVisit(visit.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts">
              <div className="space-y-6">
                {/* Create New Alert */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create Extension Alert</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateAlert} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Alert Type *</Label>
                          <Select onValueChange={(value) => setNewAlert(prev => ({...prev, type: value}))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pest">Pest Alert</SelectItem>
                              <SelectItem value="disease">Disease Alert</SelectItem>
                              <SelectItem value="weather">Weather Alert</SelectItem>
                              <SelectItem value="technical">Technical Advisory</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Severity *</Label>
                          <Select onValueChange={(value) => setNewAlert(prev => ({...prev, severity: value}))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input
                            value={newAlert.title}
                            onChange={(e) => setNewAlert(prev => ({...prev, title: e.target.value}))}
                            placeholder="Alert title"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Location *</Label>
                          <Select onValueChange={(value) => setNewAlert(prev => ({...prev, location: value}))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Homa Bay County">Entire County</SelectItem>
                              {locations.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={newAlert.description}
                          onChange={(e) => setNewAlert(prev => ({...prev, description: e.target.value}))}
                          placeholder="Detailed description of the alert..."
                          rows={3}
                          required
                        />
                      </div>

                      <Button type="submit">
                        <Send className="h-4 w-4 mr-2" />
                        Broadcast Alert
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Alerts List */}
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className="border-l-4 border-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-semibold">{alert.title}</h4>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge className={getStatusColor(alert.status, 'alert')}>
                                {alert.status}
                              </Badge>
                            </div>
                            <p className="text-gray-700">{alert.description}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{alert.location}</span>
                              <span className="mx-2">•</span>
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{new Date(alert.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                          {alert.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Farmer Help Requests</CardTitle>
                    <CardDescription>Posts from farmers seeking assistance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {communityPosts.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Help Requests</h3>
                        <p className="text-gray-600">Farmer help requests will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {communityPosts.map((post) => (
                          <Card key={post.id} className="border-blue-200">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold">{post.title}</h4>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {post.category}
                                  </Badge>
                                </div>
                                <p className="text-gray-700">{post.content}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Users className="h-4 w-4 mr-1" />
                                    <span>{post.farmerName}</span>
                                    <span className="mx-2">•</span>
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>{post.location}</span>
                                  </div>
                                  <Button size="sm">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Respond
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtensionOfficerDashboard;
