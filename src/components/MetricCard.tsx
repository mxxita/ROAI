import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './ui/Card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    isPositive: boolean;
  };
  sparklineData?: number[];
  icon?: LucideIcon;
  onClick?: () => void;
}

export function MetricCard({ title, value, trend, sparklineData, icon: Icon, onClick }: MetricCardProps) {
  return (
    <Card
      className={cn('p-6', onClick && 'cursor-pointer hover:shadow-elevated transition-shadow')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1 flex-1">
          <p className="text-sm text-muted font-medium">{title}</p>
          <p className="text-3xl font-bold tabular-nums animate-count-up">{value}</p>
        </div>
        {Icon && (
          <div className="p-2 bg-accent-blue/10 rounded-md">
            <Icon className="w-5 h-5 text-accent-blue" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            trend.isPositive ? 'text-accent-emerald' : 'text-accent-rose'
          )}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}

        {sparklineData && sparklineData.length > 0 && (
          <div className="flex-1 ml-4">
            <Sparkline data={sparklineData} />
          </div>
        )}
      </div>
    </Card>
  );
}

interface SparklineProps {
  data: number[];
}

function Sparkline({ data }: SparklineProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const width = 100;
  const height = 24;
  const step = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="sparkline">
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--accent-blue))"
        strokeWidth="2"
        className="sparkline-path"
      />
    </svg>
  );
}
