import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Button from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      loadAdminData();
    } catch (err) {
      toast.error('Failed to reset quota.');
    } finally {
      setResettingId(null);
    }
  }

  // --- Feature: Export to CSV ---
  function handleExportCSV() {
    const headers = ['Name,Email,Role,Joined,Roadmaps Today,Interviews Today'];
    const rows = users.map(u => 
      `"${u.name}","${u.email}",${u.role},${new Date(u.createdAt).toLocaleDateString()},${u.usage?.roadmaps || 0},${u.usage?.interviews || 0}`
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
  }

  // --- Feature: Search Filter ---
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="surface flex flex-col p-5">
          <p className="text-xs font-medium text-muted">Total Users</p>
          <p className="mt-2 text-2xl font-bold text-base-content">{stats?.totalUsers || 0}</p>
        </div>
        <div className="surface flex flex-col p-5">
          <p className="text-xs font-medium text-muted">Interviews</p>
          <p className="mt-2 text-2xl font-bold text-primary">{stats?.stats?.totalInterviews || 0}</p>
        </div>
        <div className="surface flex flex-col p-5">
          <p className="text-xs font-medium text-muted">Roadmaps</p>
          <p className="mt-2 text-2xl font-bold text-success">{stats?.stats?.totalRoadmaps || 0}</p>
        </div>
        <div className="surface flex flex-col p-5">
          <p className="text-xs font-medium text-muted">Resumes</p>
          <p className="mt-2 text-2xl font-bold text-info">{stats?.stats?.totalResumes || 0}</p>
        </div>
        <div className="surface flex flex-col p-5">
          <p className="text-xs font-medium text-muted">GitHubs</p>
          <p className="mt-2 text-2xl font-bold text-warning">{stats?.stats?.totalGithubs || 0}</p>
        </div>
        <div className="surface flex flex-col p-5">
          <p className="text-xs font-medium text-muted">Quizzes</p>
          <p className="mt-2 text-2xl font-bold text-secondary">{stats?.stats?.totalQuizzes || 0}</p>
        </div>
      </div>

      {/* User Management Table */}
      <section className="surface overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-base-300 px-6 py-4 gap-4">
          <h2 className="text-lg font-semibold text-base-content">Student Roster & Usage</h2>
          
          {/* Search Bar and Export Button Container */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="w-full bg-base-300/50 border border-base-300 rounded-md pl-9 pr-3 py-1.5 text-sm text-base-content placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="w-full sm:w-auto flex-shrink-0">
              <Icon name="document" className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="border-base-300 text-muted">
                <th className="bg-transparent pl-6">Student</th>
                <th className="bg-transparent">Joined</th>
                <th className="bg-transparent">Role</th>
                <th className="bg-transparent">Today's Roadmaps</th>
                <th className="bg-transparent">Today's Interviews</th>
                <th className="bg-transparent text-right pr-6">Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-base-300 hover:bg-base-content/[0.02]">
                  <td className="pl-6 py-4">
                    <p className="font-medium text-base-content">{user.name}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <span className="text-sm text-muted">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-base-300 text-muted'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="font-mono text-sm">{user.usage?.roadmaps || 0} / 2</span>
                  </td>
                  <td className="py-4">
                    <span className="font-mono text-sm">{user.usage?.interviews || 0} / 2</span>
                  </td>
                  <td className="px-4 py-4 text-right sm:pr-6 whitespace-nowrap">
                    <div className="flex justify-end items-center">
                      <Button 
                        size="xs" 
                        variant="outline"
                        className="text-xs px-2.5 py-1"
                        loading={resettingId === user._id}
                        onClick={() => handleResetQuota(user._id, user.name)}
                        disabled={user.role === 'admin'}
                      >
                        <Icon name="refresh" className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span>Reset Quota</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">No users found matching "{searchTerm}".</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}