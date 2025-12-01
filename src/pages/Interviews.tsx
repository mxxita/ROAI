import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Lightbulb, AlertCircle, CheckCircle2, Phone, Mail, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { User, InterviewQuestion, InterviewResponse, ExtractedInsight } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { generateInterviewQuestions, generateSimulatedResponse, extractInsights } from '@/lib/interview';
import { cn } from '@/lib/utils';

type InterviewState =
  | { status: 'idle' }
  | { status: 'selecting-user' }
  | { status: 'questioning'; user: User; currentQuestion: number; questions: InterviewQuestion[]; responses: InterviewResponse[] }
  | { status: 'completed'; user: User; questions: InterviewQuestion[]; responses: InterviewResponse[]; insights: ExtractedInsight[] };

export default function Interviews() {
  const { users, conformance } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<InterviewState>({ status: 'idle' });

  useEffect(() => {
    // Check if user was passed from navigation
    if (location.state?.user && state.status === 'idle') {
      startInterview(location.state.user);
    }
  }, [location.state]);

  const startInterview = (user: User) => {
    // Get deviations for this user
    const userCases = new Set(user.recentCases);
    const userDeviations = conformance
      .filter(c => userCases.has(c.caseId))
      .flatMap(c => c.deviations.filter(d => d.user === user.name));

    const questions = generateInterviewQuestions(user, userDeviations);

    setState({
      status: 'questioning',
      user,
      currentQuestion: 0,
      questions,
      responses: []
    });
  };

  const simulateResponse = () => {
    if (state.status !== 'questioning') return;

    const currentQ = state.questions[state.currentQuestion];
    const response = generateSimulatedResponse(currentQ);

    const newResponses = [...state.responses, response];

    // Check if we're done
    if (state.currentQuestion >= state.questions.length - 1) {
      // Extract insights
      const insights = extractInsights(newResponses);

      setState({
        status: 'completed',
        user: state.user,
        questions: state.questions,
        responses: newResponses,
        insights
      });
    } else {
      setState({
        ...state,
        currentQuestion: state.currentQuestion + 1,
        responses: newResponses
      });
    }
  };

  const resetInterview = () => {
    setState({ status: 'idle' });
    navigate('/interviews', { replace: true, state: {} });
  };

  const handleCall = (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // Simulate initiating a call
    const confirmed = window.confirm(
      `Call ${user.name}?\n\n` +
      `This will initiate an automated AI phone interview about their ${user.metrics.deviationCount} process deviation(s).\n\n` +
      `The AI will ask questions and record responses for analysis.`
    );

    if (confirmed) {
      // In a real implementation, this would integrate with a calling service like Twilio
      alert(
        `📞 Calling ${user.name}...\n\n` +
        `✓ AI interviewer connected\n` +
        `✓ Questions auto-generated\n` +
        `✓ Recording conversation\n\n` +
        `(In production, this would use Twilio/similar service)`
      );

      // Auto-start the interview after "calling"
      startInterview(user);
    }
  };

  const handleText = (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // Generate interview questions
    const userCases = new Set(user.recentCases);
    const userDeviations = conformance
      .filter(c => userCases.has(c.caseId))
      .flatMap(c => c.deviations.filter(d => d.user === user.name));

    const questions = generateInterviewQuestions(user, userDeviations);

    const message =
      `Hi ${user.name},\n\n` +
      `We noticed ${user.metrics.deviationCount} process deviation(s) in your recent work. ` +
      `We'd like to understand your workflow better.\n\n` +
      `Questions:\n${questions.map((q, i) => `${i + 1}. ${q.text}`).join('\n')}\n\n` +
      `Please reply with your answers. Thanks!`;

    const confirmed = window.confirm(
      `Send SMS to ${user.name}?\n\n` +
      `Preview:\n${message.substring(0, 200)}...\n\n` +
      `(In production, this would use Twilio SMS)`
    );

    if (confirmed) {
      alert(
        `📱 SMS sent to ${user.name}!\n\n` +
        `✓ ${questions.length} questions sent\n` +
        `✓ Awaiting response\n\n` +
        `(In production, this would use Twilio SMS service)`
      );
    }
  };

  if (!users || users.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">AI Interviews</h1>
        <p className="text-muted mb-8">Automated deviation investigation</p>

        <EmptyState
          icon={MessageSquare}
          title="No User Data"
          description="Load event log data to enable AI-powered interviews with users about their process deviations."
          action={<Button onClick={() => navigate('/event-logs')}>Go to Event Logs</Button>}
        />
      </div>
    );
  }

  if (state.status === 'idle' || state.status === 'selecting-user') {
    // Select user to interview
    const usersWithDeviations = users.filter(u => u.metrics.deviationCount > 0);

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">AI Interviews</h1>
        <p className="text-muted mb-8">Select a user to interview about their process deviations</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usersWithDeviations.map(user => (
            <Card
              key={user.id}
              className="cursor-pointer hover:shadow-elevated transition-shadow"
              onClick={() => startInterview(user)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <CardDescription>
                  {user.metrics.deviationCount} deviation{user.metrics.deviationCount !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted">Cases:</span>
                    <span className="font-medium">{user.metrics.casesHandled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Conformance:</span>
                    <span className="font-medium">
                      {(user.metrics.conformanceScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  {user.metrics.mostCommonDeviation && (
                    <Badge variant="rose" className="mt-2">
                      {user.metrics.mostCommonDeviation}
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-surface-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => handleCall(user, e)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => handleText(user, e)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Text
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (state.status === 'questioning' || state.status === 'completed') {
    const { user, questions, responses } = state;
    const isCompleted = state.status === 'completed';
    const insights = state.status === 'completed' ? state.insights : [];

    const showAllQuestions = () => {
      const questionsList = questions.map((q, i) => `${i + 1}. ${q.text}`).join('\n');
      alert(
        `🤖 Auto-Generated Questions for ${user.name}\n\n` +
        `Based on ${user.metrics.deviationCount} deviation(s):\n\n` +
        questionsList +
        `\n\n✓ Questions tailored to user's specific deviations\n` +
        `✓ AI-powered analysis of process patterns`
      );
    };

    return (
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Interview: {user.name}</h1>
            <p className="text-muted">
              {isCompleted
                ? `Interview completed - ${insights.length} insights extracted`
                : `Question ${state.currentQuestion + 1} of ${questions.length}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={showAllQuestions}>
              <Sparkles className="w-4 h-4 mr-2" />
              View Questions
            </Button>
            <Button variant="outline" onClick={resetInterview}>
              Interview Another User
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b border-surface-3">
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {questions.slice(0, isCompleted ? questions.length : state.currentQuestion + 1).map((q, index) => {
                  const response = responses[index];

                  return (
                    <div key={q.id} className="space-y-3">
                      {/* Question */}
                      <div className="flex gap-3 chat-message">
                        <div className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-accent-blue" />
                        </div>
                        <div className="flex-1 bg-surface-2 rounded-lg p-4">
                          <p className="text-sm font-medium mb-1 text-accent-blue">AI Interviewer</p>
                          <p className="text-sm">{q.text}</p>
                        </div>
                      </div>

                      {/* Response */}
                      {response && (
                        <div className="flex gap-3 chat-message ml-12">
                          <div className="flex-1 bg-accent-blue/5 rounded-lg p-4 border border-accent-blue/20">
                            <p className="text-sm font-medium mb-1">{user.name}</p>
                            <p className="text-sm">{response.text}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {!isCompleted && state.status === 'questioning' && (
                  <div className="flex justify-center pt-4">
                    <Button onClick={simulateResponse}>
                      <Send className="w-4 h-4 mr-2" />
                      Simulate Response
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insights Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent-amber" />
                  Insights
                </CardTitle>
                <CardDescription>
                  {isCompleted ? `${insights.length} extracted` : 'Extracting...'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isCompleted ? (
                  <div className="space-y-4">
                    {insights.map(insight => (
                      <div
                        key={insight.id}
                        className={cn(
                          'p-4 rounded-lg border-l-4',
                          insight.priority === 'high'
                            ? 'border-accent-rose bg-accent-rose/5'
                            : insight.priority === 'medium'
                            ? 'border-accent-amber bg-accent-amber/5'
                            : 'border-accent-blue bg-accent-blue/5'
                        )}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {insight.priority === 'high' ? (
                            <AlertCircle className="w-4 h-4 text-accent-rose mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-accent-amber mt-0.5" />
                          )}
                          <div className="flex-1">
                            <Badge
                              variant={
                                insight.priority === 'high'
                                  ? 'rose'
                                  : insight.priority === 'medium'
                                  ? 'amber'
                                  : 'blue'
                              }
                              className="mb-2"
                            >
                              {insight.priority} priority
                            </Badge>
                            <p className="text-sm font-medium mb-1">{insight.summary}</p>
                            {insight.recommendation && (
                              <p className="text-xs text-muted mt-2">
                                💡 {insight.recommendation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {insights.length === 0 && (
                      <p className="text-sm text-muted text-center py-4">
                        No actionable insights detected
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted text-center py-4">
                    Complete the interview to extract insights...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
