
// Cost calculator service for irrigation expenses
export interface CostItem {
  id: string;
  farmId: string;
  category: 'water' | 'electricity' | 'equipment' | 'labor' | 'maintenance' | 'fuel';
  description: string;
  amount: number;
  currency: string;
  date: string;
  quantity?: number;
  unitCost?: number;
  notes?: string;
}

export interface CostSummary {
  totalCost: number;
  categoryBreakdown: Record<string, number>;
  monthlyTrend: Array<{ month: string; cost: number }>;
  costPerAcre: number;
  costPerCrop: Record<string, number>;
}

export interface BudgetPlan {
  id: string;
  farmId: string;
  name: string;
  totalBudget: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  categories: Record<string, number>;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

class CostCalculatorService {
  private storagePrefix = 'aquawise_costs_';

  // Cost tracking
  addCostItem(item: CostItem): void {
    const costs = this.getCostItems(item.farmId);
    costs.push(item);
    localStorage.setItem(`${this.storagePrefix}items_${item.farmId}`, JSON.stringify(costs));
  }

  getCostItems(farmId: string, days: number = 365): CostItem[] {
    const costsData = localStorage.getItem(`${this.storagePrefix}items_${farmId}`);
    const costs = costsData ? JSON.parse(costsData) : [];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return costs.filter((cost: CostItem) => 
      new Date(cost.date) >= cutoffDate
    );
  }

  deleteCostItem(farmId: string, itemId: string): void {
    const costs = this.getCostItems(farmId).filter(item => item.id !== itemId);
    localStorage.setItem(`${this.storagePrefix}items_${farmId}`, JSON.stringify(costs));
  }

  // Cost analysis
  calculateCostSummary(farmId: string, days: number = 30): CostSummary {
    const costs = this.getCostItems(farmId, days);
    const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);
    
    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    costs.forEach(cost => {
      categoryBreakdown[cost.category] = (categoryBreakdown[cost.category] || 0) + cost.amount;
    });
    
    // Monthly trend (last 12 months)
    const monthlyTrend = this.calculateMonthlyTrend(farmId);
    
    // Cost per acre (assuming farm size is available)
    const farmSize = this.getFarmSize(farmId);
    const costPerAcre = farmSize > 0 ? totalCost / farmSize : 0;
    
    // Cost per crop
    const costPerCrop = this.calculateCostPerCrop(farmId, days);
    
    return {
      totalCost,
      categoryBreakdown,
      monthlyTrend,
      costPerAcre,
      costPerCrop
    };
  }

  private calculateMonthlyTrend(farmId: string): Array<{ month: string; cost: number }> {
    const costs = this.getCostItems(farmId, 365);
    const monthlyData: Record<string, number> = {};
    
    costs.forEach(cost => {
      const month = new Date(cost.date).toISOString().slice(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + cost.amount;
    });
    
    return Object.entries(monthlyData)
      .map(([month, cost]) => ({ month, cost }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }

  private calculateCostPerCrop(farmId: string, days: number): Record<string, number> {
    // This would integrate with farm data to get crop information
    // For now, return empty object
    return {};
  }

  private getFarmSize(farmId: string): number {
    // This would integrate with farm data service
    // For now, return default size
    return 2; // 2 acres default
  }

  // Budget planning
  createBudgetPlan(plan: BudgetPlan): void {
    const plans = this.getBudgetPlans(plan.farmId);
    plans.push(plan);
    localStorage.setItem(`${this.storagePrefix}budgets_${plan.farmId}`, JSON.stringify(plans));
  }

  getBudgetPlans(farmId: string): BudgetPlan[] {
    const plansData = localStorage.getItem(`${this.storagePrefix}budgets_${farmId}`);
    return plansData ? JSON.parse(plansData) : [];
  }

  getActiveBudgetPlan(farmId: string): BudgetPlan | null {
    const plans = this.getBudgetPlans(farmId);
    return plans.find(plan => plan.isActive) || null;
  }

  updateBudgetPlan(farmId: string, planId: string, updates: Partial<BudgetPlan>): void {
    const plans = this.getBudgetPlans(farmId);
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex >= 0) {
      plans[planIndex] = { ...plans[planIndex], ...updates };
      localStorage.setItem(`${this.storagePrefix}budgets_${farmId}`, JSON.stringify(plans));
    }
  }

  // Cost prediction
  predictMonthlyCosts(farmId: string): number {
    const recentCosts = this.getCostItems(farmId, 90); // Last 3 months
    const totalCost = recentCosts.reduce((sum, cost) => sum + cost.amount, 0);
    return totalCost / 3; // Average monthly cost
  }

  // ROI calculation
  calculateROI(farmId: string, revenue: number, days: number = 365): {
    totalCosts: number;
    revenue: number;
    profit: number;
    roi: number;
  } {
    const costs = this.getCostItems(farmId, days);
    const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
    const profit = revenue - totalCosts;
    const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
    
    return {
      totalCosts,
      revenue,
      profit,
      roi
    };
  }

  // Export costs to CSV
  exportCosts(farmId: string, days: number = 365): string {
    const costs = this.getCostItems(farmId, days);
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Currency', 'Notes'];
    
    const csvContent = [
      headers.join(','),
      ...costs.map(cost => [
        cost.date,
        cost.category,
        `"${cost.description}"`,
        cost.amount,
        cost.currency,
        `"${cost.notes || ''}"`
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
}

export const costCalculatorService = new CostCalculatorService();
