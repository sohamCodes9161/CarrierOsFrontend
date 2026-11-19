import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { adminApi } from '../../services/api/adminApi.js';

function UsagePill({ count = 0, limit = 2, isAdmin = false }) {
  if (isAdmin) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        ∞ Unlimited
      </span>
    );
  }

  const maxed = count >= limit;
  const active = count > 0 && !maxed;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-xs font-medium ${
        maxed
          ? 'border border-error/30 bg-error/10 text-error'
          : active
            ? 'border border-warning/30 bg-warning/10 text-warning'
            : 'bg-base-300/70 text-muted'
      }`}
    >
      {count} / {limit}
      {maxed && <span className="font-sans text-[10px] uppercase tracking-wide">· Max</span>}
    </span>
  );
}

function UserAvatar({ name = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-base-300 bg-base-200 text-xs font-semibold text-base-content">
      {initials || '?'}
    </div>
  );
}

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all | user | admin

  async function loadAdminData({ silent = false } = {}) {
    try {
      if (!silent) setLoading(true);
      const [statsData, usersData] = await Promise.all([adminApi.getStats(), adminApi.getUsers()]);
      setStats(statsData);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch {
      toast.error('Failed to load admin dashboard.');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResetQuota(user) {
    setResettingId(user._id);
    try {
      await adminApi.resetQuota(user._id);
      // Optimistically update the row immediately without jarring full-page reload
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id
            ? {
                ...u,
                usage: {
                  ...u.usage,
                  interviews: 0,
                  roadmaps: 0,
                  resume_analyses: 0,
                  github_analyses: 0,
                  quizzes: 0,
                  career_profiles: 0,
                  chat_messages: 0,
                },
              }
            : u
        )
      );
      toast.success(`Daily quota reset for ${user.name}`);
      loadAdminData({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Failed to reset quota.');
    } finally {
      setResettingId(null);
    }
  }

  function handleExportCSV() {
    const headers = ['Name,Email,Role,Joined,Roadmaps Today,Interviews Today,Quizzes Today'];
    const rows = users.map(
      (u) =>
        `"${u.name}","${u.email}",${u.role},${new Date(u.createdAt).toLocaleDateString()},${
          u.role === 'admin' ? 'Unlimited' : u.usage?.roadmaps || 0
        },${u.role === 'admin' ? 'Unlimited' : u.usage?.interviews || 0},${
          u.role === 'admin' ? 'Unlimited' : u.usage?.quizzes || 0
        }`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CareerOS_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q || user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchTerm]);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, accent: 'text-base-content' },
    { label: 'Interviews', value: stats?.stats?.totalInterviews || 0, accent: 'text-primary' },
    { label: 'Roadmaps', value: stats?.stats?.totalRoadmaps || 0, accent: 'text-success' },
    { label: 'Resumes', value: stats?.stats?.totalResumes || 0, accent: 'text-info' },
    { label: 'GitHubs', value: stats?.stats?.totalGithubs || 0, accent: 'text-warning' },
    { label: 'Quizzes', value: stats?.stats?.totalQuizzes || 0, accent: 'text-secondary' },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader title="Admin Command Center" description="Loading system metrics..." />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <PageHeader
        title="Admin Command Center"
        description="Monitor platform usage, student daily quotas, and account roles."
        actions={
          <Button variant="outline" size="sm" onClick={() => loadAdminData({ silent: true })}>
            <Icon name="refresh" className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      {/* Aggregate Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((item) => (
          <div key={item.label} className="surface p-4 transition-colors hover:border-base-content/20">
            <p className="text-xs font-medium text-muted">{item.label}</p>
            <p className={`mt-1.5 text-2xl font-bold tabular-nums ${item.accent}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Student Roster & Quota Management */}
      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-base-300 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-semibold text-base-content">Accounts & Daily Quotas</h2>

            {/* Role Filter Pills */}
            <div className="inline-flex rounded-lg border border-base-300 bg-base-200/60 p-0.5 text-xs">
              {[
                { id: 'all', label: `All (${users.length})` },
                { id: 'user', label: 'Students' },
                { id: 'admin', label: 'Admins' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRoleFilter(tab.id)}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    roleFilter === tab.id
                      ? 'bg-base-100 text-base-content shadow-xs'
                      : 'text-muted hover:text-base-content'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Export */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-60">
              <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search name or email…"
                className="w-full rounded-lg border border-base-300 bg-base-200/50 py-1.5 pl-9 pr-3 text-sm text-base-content placeholder:text-muted focus:border-primary focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex-shrink-0">
              <Icon name="document" className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Mobile / Narrow-Panel Card View */}
        <div className="divide-y divide-base-300 md:hidden">
          {filteredUsers.map((user) => {
            const isAdmin = user.role === 'admin';
            const usedToday = (user.usage?.roadmaps || 0) + (user.usage?.interviews || 0) > 0;

            return (
              <div key={user._id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar name={user.name} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-base-content">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isAdmin ? 'bg-primary/15 text-primary' : 'bg-base-300 text-muted'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Roadmaps:</span>
                    <UsagePill count={user.usage?.roadmaps || 0} limit={2} isAdmin={isAdmin} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Interviews:</span>
                    <UsagePill count={user.usage?.interviews || 0} limit={2} isAdmin={isAdmin} />
                  </div>
                </div>

                {!isAdmin && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted">
                      Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <Button
                      size="xs"
                      variant={usedToday ? 'outline' : 'ghost'}
                      loading={resettingId === user._id}
                      disabled={!usedToday}
                      onClick={() => handleResetQuota(user)}
                    >
                      <Icon name="refresh" className="mr-1 h-3 w-3" />
                      {usedToday ? 'Reset Quota' : 'Quota Clear'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden overflow-x-auto md:block">
          <table className="table w-full">
            <thead>
              <tr className="border-base-300 text-xs uppercase tracking-wider text-muted">
                <th className="bg-transparent pl-6">Account</th>
                <th className="bg-transparent">Joined</th>
                <th className="bg-transparent">Role</th>
                <th className="bg-transparent">Roadmaps Today</th>
                <th className="bg-transparent">Interviews Today</th>
                <th className="bg-transparent pr-6 text-right">Quota Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isAdmin = user.role === 'admin';
                const usedToday =
                  (user.usage?.roadmaps || 0) +
                    (user.usage?.interviews || 0) +
                    (user.usage?.resume_analyses || 0) +
                    (user.usage?.github_analyses || 0) +
                    (user.usage?.quizzes || 0) >
                  0;

                return (
                  <tr key={user._id} className="border-base-300 hover:bg-base-content/[0.02]">
                    <td className="py-3.5 pl-6">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} />
                        <div>
                          <p className="font-medium text-base-content">{user.name}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-3.5 text-sm text-muted">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isAdmin ? 'bg-primary/15 text-primary' : 'bg-base-300 text-muted'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <UsagePill count={user.usage?.roadmaps || 0} limit={2} isAdmin={isAdmin} />
                    </td>
                    <td className="py-3.5">
                      <UsagePill count={user.usage?.interviews || 0} limit={2} isAdmin={isAdmin} />
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-6 text-right">
                      {isAdmin ? (
                        <span className="text-xs text-muted">Exempt</span>
                      ) : (
                        <Button
                          size="xs"
                          variant={usedToday ? 'outline' : 'ghost'}
                          className="px-2.5 py-1 text-xs"
                          loading={resettingId === user._id}
                          disabled={!usedToday}
                          onClick={() => handleResetQuota(user)}
                        >
                          <Icon name="refresh" className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span>{usedToday ? 'Reset Quota' : 'Quota Clear'}</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-10 text-center text-sm text-muted">
            No accounts found matching "{searchTerm}".
          </div>
        )}
      </section>
    </div>
  );
}