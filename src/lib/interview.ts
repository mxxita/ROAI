import { User, InterviewQuestion, InterviewResponse, ExtractedInsight, Deviation } from '@/types';
import { generateId } from './utils';

const QUESTION_TEMPLATES = {
  skip: [
    {
      template: "You skipped '{activity}' in {count} cases. Was this an intentional workaround, or were there blockers preventing you from completing this step?",
      followUp: "If intentional, is there an informal rule or threshold that determines when this is acceptable?"
    },
    {
      template: "I noticed '{activity}' was bypassed {count} times in your recent cases. Can you walk me through your decision-making process?",
      followUp: "Would formalizing this as an exception path benefit the team?"
    }
  ],
  reorder: [
    {
      template: "In several cases, you performed '{activity}' before the standard preceding step. What prompted this reordering?",
      followUp: "Does this sequence actually work better in certain situations?"
    }
  ],
  frequency: [
    {
      template: "Your case completion rate is significantly higher than average. What techniques or shortcuts have you developed?",
      followUp: "Could these be documented and shared with the team?"
    }
  ],
  general: [
    {
      template: "Looking at your overall process patterns, are there any pain points or inefficiencies you've noticed?",
      followUp: "If you could change one thing about the current process, what would it be?"
    }
  ]
};

const RESPONSE_BANK = {
  skip_approval: [
    "For applications under €5,000 with a clean credit score, our team lead gave verbal approval to skip the manager sign-off during the Q4 rush. It was never formally documented.",
    "The approval step felt redundant for straightforward cases. I'd already verified everything in the risk assessment phase.",
    "Sometimes the manager was unavailable and we had SLA pressure. I made a judgment call."
  ],
  skip_doccheck: [
    "When customers submit via the digital portal, documents are pre-validated. Rechecking felt wasteful.",
    "The system was down for maintenance. I used the backup paper process."
  ],
  skip_risk: [
    "For returning customers with perfect payment history, the risk assessment seemed unnecessary. We have their track record.",
    "The automated score was already showing green. Manual assessment didn't add value."
  ],
  reorder_general: [
    "I find it more efficient to run the credit check while waiting for documents. Parallelizes the work.",
    "Customer was anxious about timeline. I started preliminary work to reassure them."
  ],
  efficiency: [
    "I batch similar cases together. Processing 5 similar loans at once is faster than context-switching.",
    "I've built a personal checklist that catches common issues early, saving rework.",
    "I use keyboard shortcuts extensively and have templates for common scenarios."
  ],
  pain_points: [
    "The document upload system is slow. Customers often call to check if files went through.",
    "We get a lot of incomplete applications that waste time in early stages.",
    "The handoff between departments could be smoother - lots of waiting."
  ]
};

export function generateInterviewQuestions(user: User, deviations: Deviation[]): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];

  // Analyze deviations
  const deviationsByType = deviations.reduce((acc, dev) => {
    if (!acc[dev.type]) acc[dev.type] = [];
    acc[dev.type].push(dev);
    return acc;
  }, {} as Record<string, Deviation[]>);

  // Generate skip questions
  if (deviationsByType.skip && deviationsByType.skip.length > 0) {
    const activityCounts = deviationsByType.skip.reduce((acc, dev) => {
      acc[dev.activity] = (acc[dev.activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSkip = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0];
    const template = QUESTION_TEMPLATES.skip[Math.floor(Math.random() * QUESTION_TEMPLATES.skip.length)];

    questions.push({
      id: generateId(),
      type: 'skip',
      text: template.template
        .replace('{activity}', topSkip[0])
        .replace('{count}', topSkip[1].toString()),
      context: {
        activity: topSkip[0],
        count: topSkip[1]
      }
    });
  }

  // Generate reorder questions
  if (deviationsByType.reorder && deviationsByType.reorder.length > 0) {
    const dev = deviationsByType.reorder[0];
    const template = QUESTION_TEMPLATES.reorder[0];

    questions.push({
      id: generateId(),
      type: 'reorder',
      text: template.template.replace('{activity}', dev.activity),
      context: {
        activity: dev.activity
      }
    });
  }

  // General efficiency question if they're a fast-tracker
  if (user.segment === 'fast-tracker') {
    const template = QUESTION_TEMPLATES.frequency[0];
    questions.push({
      id: generateId(),
      type: 'frequency',
      text: template.template,
      context: {}
    });
  }

  // Always end with general question
  questions.push({
    id: generateId(),
    type: 'general',
    text: QUESTION_TEMPLATES.general[0].template,
    context: {}
  });

  return questions;
}

export function generateSimulatedResponse(question: InterviewQuestion): InterviewResponse {
  let responseText = '';

  // Pick response based on question context
  if (question.type === 'skip' && question.context.activity) {
    const activity = question.context.activity.toLowerCase();
    if (activity.includes('approval')) {
      responseText = RESPONSE_BANK.skip_approval[Math.floor(Math.random() * RESPONSE_BANK.skip_approval.length)];
    } else if (activity.includes('document')) {
      responseText = RESPONSE_BANK.skip_doccheck[Math.floor(Math.random() * RESPONSE_BANK.skip_doccheck.length)];
    } else if (activity.includes('risk')) {
      responseText = RESPONSE_BANK.skip_risk[Math.floor(Math.random() * RESPONSE_BANK.skip_risk.length)];
    } else {
      responseText = RESPONSE_BANK.skip_approval[0];
    }
  } else if (question.type === 'reorder') {
    responseText = RESPONSE_BANK.reorder_general[Math.floor(Math.random() * RESPONSE_BANK.reorder_general.length)];
  } else if (question.type === 'frequency') {
    responseText = RESPONSE_BANK.efficiency[Math.floor(Math.random() * RESPONSE_BANK.efficiency.length)];
  } else {
    responseText = RESPONSE_BANK.pain_points[Math.floor(Math.random() * RESPONSE_BANK.pain_points.length)];
  }

  return {
    questionId: question.id,
    text: responseText,
    timestamp: new Date(),
    sentiment: 'neutral'
  };
}

export function extractInsights(responses: InterviewResponse[]): ExtractedInsight[] {
  const insights: ExtractedInsight[] = [];

  const patterns = [
    {
      regex: /under\s*€?\$?(\d+[,.]?\d*)/i,
      type: 'undocumented-rule' as const,
      priority: 'high' as const,
      template: (match: string) => `Informal threshold discovered: €${match} for approval bypass`
    },
    {
      regex: /verbal\s*(approval|agreement|permission)/i,
      type: 'process-gap' as const,
      priority: 'high' as const,
      template: () => 'Verbal approvals being used instead of documented authorization'
    },
    {
      regex: /(SLA|deadline|pressure|rush)/i,
      type: 'workload' as const,
      priority: 'medium' as const,
      template: () => 'Workload pressure contributing to process shortcuts'
    },
    {
      regex: /(system|tool|software)\s*(down|broken|unavailable|slow)/i,
      type: 'tool-issue' as const,
      priority: 'high' as const,
      template: () => 'System availability/performance issues forcing workarounds'
    },
    {
      regex: /(batch|template|shortcut|checklist)/i,
      type: 'training-need' as const,
      priority: 'medium' as const,
      template: () => 'User-developed efficiency techniques worth standardizing'
    },
    {
      regex: /(redundant|unnecessary|wasteful|duplicate)/i,
      type: 'process-gap' as const,
      priority: 'medium' as const,
      template: () => 'Process steps perceived as redundant by practitioners'
    }
  ];

  responses.forEach(response => {
    patterns.forEach(pattern => {
      const match = response.text.match(pattern.regex);
      if (match) {
        const evidence = response.text.substring(0, 120) + (response.text.length > 120 ? '...' : '');

        insights.push({
          id: generateId(),
          type: pattern.type,
          priority: pattern.priority,
          summary: pattern.template(match[1] || ''),
          evidence: [evidence],
          recommendation: getRecommendation(pattern.type)
        });
      }
    });
  });

  // Deduplicate
  const seen = new Set<string>();
  return insights.filter(insight => {
    const key = insight.summary;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getRecommendation(type: string): string {
  const recommendations = {
    'undocumented-rule': 'Formalize this rule in the process documentation with clear criteria',
    'process-gap': 'Update process model to reflect actual practice or enforce standard',
    'workload': 'Review resource allocation and consider process optimization',
    'tool-issue': 'Escalate to IT for system improvements',
    'training-need': 'Document technique and incorporate into onboarding materials'
  };

  return recommendations[type as keyof typeof recommendations] || 'Review and take appropriate action';
}
