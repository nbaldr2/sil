import React from 'react';
import Chart from 'react-apexcharts';

interface BaseChartProps {
  title: string;
  icon?: React.ReactNode;
  height?: number;
  className?: string;
}

interface LineChartProps extends BaseChartProps {
  data: Array<{ date: string; value: number }>;
  color?: string;
  smooth?: boolean;
  gradient?: boolean;
}

interface BarChartProps extends BaseChartProps {
  data: Array<{ category: string; value: number }>;
  colors?: string[];
  horizontal?: boolean;
}

interface PieChartProps extends BaseChartProps {
  data: Array<{ category: string; value: number }>;
  colors?: string[];
  donut?: boolean;
}

interface StackedBarChartProps extends BaseChartProps {
  series: Array<{ name: string; data: number[] }>;
  categories: string[];
  colors?: string[];
}

interface HeatmapChartProps extends BaseChartProps {
  series: Array<{ name: string; data: number[] }>;
  categories: string[];
  color?: string;
}

interface ScatterChartProps extends BaseChartProps {
  data: Array<[number, number]>;
  xAxisTitle?: string;
  yAxisTitle?: string;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  title,
  icon,
  data,
  height = 300,
  color = '#3B82F6',
  smooth = true,
  gradient = true,
  className = ''
}) => {
  const options = {
    chart: {
      id: `line-${title.replace(/\s+/g, '-').toLowerCase()}`,
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: { mode: 'light' as const },
    xaxis: {
      categories: data.map(d => new Date(d.date).toLocaleDateString()),
      labels: { style: { colors: '#6B7280' } }
    },
    yaxis: {
      labels: { style: { colors: '#6B7280' } }
    },
    colors: [color],
    stroke: {
      curve: smooth ? 'smooth' as const : 'straight' as const,
      width: 3
    },
    fill: gradient ? {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      }
    } : undefined,
    grid: { borderColor: '#E5E7EB' }
  };

  const series = [{
    name: title,
    data: data.map(d => d.value)
  }];

  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="flex items-center mb-4">
        {icon && <div className="mr-2">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <Chart options={options} series={series} type="area" height={height} />
    </div>
  );
};

export const BarChart: React.FC<BarChartProps> = ({
  title,
  icon,
  data,
  height = 300,
  colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  horizontal = false,
  className = ''
}) => {
  const options = {
    chart: {
      id: `bar-${title.replace(/\s+/g, '-').toLowerCase()}`,
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: { mode: 'light' as const },
    xaxis: {
      categories: data.map(d => d.category),
      labels: { style: { colors: '#6B7280' } }
    },
    yaxis: {
      labels: { style: { colors: '#6B7280' } }
    },
    colors,
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal,
      }
    },
    grid: { borderColor: '#E5E7EB' }
  };

  const series = [{
    name: title,
    data: data.map(d => d.value)
  }];

  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="flex items-center mb-4">
        {icon && <div className="mr-2">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <Chart options={options} series={series} type="bar" height={height} />
    </div>
  );
};

export const PieChart: React.FC<PieChartProps> = ({
  title,
  icon,
  data,
  height = 300,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  donut = true,
  className = ''
}) => {
  const options = {
    chart: {
      type: donut ? 'donut' as const : 'pie' as const,
      background: 'transparent'
    },
    theme: { mode: 'light' as const },
    labels: data.map(d => d.category),
    colors,
    legend: {
      position: 'bottom' as const,
      labels: { colors: '#6B7280' }
    },
    plotOptions: donut ? {
      pie: {
        donut: { size: '70%' }
      }
    } : undefined
  };

  const series = data.map(d => d.value);

  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="flex items-center mb-4">
        {icon && <div className="mr-2">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <Chart options={options} series={series} type={donut ? "donut" : "pie"} height={height} />
    </div>
  );
};

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  title,
  icon,
  series,
  categories,
  height = 350,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  className = ''
}) => {
  const options = {
    chart: {
      type: 'bar' as const,
      stacked: true,
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: { mode: 'light' as const },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4
      }
    },
    xaxis: {
      categories,
      labels: { style: { colors: '#6B7280' } }
    },
    yaxis: {
      labels: { style: { colors: '#6B7280' } }
    },
    colors,
    legend: {
      position: 'top' as const,
      labels: { colors: '#6B7280' }
    },
    grid: { borderColor: '#E5E7EB' }
  };

  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="flex items-center mb-4">
        {icon && <div className="mr-2">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <Chart options={options} series={series} type="bar" height={height} />
    </div>
  );
};

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  title,
  icon,
  series,
  categories,
  height = 300,
  color = '#3B82F6',
  className = ''
}) => {
  const options = {
    chart: {
      type: 'heatmap' as const,
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: { mode: 'light' as const },
    xaxis: {
      categories,
      labels: { style: { colors: '#6B7280' } }
    },
    yaxis: {
      labels: { style: { colors: '#6B7280' } }
    },
    colors: [color],
    grid: { borderColor: '#E5E7EB' }
  };

  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="flex items-center mb-4">
        {icon && <div className="mr-2">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <Chart options={options} series={series} type="heatmap" height={height} />
    </div>
  );
};

export const ScatterChart: React.FC<ScatterChartProps> = ({
  title,
  icon,
  data,
  height = 300,
  xAxisTitle = 'X Axis',
  yAxisTitle = 'Y Axis',
  color = '#EF4444',
  className = ''
}) => {
  const options = {
    chart: {
      type: 'scatter' as const,
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: { mode: 'light' as const },
    xaxis: {
      title: { text: xAxisTitle },
      labels: { style: { colors: '#6B7280' } }
    },
    yaxis: {
      title: { text: yAxisTitle },
      labels: { style: { colors: '#6B7280' } }
    },
    colors: [color],
    grid: { borderColor: '#E5E7EB' }
  };

  const series = [{
    name: title,
    data
  }];

  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="flex items-center mb-4">
        {icon && <div className="mr-2">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <Chart options={options} series={series} type="scatter" height={height} />
    </div>
  );
};

export const PredictiveChart: React.FC<{
  title: string;
  icon?: React.ReactNode;
  actualData: number[];
  forecastData: (number | null)[];
  categories: string[];
  height?: number;
  className?: string;
}> = ({
  title,
  icon,
  actualData,
  forecastData,
  categories,
  height = 400,
  className = ''
}) => {
  const options = {
    chart: {
      type: 'line' as const,
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: { mode: 'light' as const },
    xaxis: {
      categories,
      labels: { style: { colors: '#6B7280' } }
    },
    yaxis: {
      labels: { style: { colors: '#6B7280' } }
    },
    colors: ['#3B82F6', '#F59E0B'],
    stroke: {
      curve: 'smooth' as const,
      width: [3, 2],
      dashArray: [0, 5]
    },
    grid: { borderColor: '#E5E7EB' },
    legend: {
      labels: { colors: '#6B7280' }
    }
  };

  const series = [
    { name: 'Actual', data: actualData },
    { name: 'Forecast', data: forecastData }
  ];

  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="flex items-center mb-4">
        {icon && <div className="mr-2">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <Chart options={options} series={series} type="line" height={height} />
    </div>
  );
};

// KPI Card Component
export const KPICard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
    label: string;
  };
  className?: string;
}> = ({ title, value, unit, icon, trend, className = '' }) => {
  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}{unit && <span className="text-sm ml-1">{unit}</span>}
          </div>
          {trend && (
            <div className={`text-xs flex items-center ${getTrendColor(trend.direction)}`}>
              <span className="mr-1">{getTrendIcon(trend.direction)}</span>
              {trend.value} {trend.label}
            </div>
          )}
        </div>
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};