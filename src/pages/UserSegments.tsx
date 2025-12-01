import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon, Eye, MessageSquare } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { UserSegment } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { getInitials } from '@/lib/utils';

const SEGMENT_CONFIGS = {
  conformist: {
    label: 'Conformists',
    icon: '✓',
    color: 'emerald',
    description: 'Consistently follow standard process',
  },
  'fast-tracker': {
    label: 'Fast Trackers',
    icon: '⚡',
    color: 'blue',
    description: 'Complete cases significantly faster',
  },
  deviator: {
    label: 'Deviators',
    icon: '↯',
    color: 'rose',
    description: 'Frequently deviate from standard path',
  },
  'thorough-reviewer': {
    label: 'Thorough Reviewers',
    icon: '🔍',
    color: 'amber',
    description: 'Take extra verification steps',
  },
} as const;

function SegmentBadge({ segment }: { segment: UserSegment }) {
  const config = SEGMENT_CONFIGS[segment];
  return (
    <Badge variant={config.color as any}>
      {config.icon} {config.label}
    </Badge>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="h-8 w-8 rounded-full bg-accent-blue/10 flex items-center justify-center text-sm font-medium text-accent-blue">
      {getInitials(name)}
    </div>
  );
}

export default function UserSegments() {
  const { users } = useApp();
  const navigate = useNavigate();
  const [selectedSegment, setSelectedSegment] = useState<UserSegment | 'all'>('all');

  if (!users || users.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">User Segments</h1>
        <p className="text-muted mb-8">Behavioral analysis of process participants</p>

        <EmptyState
          icon={UsersIcon}
          title="No User Data"
          description="Load event log data to analyze user behavior and segment users by their process execution patterns."
          action={<Button onClick={() => navigate('/event-logs')}>Go to Event Logs</Button>}
        />
      </div>
    );
  }

  // Calculate segment distribution
  const segmentCounts = users.reduce((acc, user) => {
    acc[user.segment] = (acc[user.segment] || 0) + 1;
    return acc;
  }, {} as Record<UserSegment, number>);

  const filteredUsers =
    selectedSegment === 'all'
      ? users
      : users.filter((u) => u.segment === selectedSegment);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Segments</h1>
        <p className="text-muted">Behavioral analysis of {users.length} users</p>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(Object.entries(SEGMENT_CONFIGS) as [UserSegment, typeof SEGMENT_CONFIGS[UserSegment]][]).map(
          ([segment, config]) => {
            const count = segmentCounts[segment] || 0;
            const percentage = ((count / users.length) * 100).toFixed(1);

            return (
              <Card
                key={segment}
                className="cursor-pointer hover:shadow-elevated transition-shadow"
                onClick={() =>
                  setSelectedSegment(selectedSegment === segment ? 'all' : segment)
                }
              >
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted">
                    {config.icon} {config.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-1">{count}</p>
                  <p className="text-sm text-muted">{percentage}% of users</p>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedSegment === 'all'
              ? 'All Users'
              : SEGMENT_CONFIGS[selectedSegment].label}
          </CardTitle>
          <CardDescription>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-3">
                  <th className="text-left py-3 px-4 font-medium text-muted">User</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Segment</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Cases</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">
                    Conformance
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted">
                    Avg Time
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted">
                    Deviations
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-surface-3/50 hover:bg-surface-2"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <SegmentBadge segment={user.segment} />
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {user.metrics.casesHandled}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-surface-3 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-emerald rounded-full"
                            style={{
                              width: `${user.metrics.conformanceScore * 100}%`,
                            }}
                          />
                        </div>
                        <span className="tabular-nums text-xs">
                          {(user.metrics.conformanceScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-muted tabular-nums">
                      {user.metrics.avgCompletionTime > 0
                        ? Math.round(user.metrics.avgCompletionTime / 1000 / 60 / 60) + 'h'
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {user.metrics.deviationCount > 0 ? (
                        <Badge variant="rose">{user.metrics.deviationCount}</Badge>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" title="View details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Start interview"
                          onClick={() => navigate('/interviews', { state: { user } })}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
