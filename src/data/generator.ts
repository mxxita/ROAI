import { ProcessEvent, EventLog } from '@/types';
import { generateId } from '@/lib/utils';

const SAMPLE_CONFIG = {
  caseCount: 500,
  dateRange: { start: new Date('2024-01-01'), end: new Date('2024-02-15') },
  users: [
    'Sara Johnson', 'Mike Chen', 'Emma Wilson', 'James Brown',
    'Lisa Garcia', 'David Kim', 'Anna Martinez', 'Tom Anderson',
    'Rachel Lee', 'Chris Taylor', 'Nina Patel', 'Alex Thompson',
    'Maria Rodriguez', 'Kevin White', 'Sophie Clark', 'Ryan Davis',
    'Julia Moore', 'Daniel Hall', 'Laura Young', 'Mark Lewis'
  ],
  activities: [
    { name: 'Application Received', avgDuration: 0, isStart: true, isEnd: false },
    { name: 'Document Check', avgDuration: 2 * 60 * 60 * 1000, isStart: false, isEnd: false },
    { name: 'Credit Score Lookup', avgDuration: 30 * 60 * 1000, isStart: false, isEnd: false },
    { name: 'Risk Assessment', avgDuration: 4 * 60 * 60 * 1000, isStart: false, isEnd: false },
    { name: 'Manager Approval', avgDuration: 24 * 60 * 60 * 1000, isStart: false, isEnd: false },
    { name: 'Final Decision', avgDuration: 1 * 60 * 60 * 1000, isStart: false, isEnd: false },
    { name: 'Contract Generation', avgDuration: 2 * 60 * 60 * 1000, isStart: false, isEnd: false },
    { name: 'Disbursement', avgDuration: 48 * 60 * 60 * 1000, isStart: false, isEnd: true }
  ],
  deviationRate: 0.15,
  deviationTypes: {
    skip: 0.5,
    reorder: 0.3,
    loop: 0.2
  }
};

const IDEAL_PATH = [
  'Application Received',
  'Document Check',
  'Credit Score Lookup',
  'Risk Assessment',
  'Manager Approval',
  'Final Decision',
  'Contract Generation',
  'Disbursement'
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateCase(caseId: string, startDate: Date): ProcessEvent[] {
  const events: ProcessEvent[] = [];
  const hasDeviation = Math.random() < SAMPLE_CONFIG.deviationRate;

  let path: string[];

  if (!hasDeviation || Math.random() < 0.75) {
    // Ideal path (75% of cases follow exactly)
    path = [...IDEAL_PATH];
  } else {
    // Generate deviation
    const deviationType = Math.random();
    path = [...IDEAL_PATH];

    if (deviationType < SAMPLE_CONFIG.deviationTypes.skip) {
      // Skip a step (not start or end)
      const skipIndex = randomBetween(1, path.length - 2);
      path.splice(skipIndex, 1);
    } else if (deviationType < SAMPLE_CONFIG.deviationTypes.skip + SAMPLE_CONFIG.deviationTypes.reorder) {
      // Reorder two steps
      const idx1 = randomBetween(1, path.length - 3);
      const idx2 = idx1 + 1;
      [path[idx1], path[idx2]] = [path[idx2], path[idx1]];
    } else {
      // Loop - repeat a step
      const loopIndex = randomBetween(1, path.length - 2);
      path.splice(loopIndex + 1, 0, path[loopIndex]);
    }
  }

  let currentTime = new Date(startDate);
  const users = [...SAMPLE_CONFIG.users];
  const assignedUsers = new Map<string, string>();

  path.forEach((activityName, index) => {
    const activityConfig = SAMPLE_CONFIG.activities.find(a => a.name === activityName);
    if (!activityConfig) return;

    // Assign user consistently for certain activities
    let user: string;
    if (activityName === 'Manager Approval') {
      user = 'Mike Chen'; // Manager is always Mike Chen
    } else {
      // Use same user for related activities or pick new one
      if (assignedUsers.has(activityName)) {
        user = assignedUsers.get(activityName)!;
      } else {
        user = randomChoice(users);
        assignedUsers.set(activityName, user);
      }
    }

    // Add some variance to duration (±30%)
    const variance = 0.7 + Math.random() * 0.6;
    const duration = activityConfig.avgDuration * variance;
    currentTime = new Date(currentTime.getTime() + duration);

    events.push({
      id: generateId(),
      case_id: caseId,
      activity: activityName,
      timestamp: new Date(currentTime),
      user_id: user,
      attributes: {
        activityIndex: index,
        pathLength: path.length
      }
    });
  });

  return events;
}

export function generateSampleData(): EventLog {
  const allEvents: ProcessEvent[] = [];
  const startDate = SAMPLE_CONFIG.dateRange.start;
  const endDate = SAMPLE_CONFIG.dateRange.end;

  for (let i = 0; i < SAMPLE_CONFIG.caseCount; i++) {
    const caseId = `CASE-${String(i + 1).padStart(4, '0')}`;
    const caseStartDate = randomDate(startDate, new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    const caseEvents = generateCase(caseId, caseStartDate);
    allEvents.push(...caseEvents);
  }

  // Sort all events by timestamp
  allEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Calculate metadata
  const uniqueCases = new Set(allEvents.map(e => e.case_id));
  const uniqueActivities = new Set(allEvents.map(e => e.activity));
  const uniqueUsers = new Set(allEvents.map(e => e.user_id));

  return {
    events: allEvents,
    metadata: {
      name: 'Loan Application Process',
      uploadedAt: new Date(),
      caseCount: uniqueCases.size,
      activityCount: uniqueActivities.size,
      userCount: uniqueUsers.size,
      startDate: allEvents[0].timestamp,
      endDate: allEvents[allEvents.length - 1].timestamp
    }
  };
}
