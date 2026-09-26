import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { careerProfileApi, roadmapApi } from '../../services/api/index.js';
import { createSpacedProgram } from '../../utils/quizSpacedEngine.js';

export default function QuizGeneratorForm({ onStartQuiz, loading, history = [], initialTopic = '' }) {
  const [creationMode, setCreationMode] = useState('custom'); // 'custom' | 'roadmap'
  const [topic, setTopic] = useState(initialTopic || 'System Architecture');
  const [questionCount, setQuestionCount] = useState(5);
  const [roadmapId, setRoadmapId] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [programDays, setProgramDays] = useState('1'); // '1' = single session, '10' = 10-day program

  const [profileSkills, setProfileSkills] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [roadmapNodes, setRoadmapNodes] = useState([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(false);
  const [loadingNodes, setLoadingNodes] = useState(false);

  // Load Profile Skills & Roadmaps on Mount
  useEffect(() => {
    async function loadMetadata() {
      setLoadingRoadmaps(true);
      try {
        const [profileRes, roadmapRes] = await Promise.allSettled([
          careerProfileApi.getProfile(),
          roadmapApi.listRoadmaps(),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value?.skills) {
          setProfileSkills(profileRes.value.skills);
        }

        if (roadmapRes.status === 'fulfilled') {
          const raw = roadmapRes.value;
          // Handles array directly OR wrapped { roadmaps: [...] }
          const list = Array.isArray(raw) ? raw : raw?.roadmaps || [];
          setRoadmaps(list);
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      } finally {
        setLoadingRoadmaps(false);
      }
    }
    loadMetadata();
  }, []);

  // Re-fetch roadmaps if user switches to 'roadmap' mode and list is empty
  useEffect(() => {
    if (creationMode === 'roadmap' && roadmaps.length === 0) {
      setLoadingRoadmaps(true);
      roadmapApi.listRoadmaps()
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.roadmaps || [];
          setRoadmaps(list);
        })
        .catch((err) => console.error('Error fetching roadmaps:', err))
        .finally(() => setLoadingRoadmaps(false));
    }
  }, [creationMode, roadmaps.length]);

  // Fetch roadmap nodes dynamically when a roadmap is selected
  useEffect(() => {
    if (!roadmapId) {
      setRoadmapNodes([]);
      setNodeId('');
      return;
    }

    setLoadingNodes(true);
    roadmapApi.getRoadmap(roadmapId)
      .then((roadmap) => {
        // roadmapApi.getRoadmap(id) returns data.roadmap directly
        const nodes = roadmap?.nodes || [];
        setRoadmapNodes(nodes);
      })
      .catch(() => setRoadmapNodes([]))
      .finally(() => setLoadingNodes(false));

    setNodeId('');
  }, [roadmapId]);

  function handleNodeChange(selectedNodeId) {
    setNodeId(selectedNodeId);
    if (selectedNodeId) {
      const nodeObj = roadmapNodes.find((n) => (n._id || n.id) === selectedNodeId);
      if (nodeObj && (nodeObj.title || nodeObj.label || nodeObj.skill)) {
        setTopic(nodeObj.title || nodeObj.label || nodeObj.skill);
      }
    }
  }

  // Calculate adaptive difficulty tier
  const pastAttempts = history.filter(
    (h) => h.topic?.toLowerCase().trim() === topic.toLowerCase().trim()
  );
  const totalAttempts = pastAttempts.length;
  const avgAccuracy = totalAttempts > 0
    ? pastAttempts.reduce((acc, curr) => acc + (curr.accuracyPercentage || 0), 0) / totalAttempts
    : 0;

  let estimatedTier = { label: 'Easy (Baseline)', variant: 'info' };
  if (totalAttempts > 0) {
    if (avgAccuracy >= 80 || totalAttempts >= 4) {
      estimatedTier = { label: 'Mastery Tier (Hard/Medium)', variant: 'error' };
    } else if (avgAccuracy >= 60 || totalAttempts >= 2) {
      estimatedTier = { label: 'Balanced Tier (Medium/Easy)', variant: 'warning' };
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!topic.trim()) return;

    if (programDays !== '1') {
      createSpacedProgram({
        topic: topic.trim(),
        roadmapId: roadmapId || null,
        nodeId: nodeId || null,
        days: Number(programDays),
        questionCount: Number(questionCount),
      });
    }

    const payload = {
      topic: topic.trim(),
      questionCount: Number(questionCount),
    };

    if (roadmapId && roadmapId.trim() !== '') payload.roadmapId = roadmapId;
    if (nodeId && nodeId.trim() !== '') payload.nodeId = nodeId;

    onStartQuiz(payload);
  }

  return (
    <Card className="mx-auto max-w-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-base-300 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Create Adaptive Quiz</h3>
          <p className="text-xs text-muted">Generate instant practice sessions or multi-day mastery programs</p>
        </div>
        <Badge variant={estimatedTier.variant} className="px-3 py-1 text-xs self-start sm:self-auto">
          {estimatedTier.label}
        </Badge>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-base-300 bg-surface-1 p-1">
        <button
          type="button"
          onClick={() => setCreationMode('custom')}
          className={`btn btn-sm rounded-lg ${creationMode === 'custom' ? 'btn-primary' : 'btn-ghost'}`}
        >
          Custom Skill / Topic
        </button>
        <button
          type="button"
          onClick={() => setCreationMode('roadmap')}
          className={`btn btn-sm rounded-lg ${creationMode === 'roadmap' ? 'btn-primary' : 'btn-ghost'}`}
        >
          From Roadmap Node
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {creationMode === 'custom' ? (
          <div>
            <label className="label text-xs font-semibold text-white">Topic Name</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. System Architecture, React Hooks, Node.js Event Loop"
              className="input input-bordered w-full rounded-xl bg-surface-1"
              required
            />

            {profileSkills.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <span className="text-[11px] font-medium text-muted">Quick select from Profile Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {profileSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setTopic(skill)}
                      className={`btn btn-xs rounded-lg ${
                        topic.toLowerCase() === skill.toLowerCase()
                          ? 'btn-primary'
                          : 'btn-ghost border border-base-300 bg-surface-2 text-muted'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label text-xs font-semibold text-white">Select Roadmap</label>
              <select
                value={roadmapId}
                onChange={(e) => setRoadmapId(e.target.value)}
                disabled={loadingRoadmaps}
                className="select select-bordered w-full rounded-xl bg-surface-1"
                required
              >
                <option value="">
                  {loadingRoadmaps
                    ? 'Loading roadmaps...'
                    : roadmaps.length === 0
                    ? 'No roadmaps found in account'
                    : 'Choose a Roadmap from your account...'}
                </option>
                {roadmaps.map((rm) => (
                  <option key={rm._id || rm.id} value={rm._id || rm.id}>
                    {rm.title || rm.targetRole || 'Saved Roadmap'}
                  </option>
                ))}
              </select>
            </div>

            {roadmapId && (
              <div>
                <label className="label text-xs font-semibold text-white">Select Specific Node</label>
                <select
                  value={nodeId}
                  onChange={(e) => handleNodeChange(e.target.value)}
                  disabled={loadingNodes}
                  className="select select-bordered w-full rounded-xl bg-surface-1 text-xs"
                >
                  <option value="">
                    {loadingNodes ? 'Loading nodes...' : 'Whole Roadmap / Broad Concept'}
                  </option>
                  {roadmapNodes.map((node) => {
                    const id = node._id || node.id;
                    const title = node.title || node.label || node.skill || 'Node';
                    return (
                      <option key={id} value={id}>
                        {title}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label text-xs font-semibold text-white">Questions Per Quiz</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              className="select select-bordered w-full rounded-xl bg-surface-1"
            >
              <option value={3}>3 Questions (Quick Practice)</option>
              <option value={5}>5 Questions (Standard)</option>
              <option value={10}>10 Questions (Deep Assessment)</option>
            </select>
          </div>

          <div>
            <label className="label text-xs font-semibold text-white">Learning Program</label>
            <select
              value={programDays}
              onChange={(e) => setProgramDays(e.target.value)}
              className="select select-bordered w-full rounded-xl bg-surface-1"
            >
              <option value="1">Single Session (Instant Assessment)</option>
              <option value="10">10-Day Spaced Repetition Program</option>
            </select>
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full rounded-xl py-3 text-base font-semibold">
          {programDays !== '1' ? 'Launch 10-Day Mastery Program' : 'Start Adaptive Quiz Now'}
        </Button>
      </form>
    </Card>
  );
}