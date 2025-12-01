import { ProcessModel, EventLog, User, GlobalStats, CaseConformance } from '@/types';

/**
 * Static demo data based on filtered_log.xes
 * This is a hardcoded demonstration that shows what the process map should look like
 */

export const STATIC_DEMO_MODEL: ProcessModel = {
  activities: [
    {
      id: 'A_Concept',
      name: 'A_Concept',
      frequency: 500,
      avgDuration: 0,
      isStart: true,
      isEnd: false,
      deviationCount: 0,
    },
    {
      id: 'A_Create Application',
      name: 'A_Create Application',
      frequency: 500,
      avgDuration: 1 * 60 * 60 * 1000, // 1 hour
      isStart: false,
      isEnd: false,
      deviationCount: 12,
    },
    {
      id: 'A_Submitted',
      name: 'A_Submitted',
      frequency: 480,
      avgDuration: 2 * 60 * 60 * 1000, // 2 hours
      isStart: false,
      isEnd: false,
      deviationCount: 8,
    },
    {
      id: 'W_Handle leads',
      name: 'W_Handle leads',
      frequency: 470,
      avgDuration: 4 * 60 * 60 * 1000, // 4 hours
      isStart: false,
      isEnd: false,
      deviationCount: 15,
    },
    {
      id: 'W_Complete application',
      name: 'W_Complete application',
      frequency: 455,
      avgDuration: 12 * 60 * 60 * 1000, // 12 hours
      isStart: false,
      isEnd: false,
      deviationCount: 22,
    },
    {
      id: 'W_Call incomplete files',
      name: 'W_Call incomplete files',
      frequency: 180,
      avgDuration: 6 * 60 * 60 * 1000, // 6 hours
      isStart: false,
      isEnd: false,
      deviationCount: 45,
    },
    {
      id: 'A_Incomplete',
      name: 'A_Incomplete',
      frequency: 120,
      avgDuration: 1 * 60 * 60 * 1000, // 1 hour
      isStart: false,
      isEnd: false,
      deviationCount: 35,
    },
    {
      id: 'W_Validate application',
      name: 'W_Validate application',
      frequency: 420,
      avgDuration: 8 * 60 * 60 * 1000, // 8 hours
      isStart: false,
      isEnd: false,
      deviationCount: 18,
    },
    {
      id: 'A_Validating',
      name: 'A_Validating',
      frequency: 420,
      avgDuration: 2 * 60 * 60 * 1000, // 2 hours
      isStart: false,
      isEnd: false,
      deviationCount: 10,
    },
    {
      id: 'A_Pending',
      name: 'A_Pending',
      frequency: 410,
      avgDuration: 24 * 60 * 60 * 1000, // 1 day
      isStart: false,
      isEnd: false,
      deviationCount: 5,
    },
    {
      id: 'O_Create Offer',
      name: 'O_Create Offer',
      frequency: 380,
      avgDuration: 4 * 60 * 60 * 1000, // 4 hours
      isStart: false,
      isEnd: false,
      deviationCount: 8,
    },
    {
      id: 'O_Created',
      name: 'O_Created',
      frequency: 380,
      avgDuration: 1 * 60 * 60 * 1000, // 1 hour
      isStart: false,
      isEnd: false,
      deviationCount: 3,
    },
    {
      id: 'W_Call after offers',
      name: 'W_Call after offers',
      frequency: 360,
      avgDuration: 6 * 60 * 60 * 1000, // 6 hours
      isStart: false,
      isEnd: false,
      deviationCount: 12,
    },
    {
      id: 'O_Sent',
      name: 'O_Sent',
      frequency: 350,
      avgDuration: 2 * 60 * 60 * 1000, // 2 hours
      isStart: false,
      isEnd: false,
      deviationCount: 5,
    },
    {
      id: 'W_Assess potential fraud',
      name: 'W_Assess potential fraud',
      frequency: 50,
      avgDuration: 12 * 60 * 60 * 1000, // 12 hours
      isStart: false,
      isEnd: false,
      deviationCount: 8,
    },
    {
      id: 'A_Accepted',
      name: 'A_Accepted',
      frequency: 280,
      avgDuration: 2 * 60 * 60 * 1000, // 2 hours
      isStart: false,
      isEnd: false,
      deviationCount: 2,
    },
    {
      id: 'O_Accepted',
      name: 'O_Accepted',
      frequency: 280,
      avgDuration: 1 * 60 * 60 * 1000, // 1 hour
      isStart: false,
      isEnd: false,
      deviationCount: 1,
    },
    {
      id: 'A_Complete',
      name: 'A_Complete',
      frequency: 280,
      avgDuration: 24 * 60 * 60 * 1000, // 1 day
      isStart: false,
      isEnd: true,
      deviationCount: 0,
    },
    {
      id: 'O_Refused',
      name: 'O_Refused',
      frequency: 35,
      avgDuration: 1 * 60 * 60 * 1000, // 1 hour
      isStart: false,
      isEnd: false,
      deviationCount: 2,
    },
    {
      id: 'A_Denied',
      name: 'A_Denied',
      frequency: 35,
      avgDuration: 2 * 60 * 60 * 1000, // 2 hours
      isStart: false,
      isEnd: true,
      deviationCount: 1,
    },
    {
      id: 'A_Cancelled',
      name: 'A_Cancelled',
      frequency: 70,
      avgDuration: 1 * 60 * 60 * 1000, // 1 hour
      isStart: false,
      isEnd: true,
      deviationCount: 8,
    },
    {
      id: 'O_Cancelled',
      name: 'O_Cancelled',
      frequency: 35,
      avgDuration: 1 * 60 * 60 * 1000, // 1 hour
      isStart: false,
      isEnd: false,
      deviationCount: 3,
    },
  ],
  transitions: [
    // Main happy path
    { id: 't1', source: 'A_Concept', target: 'A_Create Application', frequency: 500, avgDuration: 3600000, isInIdealPath: true },
    { id: 't2', source: 'A_Create Application', target: 'A_Submitted', frequency: 480, avgDuration: 7200000, isInIdealPath: true },
    { id: 't3', source: 'A_Submitted', target: 'W_Handle leads', frequency: 470, avgDuration: 14400000, isInIdealPath: true },
    { id: 't4', source: 'W_Handle leads', target: 'W_Complete application', frequency: 455, avgDuration: 43200000, isInIdealPath: true },
    { id: 't5', source: 'W_Complete application', target: 'W_Validate application', frequency: 420, avgDuration: 28800000, isInIdealPath: true },
    { id: 't6', source: 'W_Validate application', target: 'A_Validating', frequency: 420, avgDuration: 7200000, isInIdealPath: true },
    { id: 't7', source: 'A_Validating', target: 'A_Pending', frequency: 410, avgDuration: 86400000, isInIdealPath: true },
    { id: 't8', source: 'A_Pending', target: 'O_Create Offer', frequency: 380, avgDuration: 14400000, isInIdealPath: true },
    { id: 't9', source: 'O_Create Offer', target: 'O_Created', frequency: 380, avgDuration: 3600000, isInIdealPath: true },
    { id: 't10', source: 'O_Created', target: 'W_Call after offers', frequency: 360, avgDuration: 21600000, isInIdealPath: true },
    { id: 't11', source: 'W_Call after offers', target: 'O_Sent', frequency: 350, avgDuration: 7200000, isInIdealPath: true },
    { id: 't12', source: 'O_Sent', target: 'A_Accepted', frequency: 280, avgDuration: 7200000, isInIdealPath: true },
    { id: 't13', source: 'A_Accepted', target: 'O_Accepted', frequency: 280, avgDuration: 3600000, isInIdealPath: true },
    { id: 't14', source: 'O_Accepted', target: 'A_Complete', frequency: 280, avgDuration: 86400000, isInIdealPath: true },

    // Incomplete application loop
    { id: 't15', source: 'W_Complete application', target: 'W_Call incomplete files', frequency: 180, avgDuration: 21600000, isInIdealPath: false },
    { id: 't16', source: 'W_Call incomplete files', target: 'A_Incomplete', frequency: 120, avgDuration: 3600000, isInIdealPath: false },
    { id: 't17', source: 'A_Incomplete', target: 'W_Complete application', frequency: 100, avgDuration: 14400000, isInIdealPath: false },

    // Fraud assessment path
    { id: 't18', source: 'A_Validating', target: 'W_Assess potential fraud', frequency: 50, avgDuration: 43200000, isInIdealPath: false },
    { id: 't19', source: 'W_Assess potential fraud', target: 'A_Pending', frequency: 45, avgDuration: 7200000, isInIdealPath: false },

    // Rejection path
    { id: 't20', source: 'O_Sent', target: 'O_Refused', frequency: 35, avgDuration: 3600000, isInIdealPath: false },
    { id: 't21', source: 'O_Refused', target: 'A_Denied', frequency: 35, avgDuration: 7200000, isInIdealPath: false },

    // Cancellation paths
    { id: 't22', source: 'A_Submitted', target: 'A_Cancelled', frequency: 25, avgDuration: 3600000, isInIdealPath: false },
    { id: 't23', source: 'W_Complete application', target: 'A_Cancelled', frequency: 15, avgDuration: 3600000, isInIdealPath: false },
    { id: 't24', source: 'O_Created', target: 'O_Cancelled', frequency: 20, avgDuration: 3600000, isInIdealPath: false },
    { id: 't25', source: 'O_Cancelled', target: 'A_Cancelled', frequency: 20, avgDuration: 3600000, isInIdealPath: false },
    { id: 't26', source: 'A_Pending', target: 'A_Cancelled', frequency: 10, avgDuration: 3600000, isInIdealPath: false },
  ],
  idealPath: [
    'A_Concept',
    'A_Create Application',
    'A_Submitted',
    'W_Handle leads',
    'W_Complete application',
    'W_Validate application',
    'A_Validating',
    'A_Pending',
    'O_Create Offer',
    'O_Created',
    'W_Call after offers',
    'O_Sent',
    'A_Accepted',
    'O_Accepted',
    'A_Complete',
  ],
  variants: [
    {
      id: 'v1',
      path: ['A_Concept', 'A_Create Application', 'A_Submitted', 'W_Handle leads', 'W_Complete application', 'W_Validate application', 'A_Validating', 'A_Pending', 'O_Create Offer', 'O_Created', 'W_Call after offers', 'O_Sent', 'A_Accepted', 'O_Accepted', 'A_Complete'],
      frequency: 280,
      avgDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
      conformanceScore: 1.0,
    },
    {
      id: 'v2',
      path: ['A_Concept', 'A_Create Application', 'A_Submitted', 'W_Handle leads', 'W_Complete application', 'W_Call incomplete files', 'A_Incomplete', 'W_Complete application', 'W_Validate application', 'A_Validating', 'A_Pending', 'O_Create Offer', 'O_Created', 'W_Call after offers', 'O_Sent', 'A_Accepted', 'O_Accepted', 'A_Complete'],
      frequency: 85,
      avgDuration: 10 * 24 * 60 * 60 * 1000, // 10 days
      conformanceScore: 0.85,
    },
    {
      id: 'v3',
      path: ['A_Concept', 'A_Create Application', 'A_Submitted', 'W_Handle leads', 'W_Complete application', 'W_Validate application', 'A_Validating', 'W_Assess potential fraud', 'A_Pending', 'O_Create Offer', 'O_Created', 'W_Call after offers', 'O_Sent', 'A_Accepted', 'O_Accepted', 'A_Complete'],
      frequency: 35,
      avgDuration: 14 * 24 * 60 * 60 * 1000, // 14 days
      conformanceScore: 0.78,
    },
  ],
};

export const STATIC_DEMO_EVENTLOG: EventLog = {
  events: [], // Not needed for static demo
  metadata: {
    name: 'Loan Application Process (Demo)',
    uploadedAt: new Date(),
    caseCount: 500,
    activityCount: 22,
    userCount: 15,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
  },
};

export const STATIC_DEMO_USERS: User[] = [
  {
    id: 'user1',
    name: 'Sarah Johnson',
    segment: 'conformist',
    metrics: {
      casesHandled: 45,
      conformanceScore: 0.96,
      avgCompletionTime: 7 * 24 * 60 * 60 * 1000,
      deviationCount: 2,
      mostCommonDeviation: undefined,
    },
    recentCases: ['CASE-001', 'CASE-045', 'CASE-089'],
  },
  {
    id: 'user2',
    name: 'Mike Chen',
    segment: 'fast-tracker',
    metrics: {
      casesHandled: 62,
      conformanceScore: 0.91,
      avgCompletionTime: 5 * 24 * 60 * 60 * 1000,
      deviationCount: 8,
      mostCommonDeviation: 'skip:W_Call after offers',
    },
    recentCases: ['CASE-012', 'CASE-078', 'CASE-134'],
  },
  {
    id: 'user3',
    name: 'Emma Wilson',
    segment: 'deviator',
    metrics: {
      casesHandled: 38,
      conformanceScore: 0.72,
      avgCompletionTime: 9 * 24 * 60 * 60 * 1000,
      deviationCount: 22,
      mostCommonDeviation: 'skip:W_Validate application',
    },
    recentCases: ['CASE-023', 'CASE-067', 'CASE-156'],
  },
  {
    id: 'user4',
    name: 'James Rodriguez',
    segment: 'thorough-reviewer',
    metrics: {
      casesHandled: 35,
      conformanceScore: 0.98,
      avgCompletionTime: 12 * 24 * 60 * 60 * 1000,
      deviationCount: 1,
      mostCommonDeviation: undefined,
    },
    recentCases: ['CASE-034', 'CASE-089', 'CASE-201'],
  },
];

export const STATIC_DEMO_STATS: GlobalStats = {
  avgConformance: 0.87,
  stdConformance: 0.12,
  avgCompletionTime: 8 * 24 * 60 * 60 * 1000,
  stdCompletionTime: 3 * 24 * 60 * 60 * 1000,
  avgDeviations: 8.5,
  stdDeviations: 6.2,
};

export const STATIC_DEMO_CONFORMANCE: CaseConformance[] = [];
