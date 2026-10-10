import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { jobApplicationsApi } from '../../services/api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { APPLICATION_STATUSES } from '../../utils/constants.js';
import PipelineJobCard from './PipelineJobCard.jsx';

export default function PipelineTrackerTab() {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    fetchTrackerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTrackerData() {
    setLoadingApps(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        jobApplicationsApi.getJobApplications({ limit: 100 }),
        jobApplicationsApi.getApplicationStats(),
      ]);
      const applicationsList = appsRes?.applications || appsRes?.data || appsRes || [];
      setApplications(Array.isArray(applicationsList) ? applicationsList : []);
      setStats(statsRes?.data || statsRes || null);
    } catch (err) {
      toast.error('Failed to load application pipeline');
    } finally {
      setLoadingApps(false);
    }
  }

  async function handleStatusChange(appId, newStatus) {
    try {
      await jobApplicationsApi.updateJobApplication(appId, { status: newStatus });
      toast.success('Application stage updated');
      fetchTrackerData(); // Refresh board
    } catch (err) {
      toast.error('Failed to update stage');
    }
  }

  async function handleDelete(appId) {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await jobApplicationsApi.deleteJobApplication(appId);
      toast.success('Application deleted');
      setApplications((prev) => prev.filter(app => app._id !== appId));
    } catch (err) {
      toast.error('Failed to delete application');
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {APPLICATION_STATUSES.map((st) => (
            <Card key={st.key} className="p-3 text-center border border-base-300 bg-surface-2 shadow-sm">
              <p className="text-xs text-muted font-medium">{st.label}</p>
              <p className="text-xl font-black text-white mt-1">{stats[st.key] || 0}</p>
            </Card>
          ))}
        </div>
      )}

      {loadingApps ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {APPLICATION_STATUSES.map((status) => {
            const statusApps = applications.filter((app) => app.status === status.key);
            return (
              <div key={status.key} className="w-80 flex-shrink-0 flex flex-col gap-3 rounded-2xl border border-base-300 bg-surface-1/50 p-3 snap-start">
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-sm font-bold text-white tracking-wide">{status.label}</span>
                  <Badge variant="ghost" className="bg-surface-3">{statusApps.length}</Badge>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto max-h-[65vh] pr-1 scrollbar-thin">
                  {statusApps.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-base-300/50 p-6 text-center text-xs text-muted/60 italic">
                      Empty
                    </div>
                  ) : (
                    statusApps.map((app) => (
                      <PipelineJobCard 
                        key={app._id} 
                        app={app} 
                        onStatusChange={handleStatusChange} 
                        onDelete={handleDelete} 
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}