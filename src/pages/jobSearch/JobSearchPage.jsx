import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import LiveSearchTab from './LiveSearchTab.jsx';
import PipelineTrackerTab from './PipelineTrackerTab.jsx';

export default function JobSearchPage() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Job Search & Tracker"
        description="Search real-time jobs matched against your career profile and track your application pipeline."
      />

      <div className="flex justify-center mb-6">
        <div className="flex gap-2 rounded-full border border-base-300 bg-surface-2 p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('search')}
            className={`btn btn-sm rounded-full font-medium transition-all ${
              activeTab === 'search' 
                ? 'btn-primary shadow-sm' 
                : 'btn-ghost text-muted hover:text-base-content'
            }`}
          >
            Live Search
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`btn btn-sm rounded-full font-medium transition-all ${
              activeTab === 'tracker' 
                ? 'btn-primary shadow-sm' 
                : 'btn-ghost text-muted hover:text-base-content'
            }`}
          >
            Pipeline Tracker
          </button>
        </div>
      </div>

      {activeTab === 'search' ? <LiveSearchTab /> : <PipelineTrackerTab />}
    </div>
  );
}