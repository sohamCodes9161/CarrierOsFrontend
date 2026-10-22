import { useState, useEffect } from 'react';
import { Search, MapPin, ExternalLink, BookmarkPlus, CheckCircle2, XCircle, Briefcase, DollarSign, Sparkles } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { jobSearchApi } from '../../services/api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { APPLICATION_STATUSES } from '../../utils/constants.js';

export default function LiveSearchTab() {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('Full Stack');
  const [locationQuery, setLocationQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [searching, setSearching] = useState(false);

  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [initialStatus, setInitialStatus] = useState('applied');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(e) {
    if (e) e.preventDefault();
    setSearching(true);
    try {
      const res = await jobSearchApi.searchJobs({ search: searchQuery, location: locationQuery });
      const sortedJobs = (res.postings || []).sort((a, b) => {
        const matchA = a.match?.matchPercentage ?? 0;
        const matchB = b.match?.matchPercentage ?? 0;
        return matchB - matchA;
      });
      setJobs(sortedJobs);
    } catch (err) {
      toast.error(err.message || 'Failed to retrieve job postings');
    } finally {
      setSearching(false);
    }
  }

  function openConvertModal(job) {
    setSelectedJob(job);
    setConvertModalOpen(true);
  }

  async function handleConvertSubmit(e) {
    if (e) e.preventDefault();
    if (!selectedJob) return;
    setConverting(true);
    try {
      await jobSearchApi.convertPostingToApplication(
        selectedJob._id || selectedJob.id || 'external-job',
        initialStatus,
        {
          company: selectedJob.company || 'Unknown Company',
          jobTitle: selectedJob.title || selectedJob.jobTitle || 'Unknown Title',
          jobUrl: selectedJob.jobUrl,
          location: selectedJob.location,
          salary: selectedJob.salary,
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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

      {searching ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-12 text-center text-muted border border-dashed border-base-300">
          <Briefcase className="mx-auto h-12 w-12 text-muted/50 mb-3" />
          <p className="text-base font-semibold text-base-content">No jobs found</p>
          <p className="text-xs text-muted mt-1">Try adjusting your search query.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job, idx) => {
            const matchPct = job.match?.matchPercentage ?? 0;
            const alreadyHave = job.match?.alreadyHave || [];
            const missing = job.match?.missing || [];
            const titleText = job.title || job.jobTitle || 'Software Engineer';

            return (
              <Card key={job._id || job.id || idx} className="flex flex-col justify-between p-5 border border-base-300 bg-surface-2 hover:border-primary/50 transition-all shadow-md group">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-base-content text-base group-hover:text-primary transition-colors line-clamp-2">
                        {job.jobUrl ? (
                          <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1.5">
                            <span>{titleText}</span>
                            <ExternalLink className="h-3.5 w-3.5 text-muted group-hover:text-primary transition-colors" />
                          </a>
                        ) : titleText}
                      </h3>
                      <p className="text-xs text-muted font-medium flex items-center gap-1.5">
                        <strong className="text-base-content">{job.company}</strong>
                        <span>•</span>
                        <span>{job.location || 'Remote'}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-center justify-center h-12 w-12 rounded-full border-2 border-primary bg-surface-1 font-black text-base-content shadow-pop">
                      <span className="text-xs font-black">{matchPct}%</span>
                      <span className="text-[7px] uppercase tracking-wider text-muted font-bold">Match</span>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl bg-surface-1 p-3 border border-base-300/50">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" /> Skill Match Analysis:
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {alreadyHave.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success border border-success/30">
                          <CheckCircle2 className="h-3 w-3 shrink-0" /> {skill}
                        </span>
                      ))}
                      {missing.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted border border-base-300">
                          <XCircle className="h-3 w-3 shrink-0 text-error/80" /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-base-300/60 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-muted flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-muted/70" />
                    {job.salary?.min ? `${job.salary.currency || 'USD'} ${job.salary.min?.toLocaleString()}` : 'Competitive Salary'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="xs" variant="primary" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openConvertModal(job); }} className="rounded-lg text-xs flex items-center gap-1">
                      <BookmarkPlus className="h-3 w-3" /> Convert & Track
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={convertModalOpen} onClose={() => setConvertModalOpen(false)} title="Convert to Tracked Application">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Track <strong className="text-base-content">{selectedJob?.title || selectedJob?.jobTitle}</strong> at <strong className="text-base-content">{selectedJob?.company}</strong> in your active job application tracker.
          </p>
          <div>
            <label className="label text-xs font-semibold text-base-content">Select Initial Pipeline Stage</label>
            <select value={initialStatus} onChange={(e) => setInitialStatus(e.target.value)} className="select select-bordered w-full rounded-xl bg-surface-1 text-sm">
              {APPLICATION_STATUSES.map((st) => (
                <option key={st.key} value={st.key}>{st.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setConvertModalOpen(false)}>Cancel</Button>
            <Button type="button" loading={converting} onClick={handleConvertSubmit}>Save to Pipeline</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}