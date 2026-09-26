import { Link } from 'react-router-dom';
import StatCard from '../components/ui/StatCard.jsx';
import ScoreRing from '../components/ui/ScoreRing.jsx';
import { humanize, pluralize, timeAgo } from '../utils/format.js';

export default function StatsGrid({
  resumeStat,
  githubStat,
  interviewStat,
  roadmapStat,
  careerReadinessStat,
  portfolioStat
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        to={resumeStat.to}
        icon={resumeStat.icon}
        label={resumeStat.label}
        loading={resumeStat.loading}
        value={resumeStat.value}
        hint={resumeStat.hint}
        accessory={resumeStat.accessory}
      />
      <StatCard
        to={githubStat.to}
        icon={githubStat.icon}
        label={githubStat.label}
        loading={githubStat.loading}
        value={githubStat.value}
        hint={githubStat.hint}
      />
      <StatCard
        to={interviewStat.to}
        icon={interviewStat.icon}
        label={interviewStat.label}
        loading={interviewStat.loading}
        value={interviewStat.value}
        hint={interviewStat.hint}
      />
      <StatCard
        to={roadmapStat.to}
        icon={roadmapStat.icon}
        label={roadmapStat.label}
        loading={roadmapStat.loading}
        value={roadmapStat.value}
        hint={roadmapStat.hint}
      />
      <StatCard
        to={careerReadinessStat.to}
        icon={careerReadinessStat.icon}
        label={careerReadinessStat.label}
        loading={careerReadinessStat.loading}
        value={careerReadinessStat.value}
        hint={careerReadinessStat.hint}
      />
      <StatCard
        to={portfolioStat.to}
        icon={portfolioStat.icon}
        label={portfolioStat.label}
        loading={portfolioStat.loading}
        value={portfolioStat.value}
        hint={portfolioStat.hint}
      />
    </div>
  );
}