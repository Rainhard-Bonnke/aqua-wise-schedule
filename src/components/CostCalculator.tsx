
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, Download, Plus, Trash2 } from "lucide-react";
import { costCalculatorService, CostItem, CostSummary } from "@/services/costCalculatorService";
import { useToast } from "@/hooks/use-toast";

interface CostCalculatorProps {
  farmId: string;
}

const CostCalculator = ({ farmId }: CostCalculatorProps) => {
  const { toast } = useToast();
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newCost, setNewCost] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const costCategories = [
    { value: 'water', label: 'Water Bills', icon: '💧' },
    { value: 'electricity', label: 'Electricity', icon: '⚡' },
    { value: 'equipment', label: 'Equipment', icon: '🔧' },
    { value: 'labor', label: 'Labor', icon: '👷' },
    { value: 'maintenance', label: 'Maintenance', icon: '🛠️' },
    { value: 'fuel', label: 'Fuel', icon: '⛽' }
  ];

  useEffect(() => {
    loadCostData();
  }, [farmId]);

  const loadCostData = () => {
    setLoading(true);
    
    const items = costCalculatorService.getCostItems(farmId);
    const costSummary = costCalculatorService.calculateCostSummary(farmId);
    
    setCostItems(items);
    setSummary(costSummary);
    setLoading(false);
  };

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCost.category || !newCost.description || !newCost.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const costItem: CostItem = {
      id: Date.now().toString(),
      farmId,
      category: newCost.category as any,
      description: newCost.description,
      amount: parseFloat(newCost.amount),
      currency: 'KES',
      date: newCost.date,
      notes: newCost.notes
    };

    costCalculatorService.addCostItem(costItem);
    loadCostData();
    
    setNewCost({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowAddForm(false);

    toast({
      title: "Cost Added",
      description: "Irrigation cost has been recorded successfully.",
    });
  };

  const handleDeleteCost = (itemId: string) => {
    costCalculatorService.deleteCostItem(farmId, itemId);
    loadCostData();
    
    toast({
      title: "Cost Deleted",
      description: "Cost item has been removed.",
    });
  };

  const exportCosts = () => {
    const csvContent = costCalculatorService.exportCosts(farmId);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `irrigation-costs-${farmId}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Cost data has been exported to CSV file.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Calculator className="h-8 w-8 animate-pulse text-green-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-green-600" />
                Irrigation Cost Calculator
              </CardTitle>
              <CardDescription>Track and analyze your irrigation expenses</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportCosts} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Cost
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="items">All Items</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary">
              {summary && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800">Total Costs (30 days)</h3>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(summary.totalCost)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800">Cost per Acre</h3>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(summary.costPerAcre)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-800">Daily Average</h3>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatCurrency(summary.totalCost / 30)}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-orange-800">Monthly Trend</h3>
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                        <span className="text-lg font-bold text-orange-900">
                          {summary.monthlyTrend.length > 1 ? '+5.2%' : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Breakdown Tab */}
            <TabsContent value="breakdown">
              {summary && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cost by Category</h3>
                  <div className="space-y-3">
                    {Object.entries(summary.categoryBreakdown).map(([category, amount]) => {
                      const categoryInfo = costCategories.find(c => c.value === category);
                      const percentage = summary.totalCost > 0 ? (amount / summary.totalCost) * 100 : 0;
                      
                      return (
                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{categoryInfo?.icon || '📊'}</span>
                            <div>
                              <h4 className="font-medium">{categoryInfo?.label || category}</h4>
                              <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of total</p>
                            </div>
                          </div>
                          <span className="font-bold text-lg">{formatCurrency(amount)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items">
              <div className="space-y-4">
                {costItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cost Records</h3>
                    <p className="text-gray-600">Start tracking your irrigation expenses</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {costItems.slice(0, 10).map((item) => {
                      const categoryInfo = costCategories.find(c => c.value === item.category);
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">{categoryInfo?.icon || '📊'}</span>
                            <div>
                              <h4 className="font-medium">{item.description}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(item.date).toLocaleDateString()} • {categoryInfo?.label}
                              </p>
                              {item.notes && (
                                <p className="text-sm text-gray-500">{item.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg">{formatCurrency(item.amount)}</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteCost(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Cost Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Cost</CardTitle>
            <CardDescription>Record a new irrigation expense</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setNewCost(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {costCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center">
                            <span className="mr-2">{category.icon}</span>
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newCost.amount}
                    onChange={(e) => setNewCost(prev => ({...prev, amount: e.target.value}))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={newCost.description}
                    onChange={(e) => setNewCost(prev => ({...prev, description: e.target.value}))}
                    placeholder="e.g., Monthly water bill"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newCost.date}
                    onChange={(e) => setNewCost(prev => ({...prev, date: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newCost.notes}
                  onChange={(e) => setNewCost(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <Button type="submit">Add Cost</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CostCalculator;
