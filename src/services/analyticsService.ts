// Analytics Service for demo data and calculations
export interface AnalyticsData {
  kpis: KPIData[];
  charts: ChartData[];
  insights: InsightData[];
}

export interface KPIData {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: string;
  target?: number;
  description?: string;
}

export interface ChartData {
  id: string;
  name: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'doughnut';
  data: any[];
  period: string;
  category: string;
}

export interface InsightData {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: string;
}

class AnalyticsService {
  // Generate demo KPI data
  generateKPIData(period: string = '7d'): KPIData[] {
    const baseMultiplier = this.getPeriodMultiplier(period);
    
    return [
      {
        id: 'total-tests',
        name: 'Total Tests',
        value: Math.floor(1247 * baseMultiplier),
        previousValue: Math.floor(1156 * baseMultiplier),
        unit: '',
        trend: 'up',
        category: 'performance',
        target: Math.floor(1300 * baseMultiplier),
        description: 'Total number of laboratory tests performed'
      },
      {
        id: 'completed-tests',
        name: 'Completed Tests',
        value: Math.floor(1189 * baseMultiplier),
        previousValue: Math.floor(1098 * baseMultiplier),
        unit: '',
        trend: 'up',
        category: 'performance',
        description: 'Tests that have been completed and validated'
      },
      {
        id: 'pending-tests',
        name: 'Pending Tests',
        value: Math.floor(58 * baseMultiplier),
        previousValue: Math.floor(58 * baseMultiplier),
        unit: '',
        trend: 'stable',
        category: 'performance',
        description: 'Tests waiting for processing or validation'
      },
      {
        id: 'average-time',
        name: 'Average Processing Time',
        value: 24.5,
        previousValue: 26.2,
        unit: 'min',
        trend: 'down', // Down is good for processing time
        category: 'efficiency',
        target: 22,
        description: 'Average time to complete a test from start to finish'
      },
      {
        id: 'efficiency',
        name: 'Lab Efficiency',
        value: 95.3,
        previousValue: 94.1,
        unit: '%',
        trend: 'up',
        category: 'efficiency',
        target: 96,
        description: 'Overall laboratory efficiency score'
      },
      {
        id: 'revenue',
        name: 'Revenue',
        value: Math.floor(45680 * baseMultiplier),
        previousValue: Math.floor(42150 * baseMultiplier),
        unit: 'MAD',
        trend: 'up',
        category: 'financial',
        description: 'Total revenue generated from laboratory services'
      },
      {
        id: 'patient-satisfaction',
        name: 'Patient Satisfaction',
        value: 4.7,
        previousValue: 4.5,
        unit: '/5',
        trend: 'up',
        category: 'quality',
        target: 4.8,
        description: 'Average patient satisfaction rating'
      },
      {
        id: 'error-rate',
        name: 'Error Rate',
        value: 0.8,
        previousValue: 1.2,
        unit: '%',
        trend: 'down', // Down is good for error rate
        category: 'quality',
        target: 0.5,
        description: 'Percentage of tests with errors or requiring retesting'
      }
    ];
  }

  // Generate demo chart data
  generateChartData(period: string = '7d'): ChartData[] {
    const days = this.getPeriodDays(period);
    
    return [
      {
        id: 'tests-trend',
        name: 'Tests per Day',
        type: 'line',
        data: this.generateTimeSeriesData(days, 45, 70),
        period,
        category: 'performance'
      },
      {
        id: 'test-categories',
        name: 'Test Categories Distribution',
        type: 'pie',
        data: [
          { category: 'Hematology', value: 35, color: '#3B82F6' },
          { category: 'Biochemistry', value: 28, color: '#10B981' },
          { category: 'Microbiology', value: 22, color: '#F59E0B' },
          { category: 'Immunology', value: 15, color: '#EF4444' }
        ],
        period,
        category: 'distribution'
      },
      {
        id: 'revenue-trend',
        name: 'Daily Revenue',
        type: 'bar',
        data: this.generateTimeSeriesData(days, 1500, 2500, 'revenue'),
        period,
        category: 'financial'
      },
      {
        id: 'efficiency-trend',
        name: 'Lab Efficiency Over Time',
        type: 'area',
        data: this.generateTimeSeriesData(days, 92, 98, 'efficiency'),
        period,
        category: 'efficiency'
      },
      {
        id: 'department-performance',
        name: 'Department Performance',
        type: 'bar',
        data: [
          { department: 'Hematology', efficiency: 96.5, tests: 450 },
          { department: 'Biochemistry', efficiency: 94.2, tests: 380 },
          { department: 'Microbiology', efficiency: 92.8, tests: 290 },
          { department: 'Immunology', efficiency: 97.1, tests: 180 }
        ],
        period,
        category: 'performance'
      }
    ];
  }

  // Generate insights based on data
  generateInsights(kpis: KPIData[]): InsightData[] {
    const insights: InsightData[] = [];

    // Analyze trends and generate insights
    const efficiencyKPI = kpis.find(k => k.id === 'efficiency');
    if (efficiencyKPI && efficiencyKPI.trend === 'up') {
      insights.push({
        id: 'efficiency-improvement',
        title: 'Lab Efficiency Improving',
        description: `Lab efficiency has increased by ${this.calculatePercentageChange(efficiencyKPI.value, efficiencyKPI.previousValue)}% compared to the previous period.`,
        type: 'positive',
        priority: 'medium',
        actionable: false
      });
    }

    const errorRateKPI = kpis.find(k => k.id === 'error-rate');
    if (errorRateKPI && errorRateKPI.value > 1.0) {
      insights.push({
        id: 'high-error-rate',
        title: 'Error Rate Above Target',
        description: `Current error rate of ${errorRateKPI.value}% is above the target of ${errorRateKPI.target}%.`,
        type: 'warning',
        priority: 'high',
        actionable: true,
        recommendation: 'Review quality control procedures and provide additional staff training.'
      });
    }

    const revenueKPI = kpis.find(k => k.id === 'revenue');
    if (revenueKPI && revenueKPI.trend === 'up') {
      insights.push({
        id: 'revenue-growth',
        title: 'Strong Revenue Growth',
        description: `Revenue has increased by ${this.calculatePercentageChange(revenueKPI.value, revenueKPI.previousValue)}% this period.`,
        type: 'positive',
        priority: 'medium',
        actionable: false
      });
    }

    const processingTimeKPI = kpis.find(k => k.id === 'average-time');
    if (processingTimeKPI && processingTimeKPI.value < (processingTimeKPI.target || 25)) {
      insights.push({
        id: 'processing-time-optimal',
        title: 'Processing Time Below Target',
        description: `Average processing time of ${processingTimeKPI.value} minutes is below the target of ${processingTimeKPI.target} minutes.`,
        type: 'positive',
        priority: 'low',
        actionable: false
      });
    }

    return insights;
  }

  // Helper methods
  private getPeriodMultiplier(period: string): number {
    switch (period) {
      case '7d': return 1;
      case '30d': return 4.3;
      case '90d': return 12.9;
      case '1y': return 52.1;
      default: return 1;
    }
  }

  private getPeriodDays(period: string): number {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 7;
    }
  }

  private generateTimeSeriesData(days: number, min: number, max: number, type: string = 'count'): any[] {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      let value = Math.floor(Math.random() * (max - min + 1)) + min;
      
      // Add some realistic patterns
      if (type === 'efficiency') {
        // Efficiency tends to be higher on weekdays
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
          value = Math.max(min, value - 2);
        }
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        value,
        label: date.toLocaleDateString()
      });
    }
    
    return data;
  }

  private calculatePercentageChange(current: number, previous: number): string {
    if (previous === 0) return '0.0';
    return ((current - previous) / previous * 100).toFixed(1);
  }

  // Main method to get all analytics data
  async getAnalyticsData(period: string = '7d'): Promise<AnalyticsData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const kpis = this.generateKPIData(period);
    const charts = this.generateChartData(period);
    const insights = this.generateInsights(kpis);
    
    return {
      kpis,
      charts,
      insights
    };
  }

  // Export data functionality
  async exportData(format: 'csv' | 'excel' | 'pdf', data: AnalyticsData): Promise<Blob> {
    // Simulate export processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let content = '';
    let mimeType = '';
    
    switch (format) {
      case 'csv':
        content = this.generateCSV(data);
        mimeType = 'text/csv';
        break;
      case 'excel':
        content = 'Excel export would be implemented here';
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'pdf':
        content = 'PDF export would be implemented here';
        mimeType = 'application/pdf';
        break;
    }
    
    return new Blob([content], { type: mimeType });
  }

  private generateCSV(data: AnalyticsData): string {
    let csv = 'KPI Name,Current Value,Previous Value,Unit,Trend,Category\n';
    
    data.kpis.forEach(kpi => {
      csv += `"${kpi.name}",${kpi.value},${kpi.previousValue},"${kpi.unit}","${kpi.trend}","${kpi.category}"\n`;
    });
    
    return csv;
  }
}

export const analyticsService = new AnalyticsService();