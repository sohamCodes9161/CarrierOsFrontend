import { useState, useEffect } from 'react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Badge from '../../components/ui/Badge.jsx';
import {Skeleton} from '../../components/ui/Skeleton.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ScoreRing from '../../components/ui/ScoreRing.jsx';
import { jobSearchApi, jobApplicationsApi } from '../../services/api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { APPLICATION_STATUSES } from '../../utils/constants.js';

export default function JobSearchPage() {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'tracker'
  const toast = useToast();

  // Search State
  const [searchQuery, setSearchQuery] = useState('Software Engineer');
  const [locationQuery, setLocationQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [searching, setSearching] = useState(false);

  // Application Tracker State
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingApps, setLoadingApps] = useState(false);

  // Convert Modal State
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [initialStatus, setInitialStatus] = useState('applied');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (activeTab === 'search') {
      handleSearch();
    } else {
      fetchTrackerData();
    }
  }, [activeTab]);

  async function handleSearch(e) {
    if (e) e.preventDefault();
    setSearching(true);
    try {
      const res = await jobSearchApi.searchJobs({ search: searchQuery, location: locationQuery });
      setJobs(res.postings || []);
    } catch (err) {
      toast.error(err.message || 'Failed to search jobs');
    } finally {
      setSearching(false);
    }
  }

  async function fetchTrackerData() {
    setLoadingApps(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        jobApplicationsApi.getJobApplications({ limit: 50 }),
        jobApplicationsApi.getApplicationStats(),
      ]);
      setApplications(appsRes.applications || []);
      setStats(statsRes || null);
    } catch (err) {
      toast.error('Failed to load application pipeline');
    } finally {
      setLoadingApps(false);
    }
  }

  function openConvertModal(job) {
    setSelectedJob(job);
    setConvertModalOpen(true);
  }

  async function handleConvertSubmit() {
    if (!selectedJob) return;
    setConverting(true);
    try {
      await jobSearchApi.convertPostingToApplication(selectedJob._id || selectedJob.id, initialStatus, {
        company: selectedJob.company,
        title: selectedJob.title || selectedJob.jobTitle,
        jobUrl: selectedJob.jobUrl,
        location: selectedJob.location,
        workplaceType: selectedJob.workplaceType,
        employmentType: selectedJob.employmentType,
        salary: selectedJob.salary,
        requiredSkills: selectedJob.requiredSkills,
      });
      toast.success('Job converted to tracked application!');
      setConvertModalOpen(false);
      setSelectedJob(null);
    } catch (err) {
      toast.error(err.message || 'Could not convert job');
    } finally {
      setConverting(false);
    }
  }

  async function handleStatusChange(appId, newStatus) {
    try {
      await jobApplicationsApi.updateJobApplication(appId, { status: newStatus });
      toast.success('Status updated');
      fetchTrackerData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Job Search & Tracker"
        description="Search real-time jobs matched against your career profile and track your application pipeline."
      >
        <div className="flex gap-2 rounded-full border border-base-300 bg-surface-2 p-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`btn btn-sm rounded-full ${activeTab === 'search' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Live Search
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`btn btn-sm rounded-full ${activeTab === 'tracker' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Pipeline Tracker
          </button>
        </div>
      </PageHeader>

      {activeTab === 'search' ? (
        <div className="space-y-6">
          <Card className="p-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Role or keywords (e.g. Full Stack)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full rounded-xl bg-surface-1"
              />
              <input
                type="text"
                placeholder="Location (e.g. Remote, NY)"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="input input-bordered w-full rounded-xl bg-surface-1 sm:w-64"
              />
              <Button type="submit" loading={searching} className="rounded-xl">
                Search
              </Button>
            </form>
          </Card>

          {searching ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="p-8 text-center text-muted">No jobs found. Try adjusting your search query.</Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map((job, idx) => (
                <Card key={job._id || job.id || idx} className="flex flex-col justify-between p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">{job.title || job.jobTitle}</h3>
                        <p className="text-sm text-muted">{job.company} • {job.location || 'Remote'}</p>
                      </div>
                      <ScoreRing score={job.match?.matchPercentage || 0} size="sm" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted">Skill Match Analysis:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.match?.alreadyHave?.map((skill) => (
                          <Badge key={skill} variant="success" className="text-[10px]">
                            ✓ {skill}
                          </Badge>
                        ))}
                        {job.match?.missing?.map((skill) => (
                          <Badge key={skill} variant="error" className="text-[10px]">
                            ✕ {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-base-300/50 pt-3">
                    <span className="text-xs text-muted">
                      {job.salary?.min ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}` : 'Competitive Salary'}
                    </span>
                    <Button size="sm" variant="secondary" onClick={() => openConvertModal(job)}>
                      Convert & Track
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* PIPELINE TRACKER VIEW */
        <div className="space-y-6">
          {stats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {APPLICATION_STATUSES.map((st) => (
                <Card key={st.key} className="p-3 text-center">
                  <p className="text-xs text-muted">{st.label}</p>
                  <p className="text-lg font-bold text-white">{stats[st.key] || 0}</p>
                </Card>
              ))}
            </div>
          )}

          {loadingApps ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {APPLICATION_STATUSES.map((status) => {
                const statusApps = applications.filter((app) => app.status === status.key);
                return (
                  <div key={status.key} className="space-y-3 rounded-2xl border border-base-300 bg-surface-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{status.label}</span>
                      <Badge variant="ghost">{statusApps.length}</Badge>
                    </div>

                    <div className="space-y-2">
                      {statusApps.map((app) => (
                        <Card key={app._id} className="p-3 space-y-2 bg-surface-1">
                          <p className="font-medium text-white">{app.jobTitle}</p>
                          <p className="text-xs text-muted">{app.company}</p>

                          <div className="flex items-center justify-between pt-2">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                              className="select select-ghost select-xs text-xs rounded-lg bg-surface-3 text-muted"
                            >
                              {APPLICATION_STATUSES.map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONVERT MODAL */}
      <Modal isOpen={convertModalOpen} onClose={() => setConvertModalOpen(false)} title="Convert to Tracked Application">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Track <strong className="text-white">{selectedJob?.title || selectedJob?.jobTitle}</strong> at <strong className="text-white">{selectedJob?.company}</strong> in your pipeline.
          </p>

          <div>
            <label className="label text-xs font-semibold">Select Initial Pipeline Stage</label>
            <select
              value={initialStatus}
              onChange={(e) => setInitialStatus(e.target.value)}
              className="select select-bordered w-full rounded-xl bg-surface-1"
            >
              {APPLICATION_STATUSES.map((st) => (
                <option key={st.key} value={st.key}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setConvertModalOpen(false)}>
              Cancel
            </Button>
            <Button loading={converting} onClick={handleConvertSubmit}>
              Save to Pipeline
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}