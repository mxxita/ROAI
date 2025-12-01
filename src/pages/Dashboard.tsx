import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, GitBranch, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { MetricCard } from '@/components/MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';

export default function Dashboard() {
  const { eventLog, processModel, users, conformance } = useApp();
  const navigate = useNavigate();

  if (!eventLog || !processModel) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted mb-8">Welcome to ProcessMind Analytics</p>

        <EmptyState
          icon={BarChart3}
          title="No Data Loaded"
          description="Get started by uploading an event log or generating sample data to see your process analytics."
          action={
            <Button onClick={() => navigate('/event-logs')}>
              Go to Event Logs
            </Button>
          }
        />
      </div>
    );
  }

  const totalCases = eventLog.metadata.caseCount;
  const avgConformance = conformance.length > 0
    ? (conformance.reduce((sum, c) => sum + c.fitness, 0) / conformance.length) * 100
    : 0;
  const variantCount = processModel.variants.length;
  const userCount = users.length;

  // Top deviations
  const allDeviations = conformance.flatMap(c => c.deviations);
  const deviationCounts = new Map<string, number>();
  allDeviations.forEach(d => {
    const key = `${d.type}:${d.activity}`;
    deviationCounts.set(key, (deviationCounts.get(key) || 0) + 1);
  });
  const topDeviations = Array.from(deviationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted">Process mining insights at a glance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Cases"
          value={totalCases.toLocaleString()}
          icon={BarChart3}
          sparklineData={[45, 52, 48, 61, 58, 67, 73]}
          trend={{ value: 12, direction: 'up', isPositive: true }}
          onClick={() => navigate('/event-logs')}
        />
        <MetricCard
          title="Conformance Rate"
          value={`${avgConformance.toFixed(1)}%`}
          icon={CheckCircle2}
          sparklineData={[82, 85, 83, 87, 86, 88, 87]}
          trend={{ value: 3, direction: 'up', isPositive: true }}
          onClick={() => navigate('/process-map')}
        />
        <MetricCard
          title="Process Variants"
          value={variantCount}
          icon={GitBranch}
        />
        <MetricCard
          title="Active Users"
          value={userCount}
          icon={Users}
          sparklineData={[18, 19, 20, 19, 21, 20, 20]}
          onClick={() => navigate('/user-segments')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Process Map Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Process Overview</CardTitle>
            <CardDescription>Ideal path with {processModel.idealPath.length} steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processModel.idealPath.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-blue/10 text-accent-blue flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm">{activity}</span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/process-map')}
            >
              View Full Process Map →
            </Button>
          </CardContent>
        </Card>

        {/* Top Deviations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Deviations</CardTitle>
            <CardDescription>Most frequent process deviations</CardDescription>
          </CardHeader>
          <CardContent>
            {topDeviations.length > 0 ? (
              <div className="space-y-3">
                {topDeviations.map(([key, count], index) => {
                  const [type, activity] = key.split(':');
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted w-4">{index + 1}.</span>
                        <Badge variant="rose" className="capitalize">
                          {type}
                        </Badge>
                        <span className="text-sm">{activity}</span>
                      </div>
                      <span className="text-sm font-medium">{count}×</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-accent-emerald">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">No deviations detected</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events from the process log</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eventLog.events.slice(-5).reverse().map((event) => (
              <div key={event.id} className="flex items-center gap-4 text-sm">
                <span className="text-muted tabular-nums">
                  {event.timestamp.toLocaleTimeString()}
                </span>
                <Badge variant="blue">{event.activity}</Badge>
                <span className="text-muted">by {event.user_id}</span>
                <span className="text-muted ml-auto">Case {event.case_id}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
