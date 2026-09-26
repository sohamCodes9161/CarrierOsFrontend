import { useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function QuizHistoryTab({ history = [], onReviewDebrief }) {
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('ALL');
  const [expandedTopics, setExpandedTopics] = useState({});

  const groupedByTopic = history.reduce((acc, attempt) => {
    const topic = attempt.topic || 'General Assessment';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(attempt);
    return acc;
  }, {});

  Object.keys(groupedByTopic).forEach((topic) => {
    groupedByTopic[topic].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  });

  const topicKeys = Object.keys(groupedByTopic);
  const filteredTopicKeys = selectedTopicFilter === 'ALL'
    ? topicKeys
    : topicKeys.filter((t) => t === selectedTopicFilter);

  function toggleTopic(topic) {
    setExpandedTopics((prev) => ({ ...prev, [topic]: !prev[topic] }));
  }

  function handleAttemptClick(e, attempt) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onReviewDebrief === 'function') {
      onReviewDebrief(attempt);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Assessment Mastery History</h3>
          <p className="text-xs text-muted">Grouped by topic hierarchy and daily progression</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted">Filter Topic:</span>
          <select
            value={selectedTopicFilter}
            onChange={(e) => setSelectedTopicFilter(e.target.value)}
            className="select select-bordered select-sm rounded-xl bg-surface-1 text-xs"
          >
            <option value="ALL">All Topics ({topicKeys.length})</option>
            {topicKeys.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredTopicKeys.length === 0 ? (
        <Card className="p-8 text-center text-muted">
          No assessment history found. Complete a quiz to view topic mastery breakdown!
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTopicKeys.map((topic) => {
            const attempts = groupedByTopic[topic];
            const isExpanded = expandedTopics[topic] ?? true;
            const isMultiDay = attempts.length > 1;

            const avgAccuracy = Math.round(
              attempts.reduce((acc, curr) => acc + (curr.accuracyPercentage || 0), 0) / attempts.length
            );

            return (
              <Card key={topic} className="overflow-hidden border border-base-300 bg-surface-2 p-0">
                {/* Topic Accordion Header */}
                <div
                  onClick={() => toggleTopic(topic)}
                  className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-surface-3/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                      {avgAccuracy}%
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{topic}</h4>
                      <p className="text-xs text-muted">
                        {isMultiDay ? `${attempts.length}-Day Spaced Journey` : '1-Time Assessment'} • Avg Accuracy: {avgAccuracy}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isMultiDay ? 'primary' : 'ghost'} className="text-xs">
                      {attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'}
                    </Badge>
                    <Icon
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      className="h-5 w-5 text-muted transition-transform"
                    />
                  </div>
                </div>

                {/* Expanded Day-by-Day List */}
                {isExpanded && (
                  <div className="border-t border-base-300/50 bg-surface-1 p-4 space-y-2">
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                      {isMultiDay ? 'Daily Mastery Sequence' : 'Attempt Details'}
                    </p>

                    <div className="grid gap-2">
                      {attempts.map((attempt, idx) => {
                        const dayLabel = isMultiDay ? `Day ${idx + 1}` : 'Single Session';
                        const dateStr = new Date(attempt.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={attempt._id}
                            onClick={(e) => handleAttemptClick(e, attempt)}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-base-300/60 bg-surface-2 p-3.5 transition-all hover:border-primary hover:bg-surface-3/80 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="ghost" className="font-bold text-white text-xs px-2.5 py-1">
                                {dayLabel}
                              </Badge>
                              <div>
                                <p className="text-xs font-semibold text-white group-hover:text-primary transition-colors">
                                  {attempt.score} Pts • {attempt.accuracyPercentage}% Accuracy
                                </p>
                                <p className="text-[10px] text-muted">{dateStr}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              {attempt.timeBonusMultiplier > 1.0 && (
                                <Badge variant="success" className="text-[10px]">
                                  ⚡ {attempt.timeBonusMultiplier}x Speed
                                </Badge>
                              )}
                              <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
                                View Full Stats & Debrief →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}