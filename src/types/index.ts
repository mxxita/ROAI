// ==================== EVENT LOG ====================
export interface ProcessEvent {
  id: string;
  case_id: string;
  activity: string;
  timestamp: Date;
  user_id: string;
  resource?: string;
  attributes?: Record<string, unknown>;
}

export interface EventLog {
  events: ProcessEvent[];
  metadata: {
    name: string;
    uploadedAt: Date;
    caseCount: number;
    activityCount: number;
    userCount: number;
    startDate: Date;
    endDate: Date;
  };
}

// ==================== PROCESS MODEL ====================
export interface Activity {
  id: string;
  name: string;
  frequency: number;
  avgDuration: number;
  isStart: boolean;
  isEnd: boolean;
  deviationCount: number;
}

export interface Transition {
  id: string;
  source: string;
  target: string;
  frequency: number;
  avgDuration: number;
  isInIdealPath: boolean;
}

export interface ProcessModel {
  activities: Activity[];
  transitions: Transition[];
  idealPath: string[];
  variants: ProcessVariant[];
}

export interface ProcessVariant {
  id: string;
  path: string[];
  frequency: number;
  avgDuration: number;
  conformanceScore: number;
}

// ==================== USER & SEGMENTS ====================
export interface User {
  id: string;
  name: string;
  segment: UserSegment;
  metrics: {
    casesHandled: number;
    conformanceScore: number;
    avgCompletionTime: number;
    deviationCount: number;
    mostCommonDeviation?: string;
  };
  recentCases: string[];
}

export type UserSegment = 'conformist' | 'fast-tracker' | 'deviator' | 'thorough-reviewer';

export interface SegmentDefinition {
  id: UserSegment;
  label: string;
  icon: string;
  color: string;
  criteria: (user: User, stats: GlobalStats) => boolean;
  description: string;
}

export interface GlobalStats {
  avgConformance: number;
  stdConformance: number;
  avgCompletionTime: number;
  stdCompletionTime: number;
  avgDeviations: number;
  stdDeviations: number;
}

// ==================== CONFORMANCE ====================
export interface AlignmentStep {
  logMove: string | null;
  modelMove: string | null;
  type: 'sync' | 'log-only' | 'model-only';
}

export interface CaseConformance {
  caseId: string;
  fitness: number;
  alignment: AlignmentStep[];
  deviations: Deviation[];
}

export interface Deviation {
  type: 'skip' | 'insert' | 'reorder';
  activity: string;
  expectedPosition?: number;
  actualPosition?: number;
  user: string;
  timestamp: Date;
}

// ==================== INTERVIEW ====================
export interface InterviewSession {
  id: string;
  targetUser: User;
  deviations: Deviation[];
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  insights: ExtractedInsight[];
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface InterviewQuestion {
  id: string;
  type: 'skip' | 'reorder' | 'frequency' | 'general';
  text: string;
  context: {
    activity?: string;
    count?: number;
    pattern?: string;
  };
}

export interface InterviewResponse {
  questionId: string;
  text: string;
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface ExtractedInsight {
  id: string;
  type: 'process-gap' | 'undocumented-rule' | 'training-need' | 'tool-issue' | 'workload';
  priority: 'high' | 'medium' | 'low';
  summary: string;
  evidence: string[];
  recommendation?: string;
}
