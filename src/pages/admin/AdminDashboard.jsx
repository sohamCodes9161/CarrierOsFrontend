import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Button from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState(null);

  async function loadAdminData() {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers()
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      toast.error('Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function handleResetQuota(userId, userName) {
    if (!window.confirm(`Reset daily quota for ${userName}?`)) return;
    
    setResettingId(userId);
    try {
      await adminApi.resetQuota(userId);
      toast.success(`Quota reset for ${userName}`);
      // Refresh the user list to show the cleared usage
      loadAdminData();
    } catch (err) {
      toast.error('Failed to reset quota.');
    } finally {
      setResettingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader title="Admin Command Center" description="Loading system metrics..." />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <PageHeader 
        title="Admin Command Center" 
        description="Monitor system usage, aggregate AI token consumption, and manage student accounts." 
      />

      {/* Aggregate Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div className="surface flex flex-col p-5">
          <p className="text-sm font-medium text-muted">Total Registered Users</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
        </div>
        <div className="surface flex flex-col p-5">
          <p className="text-sm font-medium text-muted">AI Interviews Executed</p>
          <p className="mt-2 text-3xl font-bold text-primary">{stats?.stats?.totalInterviews || 0}</p>
        </div>
        <div className="surface flex flex-col p-5">
          <p className="text-sm font-medium text-muted">Roadmaps Generated</p>
          <p className="mt-2 text-3xl font-bold text-success">{stats?.stats?.totalRoadmaps || 0}</p>
        </div>
        <div className="surface flex flex-col p-5">
          <p className="text-sm font-medium text-muted">Resumes Parsed</p>
          <p className="mt-2 text-3xl font-bold text-info">{stats?.stats?.totalResumes || 0}</p>
        </div>
      </div>

      {/* User Management Table */}
      <section className="surface overflow-hidden">
        <div className="border-b border-base-300 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Student Roster & Usage</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="border-base-300 text-muted">
                <th className="bg-transparent pl-6">Student</th>
                <th className="bg-transparent">Role</th>
                <th className="bg-transparent">Today's Roadmaps</th>
                <th className="bg-transparent">Today's Interviews</th>
                <th className="bg-transparent text-right pr-6">Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-base-300 hover:bg-white/[0.02]">
                  <td className="pl-6">
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </td>
                  <td>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-base-300 text-muted'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-sm">{user.usage?.roadmaps || 0} / 2</span>
                  </td>
                  <td>
                    <span className="font-mono text-sm">{user.usage?.interviews || 0} / 2</span>
                  </td>
                  <td className="text-right pr-6">
                    <Button 
                      size="xs" 
                      variant="outline"
                      loading={resettingId === user._id}
                      onClick={() => handleResetQuota(user._id, user.name)}
                      disabled={user.role === 'admin'}
                    >
                      <Icon name="refresh" className="mr-1.5 h-3 w-3" />
                      Reset Quota
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}