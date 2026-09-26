import { useState, useEffect } from 'react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { quizApi } from '../../services/api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  getQuizStreakData,
  updateQuizStreak,
  getDuePrograms,
  completeProgramDay,
} from '../../utils/quizSpacedEngine.js';

import QuizGeneratorForm from './QuizGeneratorForm.jsx';
import ActiveQuizSession from './ActiveQuizSession.jsx';
import QuizDebriefModal from './QuizDebriefModal.jsx';
import QuizHistoryTab from './QuizHistoryTab.jsx';

export default function QuizPage() {
  const toast = useToast();
  
  // Default tab is 'due' (Daily Reviews)
  const [activeTab, setActiveTab] = useState('due'); // 'due' | 'history' | 'create'

  // Quiz Generation & Session State
  const [generating, setGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Spaced Engine & Analytics State
  const [streak, setStreak] = useState(() => getQuizStreakData().count);
  const [duePrograms, setDuePrograms] = useState(() => getDuePrograms());
  const [activeDebrief, setActiveDebrief] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await quizApi.getQuizHistory();
      setHistory(res || []);
    } catch {
      // Non-blocking
    }
  }

  async function handleStartQuiz(config) {
    setGenerating(true);
    try {
      const quiz = await quizApi.generateQuiz(config);
      setActiveQuiz(quiz);
      toast.success('Adaptive Quiz Ready!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmitQuiz(submissionData) {
    setSubmitting(true);
    try {
      // 1. Submit quiz to backend
      const attempt = await quizApi.submitQuiz(submissionData);

      // 2. Advance spaced program & update daily streak
      if (attempt?.topic) {
        completeProgramDay(attempt.topic, attempt.accuracyPercentage || 0);
      }
      const newStreak = updateQuizStreak();
      setStreak(newStreak);
      setDuePrograms(getDuePrograms());

      // 3. Clear active quiz and IMMEDIATELY trigger AI debrief modal
      setActiveQuiz(null);
      setActiveDebrief(attempt);
      toast.success('Quiz Completed & Graded!');

      // 4. Refresh history in background
      fetchHistory();
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }

  function handleQuickLaunchDue(program) {
    handleStartQuiz({
      topic: program.topic,
      roadmapId: program.roadmapId,
      nodeId: program.nodeId,
      questionCount: program.questionCount,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Adaptive Spaced-Quiz & Mastery Hub"
        description="Daily spaced repetition engine, adaptive difficulty tiers, and instant AI debriefs."
      >
        <div className="flex items-center gap-3">
          <Badge variant="warning" className="gap-1 px-3 py-1.5 text-xs font-bold shadow-pop">
            🔥 {streak}-Day Streak
          </Badge>
          {!activeQuiz && (
            <Button
              size="sm"
              onClick={() => setActiveTab('create')}
              className="rounded-full gap-1"
            >
              <Icon name="plus" className="h-4 w-4" />
              New Quiz
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Mode Navigation Bar */}
      {!activeQuiz && (
        <div className="flex justify-center">
          <div className="flex gap-1 rounded-full border border-base-300 bg-surface-2 p-1 shadow-pop">
            <button
              onClick={() => setActiveTab('due')}
              className={`btn btn-sm rounded-full relative ${activeTab === 'due' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Daily Reviews
              {duePrograms.length > 0 && (
                <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] text-white">
                  {duePrograms.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`btn btn-sm rounded-full ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
            >
              History & Debriefs
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`btn btn-sm rounded-full ${activeTab === 'create' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Create Quiz
            </button>
          </div>
        </div>
      )}

      {/* Active Session OR Selected View */}
      {activeQuiz ? (
        <ActiveQuizSession
          quiz={activeQuiz}
          onSubmit={handleSubmitQuiz}
          submitting={submitting}
        />
      ) : (
        <>
          {activeTab === 'due' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Scheduled Spaced Practice</h3>
                <span className="text-xs text-muted">{duePrograms.length} Due Today</span>
              </div>

              {duePrograms.length === 0 ? (
                <Card className="p-8 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                    ✓
                  </div>
                  <h4 className="font-bold text-white">All Caught Up for Today!</h4>
                  <p className="text-xs text-muted">
                    No pending daily reviews scheduled. Create a new custom quiz or start a 10-day mastery program!
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('create')}
                    className="rounded-xl mt-2"
                  >
                    Create New Quiz
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {duePrograms.map((prog) => (
                    <Card key={prog.id} className="p-4 flex items-center justify-between gap-4 bg-surface-2">
                      <div>
                        <p className="font-bold text-white">{prog.topic}</p>
                        <p className="text-xs text-muted">
                          Day {prog.currentDay} of {prog.totalDays} Spaced Program
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleQuickLaunchDue(prog)} className="rounded-xl">
                        Start Practice
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <QuizHistoryTab
              history={history}
              onReviewDebrief={(attempt) => setActiveDebrief(attempt)}
            />
          )}

          {activeTab === 'create' && (
            <QuizGeneratorForm
              onStartQuiz={handleStartQuiz}
              loading={generating}
              history={history}
            />
          )}
        </>
      )}

      {/* REUSABLE AI DEBRIEF MODAL */}
      <QuizDebriefModal
        attempt={activeDebrief}
        isOpen={!!activeDebrief}
        onClose={() => setActiveDebrief(null)}
      />
    </div>
  );
}