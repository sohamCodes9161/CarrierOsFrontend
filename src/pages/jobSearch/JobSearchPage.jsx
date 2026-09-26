import { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ExternalLink, 
  BookmarkPlus, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  DollarSign, 
  Sparkles, 
  Filter 
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { jobSearchApi, jobApplicationsApi } from '../../services/api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { APPLICATION_STATUSES } from '../../utils/constants.js';

export default function JobSearchPage() {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'tracker'
  const toast = useToast();

  // Search State
  const [searchQuery, setSearchQuery] = useState('Full Stack');
  const [locationQuery, setLocationQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [searching, setSearching] = useState(false);

  // Application Pipeline Tracker State
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingApps, setLoadingApps] = useState(false);

  // Convert & Track Modal State
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

  /**
   * Executes job search against /api/v1/job-search
   */
  async function handleSearch(e) {
    if (e) e.preventDefault();
    setSearching(true);
    try {
      const res = await jobSearchApi.searchJobs({ 
        search: searchQuery, 
        location: locationQuery 
      });
      setJobs(res.postings || []);
    } catch (err) {
      toast.error(err.message || 'Failed to retrieve job postings');
    } finally {
      setSearching(false);
    }
  }

  /**
   * Fetches applications for the tracker view
   */
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

  /**
   * Converts external posting into tracked application
   */
  async function handleConvertSubmit() {
    if (!selectedJob) return;
    setConverting(true);
    try {
      await jobSearchApi.convertPostingToApplication(
        selectedJob._id || selectedJob.id,
        initialStatus,
        {
          company: selectedJob.company,
          title: selectedJob.title || selectedJob.jobTitle,
          jobUrl: selectedJob.jobUrl,
          location: selectedJob.location,
          workplaceType: selectedJob.workplaceType,
          employmentType: selectedJob.employmentType,
          salary: selectedJob.salary,
          requiredSkills: selectedJob.requiredSkills,
        }
      );
      toast.success('Job successfully added to your application tracker!');
      setConvertModalOpen(false);
      setSelectedJob(null);
    } catch (err) {
      toast.error(err.message || 'Could not convert job to tracked application');
    } finally {
      setConverting(false);
    }
  }

  async function handleStatusChange(appId, newStatus) {
    try {
      await jobApplicationsApi.updateJobApplication(appId, { status: newStatus });
      toast.success('Application stage updated');
      fetchTrackerData();
    } catch (err) {
      toast.error('Failed to update stage');
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Navigation Tabs */}
      <PageHeader
        title="Live Job Search & Tracker"
        description="Search real-time jobs matched against your career profile and track your application pipeline."
      >
        <div className="flex gap-2 rounded-full border border-base-300 bg-surface-2 p-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`btn btn-sm rounded-full font-medium transition-all ${
              activeTab === 'search' 
                ? 'btn-primary shadow-sm' 
                : 'btn-ghost text-muted hover:text-white'
            }`}
          >
            Live Search
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`btn btn-sm rounded-full font-medium transition-all ${
              activeTab === 'tracker' 
                ? 'btn-primary shadow-sm' 
                : 'btn-ghost text-muted hover:text-white'
            }`}
          >
            Pipeline Tracker
          </button>
        </div>
      </PageHeader>

      {/* ================= LIVE SEARCH VIEW ================= */}
      {activeTab === 'search' ? (
        <div className="space-y-6">
          {/* Top Search & Filter Bar */}
          <Card className="p-4 bg-surface-2 border border-base-300/80 shadow-sm">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Role or keywords (e.g. Full Stack, Node.js)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-10 rounded-xl bg-surface-1 text-sm focus:border-primary"
                />
              </div>

              <div className="relative sm:w-64">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Location (e.g. Remote, NY)"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="input input-bordered w-full pl-10 rounded-xl bg-surface-1 text-sm focus:border-primary"
                />
              </div>

              <Button type="submit" loading={searching} className="rounded-xl px-6">
                <Search className="h-4 w-4 mr-1.5" /> Search
              </Button>
            </form>
          </Card>

          {/* Job Listings Grid */}
          {searching ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-52 w-full rounded-2xl" />
              <Skeleton className="h-52 w-full rounded-2xl" />
              <Skeleton className="h-52 w-full rounded-2xl" />
              <Skeleton className="h-52 w-full rounded-2xl" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="p-12 text-center text-muted border border-dashed border-base-300">
              <Briefcase className="mx-auto h-12 w-12 text-muted/50 mb-3" />
              <p className="text-base font-semibold text-white">No jobs found</p>
              <p className="text-xs text-muted mt-1">
                Try adjusting your search query or location filters to find matching postings.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map((job, idx) => {
                const matchPct = job.match?.matchPercentage ?? 0;
                const alreadyHave = job.match?.alreadyHave || [];
                const missing = job.match?.missing || [];
                const titleText = job.title || job.jobTitle || 'Software Engineer';

                return (
                  <Card
                    key={job._id || job.id || idx}
                    className="flex flex-col justify-between p-5 border border-base-300 bg-surface-2 hover:border-primary/50 transition-all shadow-md group"
                  >
                    <div className="space-y-4">
                      {/* Top Header: Title, Company & Match Ring */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-white text-base group-hover:text-primary transition-colors line-clamp-2">
                            {job.jobUrl ? (
                              <a
                                href={job.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline inline-flex items-center gap-1.5"
                              >
                                <span>{titleText}</span>
                                <ExternalLink className="h-3.5 w-3.5 text-muted group-hover:text-primary transition-colors" />
                              </a>
                            ) : (
                              titleText
                            )}
                          </h3>
                          <p className="text-xs text-muted font-medium flex items-center gap-1.5">
                            <strong className="text-white">{job.company}</strong>
                            <span>•</span>
                            <span>{job.location || 'Remote'}</span>
                          </p>
                        </div>

                        {/* Match Percentage Circle Badge */}
                        <div className="flex shrink-0 flex-col items-center justify-center h-12 w-12 rounded-full border-2 border-primary bg-surface-1 font-black text-white shadow-pop">
                          <span className="text-xs font-black">{matchPct}%</span>
                          <span className="text-[7px] uppercase tracking-wider text-muted font-bold">
                            Match
                          </span>
                        </div>
                      </div>

                      {/* Skill Match Analysis Breakdown */}
                      <div className="space-y-2 rounded-xl bg-surface-1 p-3 border border-base-300/50">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary" /> Skill Match Analysis:
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {alreadyHave.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success border border-success/30"
                            >
                              <CheckCircle2 className="h-3 w-3 shrink-0" /> {skill}
                            </span>
                          ))}
                          {missing.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted border border-base-300"
                            >
                              <XCircle className="h-3 w-3 shrink-0 text-error/80" /> {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-5 pt-3 border-t border-base-300/60 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-muted flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-muted/70" />
                        {job.salary?.min || job.salary?.max
                          ? `${job.salary.currency || 'INR'} ${
                              job.salary.min?.toLocaleString() || ''
                            } - ${job.salary.max?.toLocaleString() || ''}`
                          : 'Competitive Salary'}
                      </span>

                      <div className="flex items-center gap-2">
                        {job.jobUrl && (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-ghost text-primary border border-primary/30 hover:bg-primary/10 rounded-lg text-xs flex items-center gap-1"
                          >
                            Apply <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => openConvertModal(job)}
                          className="rounded-lg text-xs flex items-center gap-1"
                        >
                          <BookmarkPlus className="h-3 w-3" /> Convert & Track
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ================= PIPELINE TRACKER VIEW ================= */
        <div className="space-y-6">
          {stats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {APPLICATION_STATUSES.map((st) => (
                <Card key={st.key} className="p-3 text-center border border-base-300">
                  <p className="text-xs text-muted">{st.label}</p>
                  <p className="text-lg font-bold text-white mt-1">{stats[st.key] || 0}</p>
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
                  <div
                    key={status.key}
                    className="space-y-3 rounded-2xl border border-base-300 bg-surface-2 p-4"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-base-300/60">
                      <span className="text-sm font-semibold text-white">{status.label}</span>
                      <Badge variant="ghost">{statusApps.length}</Badge>
                    </div>

                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {statusApps.length === 0 ? (
                        <p className="text-xs text-muted/60 text-center py-4 italic">
                          No applications in this stage
                        </p>
                      ) : (
                        statusApps.map((app) => (
                          <Card key={app._id} className="p-3 space-y-2 bg-surface-1 border border-base-300/80">
                            <p className="font-medium text-white text-sm">{app.jobTitle}</p>
                            <p className="text-xs text-muted">{app.company}</p>

                            <div className="flex items-center justify-between pt-2">
                              <select
                                value={app.status}
                                onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                className="select select-ghost select-xs text-xs rounded-lg bg-surface-3 text-muted border border-base-300"
                              >
                                {APPLICATION_STATUSES.map((s) => (
                                  <option key={s.key} value={s.key}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONVERT MODAL */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="Convert to Tracked Application"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Track{' '}
            <strong className="text-white">
              {selectedJob?.title || selectedJob?.jobTitle}
            </strong>{' '}
            at <strong className="text-white">{selectedJob?.company}</strong> in your active job application tracker.
          </p>

          <div>
            <label className="label text-xs font-semibold text-white">
              Select Initial Pipeline Stage
            </label>
            <select
              value={initialStatus}
              onChange={(e) => setInitialStatus(e.target.value)}
              className="select select-bordered w-full rounded-xl bg-surface-1 text-sm"
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