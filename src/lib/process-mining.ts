import { ProcessEvent, EventLog, ProcessModel, Activity, Transition, ProcessVariant, CaseConformance, Deviation, User, GlobalStats, UserSegment } from '@/types';
import { generateId, calculateStdDev } from './utils';

// ==================== PROCESS DISCOVERY (DFG) ====================
export function discoverProcess(eventLog: EventLog): ProcessModel {
  const { events } = eventLog;

  // Group events by case
  const caseMap = new Map<string, ProcessEvent[]>();
  events.forEach(event => {
    if (!caseMap.has(event.case_id)) {
      caseMap.set(event.case_id, []);
    }
    caseMap.get(event.case_id)!.push(event);
  });

  // Sort events within each case by timestamp
  caseMap.forEach(caseEvents => {
    caseEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  });

  // Count activity frequencies
  const activityFreq = new Map<string, number>();
  const activityDurations = new Map<string, number[]>();
  const startActivities = new Set<string>();
  const endActivities = new Set<string>();

  caseMap.forEach(caseEvents => {
    if (caseEvents.length === 0) return;

    startActivities.add(caseEvents[0].activity);
    endActivities.add(caseEvents[caseEvents.length - 1].activity);

    for (let i = 0; i < caseEvents.length; i++) {
      const activity = caseEvents[i].activity;
      activityFreq.set(activity, (activityFreq.get(activity) || 0) + 1);

      if (i > 0) {
        const duration = caseEvents[i].timestamp.getTime() - caseEvents[i - 1].timestamp.getTime();
        if (!activityDurations.has(activity)) {
          activityDurations.set(activity, []);
        }
        activityDurations.get(activity)!.push(duration);
      }
    }
  });

  // Count transitions (directly-follows graph)
  const transitionFreq = new Map<string, number>();
  const transitionDurations = new Map<string, number[]>();

  caseMap.forEach(caseEvents => {
    for (let i = 0; i < caseEvents.length - 1; i++) {
      const source = caseEvents[i].activity;
      const target = caseEvents[i + 1].activity;
      const key = `${source}->${target}`;

      transitionFreq.set(key, (transitionFreq.get(key) || 0) + 1);

      const duration = caseEvents[i + 1].timestamp.getTime() - caseEvents[i].timestamp.getTime();
      if (!transitionDurations.has(key)) {
        transitionDurations.set(key, []);
      }
      transitionDurations.get(key)!.push(duration);
    }
  });

  console.log('📊 Process Discovery:', {
    cases: caseMap.size,
    activities: activityFreq.size,
    transitions: transitionFreq.size,
    transitionKeys: Array.from(transitionFreq.keys()).slice(0, 3)
  });

  // Determine ideal path (most common sequence)
  const pathCounts = new Map<string, number>();
  caseMap.forEach(caseEvents => {
    const path = caseEvents.map(e => e.activity).join('->');
    pathCounts.set(path, (pathCounts.get(path) || 0) + 1);
  });

  const idealPathString = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])[0][0];
  const idealPath = idealPathString.split('->');

  // Build activities
  const activities: Activity[] = Array.from(activityFreq.entries()).map(([name, frequency]) => ({
    id: name,
    name,
    frequency,
    avgDuration: activityDurations.has(name)
      ? activityDurations.get(name)!.reduce((a, b) => a + b, 0) / activityDurations.get(name)!.length
      : 0,
    isStart: startActivities.has(name),
    isEnd: endActivities.has(name),
    deviationCount: 0 // Will be updated after conformance checking
  }));

  // Build transitions
  const transitions: Transition[] = Array.from(transitionFreq.entries()).map(([key, frequency]) => {
    const [source, target] = key.split('->');
    const durations = transitionDurations.get(key) || [];
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    // Check if this transition is in the ideal path
    let isInIdealPath = false;
    for (let i = 0; i < idealPath.length - 1; i++) {
      if (idealPath[i] === source && idealPath[i + 1] === target) {
        isInIdealPath = true;
        break;
      }
    }

    return {
      id: key,
      source,
      target,
      frequency,
      avgDuration,
      isInIdealPath
    };
  });

  console.log('✅ Built transitions:', transitions.length);
  if (transitions.length > 0) {
    console.log('First transition:', transitions[0]);
  }

  // Extract variants
  const variants: ProcessVariant[] = Array.from(pathCounts.entries())
    .map(([pathString, frequency]) => {
      const path = pathString.split('->');
      const variantCases = Array.from(caseMap.values()).filter(caseEvents =>
        caseEvents.map(e => e.activity).join('->') === pathString
      );

      const durations = variantCases.map(caseEvents => {
        if (caseEvents.length < 2) return 0;
        return caseEvents[caseEvents.length - 1].timestamp.getTime() - caseEvents[0].timestamp.getTime();
      });

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

      // Simple conformance score: 1 if matches ideal path, otherwise based on edit distance
      const conformanceScore = pathString === idealPathString ? 1 : 1 - (Math.abs(path.length - idealPath.length) / idealPath.length) * 0.3;

      return {
        id: generateId(),
        path,
        frequency,
        avgDuration,
        conformanceScore: Math.max(0.5, Math.min(1, conformanceScore))
      };
    })
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20); // Top 20 variants

  return {
    activities,
    transitions,
    idealPath,
    variants
  };
}

// ==================== CONFORMANCE CHECKING ====================
export function checkConformance(eventLog: EventLog, model: ProcessModel): CaseConformance[] {
  const { events } = eventLog;
  const caseMap = new Map<string, ProcessEvent[]>();

  events.forEach(event => {
    if (!caseMap.has(event.case_id)) {
      caseMap.set(event.case_id, []);
    }
    caseMap.get(event.case_id)!.push(event);
  });

  caseMap.forEach(caseEvents => {
    caseEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  });

  const conformanceResults: CaseConformance[] = [];

  caseMap.forEach((caseEvents, caseId) => {
    const actualPath = caseEvents.map(e => e.activity);
    const idealPath = model.idealPath;
    const deviations: Deviation[] = [];

    // Simple alignment: compare with ideal path
    let fitness = 1.0;

    // Check for skipped activities
    idealPath.forEach((activity, index) => {
      if (!actualPath.includes(activity)) {
        deviations.push({
          type: 'skip',
          activity,
          expectedPosition: index,
          user: caseEvents[0]?.user_id || 'Unknown',
          timestamp: caseEvents[0]?.timestamp || new Date()
        });
        fitness -= 0.1;
      }
    });

    // Check for extra activities (inserts)
    actualPath.forEach((activity, index) => {
      if (!idealPath.includes(activity)) {
        deviations.push({
          type: 'insert',
          activity,
          actualPosition: index,
          user: caseEvents[index]?.user_id || 'Unknown',
          timestamp: caseEvents[index]?.timestamp || new Date()
        });
        fitness -= 0.05;
      }
    });

    // Check for reordering
    const commonActivities = actualPath.filter(a => idealPath.includes(a));
    for (let i = 0; i < commonActivities.length - 1; i++) {
      const idealIdx1 = idealPath.indexOf(commonActivities[i]);
      const idealIdx2 = idealPath.indexOf(commonActivities[i + 1]);
      if (idealIdx1 > idealIdx2) {
        deviations.push({
          type: 'reorder',
          activity: commonActivities[i],
          user: caseEvents[i]?.user_id || 'Unknown',
          timestamp: caseEvents[i]?.timestamp || new Date()
        });
        fitness -= 0.08;
      }
    }

    fitness = Math.max(0, Math.min(1, fitness));

    conformanceResults.push({
      caseId,
      fitness,
      alignment: [], // Simplified - not implementing full alignment
      deviations
    });
  });

  return conformanceResults;
}

// ==================== USER ANALYSIS ====================
export function analyzeUsers(eventLog: EventLog, conformance: CaseConformance[]): { users: User[], stats: GlobalStats } {
  const { events } = eventLog;

  // Group events by user
  const userEventMap = new Map<string, ProcessEvent[]>();
  events.forEach(event => {
    if (!userEventMap.has(event.user_id)) {
      userEventMap.set(event.user_id, []);
    }
    userEventMap.get(event.user_id)!.push(event);
  });

  // Calculate user metrics
  const users: User[] = Array.from(userEventMap.entries()).map(([userId, userEvents]) => {
    // Get cases handled by this user
    const userCases = new Set(userEvents.map(e => e.case_id));
    const casesHandled = userCases.size;

    // Calculate conformance score for this user's cases
    const userConformance = conformance.filter(c => userCases.has(c.caseId));
    const conformanceScore = userConformance.length > 0
      ? userConformance.reduce((sum, c) => sum + c.fitness, 0) / userConformance.length
      : 1;

    // Calculate avg completion time for cases where user did all steps
    const completedCases = Array.from(userCases).map(caseId => {
      const caseEvents = events.filter(e => e.case_id === caseId && e.user_id === userId);
      if (caseEvents.length < 2) return 0;
      caseEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      return caseEvents[caseEvents.length - 1].timestamp.getTime() - caseEvents[0].timestamp.getTime();
    }).filter(t => t > 0);

    const avgCompletionTime = completedCases.length > 0
      ? completedCases.reduce((a, b) => a + b, 0) / completedCases.length
      : 0;

    // Count deviations
    const userDeviations = userConformance.flatMap(c => c.deviations.filter(d => d.user === userId));
    const deviationCount = userDeviations.length;

    // Find most common deviation
    const deviationTypes = new Map<string, number>();
    userDeviations.forEach(d => {
      const key = `${d.type}:${d.activity}`;
      deviationTypes.set(key, (deviationTypes.get(key) || 0) + 1);
    });

    const mostCommonDeviation = deviationTypes.size > 0
      ? Array.from(deviationTypes.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : undefined;

    return {
      id: userId,
      name: userId,
      segment: 'conformist' as UserSegment, // Will be assigned later
      metrics: {
        casesHandled,
        conformanceScore,
        avgCompletionTime,
        deviationCount,
        mostCommonDeviation
      },
      recentCases: Array.from(userCases).slice(0, 5)
    };
  });

  // Calculate global statistics
  const conformanceScores = users.map(u => u.metrics.conformanceScore);
  const completionTimes = users.map(u => u.metrics.avgCompletionTime).filter(t => t > 0);
  const deviationCounts = users.map(u => u.metrics.deviationCount);

  const stats: GlobalStats = {
    avgConformance: conformanceScores.reduce((a, b) => a + b, 0) / conformanceScores.length,
    stdConformance: calculateStdDev(conformanceScores),
    avgCompletionTime: completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length,
    stdCompletionTime: calculateStdDev(completionTimes),
    avgDeviations: deviationCounts.reduce((a, b) => a + b, 0) / deviationCounts.length,
    stdDeviations: calculateStdDev(deviationCounts)
  };

  // Assign segments
  users.forEach(user => {
    user.segment = assignSegment(user, stats);
  });

  return { users, stats };
}

function assignSegment(user: User, stats: GlobalStats): UserSegment {
  const { metrics } = user;

  // Priority order: deviator > fast-tracker > thorough-reviewer > conformist

  // Deviator: frequently deviate
  if (metrics.deviationCount > stats.avgDeviations + stats.stdDeviations) {
    return 'deviator';
  }

  // Fast Tracker: fast and still conformant
  if (
    metrics.avgCompletionTime > 0 &&
    metrics.avgCompletionTime < stats.avgCompletionTime - stats.stdCompletionTime &&
    metrics.conformanceScore >= stats.avgConformance - stats.stdConformance * 0.5
  ) {
    return 'fast-tracker';
  }

  // Thorough Reviewer: slow but conformant
  if (
    metrics.avgCompletionTime > stats.avgCompletionTime + stats.stdCompletionTime * 0.5 &&
    metrics.conformanceScore >= stats.avgConformance
  ) {
    return 'thorough-reviewer';
  }

  // Conformist: default
  return 'conformist';
}
