import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Circle, AlertTriangle, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color, bg, onClick }) => (
  <button
    onClick={onClick}
    className="card p-5 flex items-center gap-4 w-full text-left transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400"
  >
    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-ink-primary">{value ?? '—'}</p>
      <p className="text-xs text-ink-tertiary font-medium mt-0.5">{label}</p>
    </div>
  </button>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tasks, stats, fetchTasks, fetchStats, loading, statsLoading } = useTasks();
  const [recentTasks, setRecentTasks] = useState([]);

  const refresh = useCallback(() => {
    fetchStats();
    // No status filter here — show all recent tasks, limit to 5
    fetchTasks({ sort: 'created', dir: 'desc', limit: '5', offset: '0' });
  }, [fetchStats, fetchTasks]);

  useEffect(() => {
    refresh();
    const onSignal = () => refresh();
    window.addEventListener('taskflow:tasks-changed', onSignal);
    return () => window.removeEventListener('taskflow:tasks-changed', onSignal);
  }, [refresh]);

  useEffect(() => {
    setRecentTasks(tasks);
  }, [tasks]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // "Overdue" uses ?overdue=1 (NOT ?status=overdue — that's not a real DB status)
  const goToTasks = (statusKey) => {
    if (statusKey === 'overdue') {
      navigate('/tasks?overdue=1');
    } else {
      navigate(`/tasks?status=${statusKey}`);
    }
  };

  const statCards = [
    { icon: Circle,        label: 'To Do',       value: statsLoading ? '…' : stats?.todo,        color: 'text-ink-tertiary', bg: 'bg-surface-100', key: 'todo' },
    { icon: Clock,         label: 'In Progress',  value: statsLoading ? '…' : stats?.in_progress, color: 'text-brand-600',    bg: 'bg-brand-50',    key: 'in_progress' },
    { icon: CheckCircle2,  label: 'Completed',    value: statsLoading ? '…' : stats?.done,        color: 'text-green-600',    bg: 'bg-green-50',    key: 'done' },
    { icon: AlertTriangle, label: 'Overdue',      value: statsLoading ? '…' : stats?.overdue,     color: 'text-red-600',      bg: 'bg-red-50',      key: 'overdue' },
  ];

  const progress =
    stats && !statsLoading && stats.total > 0
      ? Math.round((stats.done / stats.total) * 100)
      : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-primary">
          {greeting()}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm text-ink-tertiary mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stat Cards — each is a clickable button */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((s) => (
          <StatCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            color={s.color}
            bg={s.bg}
            onClick={() => goToTasks(s.key)}
          />
        ))}
      </div>

      {/* Progress card */}
      {stats?.total > 0 && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-semibold text-ink-primary">Overall Progress</span>
            </div>
            <span className="text-sm font-bold text-brand-600">{progress}%</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-ink-tertiary mt-2">
            {stats.done} of {stats.total} tasks completed
          </p>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-surface-200">
          <h2 className="text-sm font-bold text-ink-primary">Recent Tasks</h2>
          <Link
            to="/tasks"
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-ink-disabled" />
            </div>
            <p className="text-sm text-ink-tertiary mb-3">No tasks yet. Create your first one!</p>
            <Link to="/tasks" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> New Task
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {recentTasks.map((task) => {
              const statusColors = {
                todo: 'text-ink-disabled',
                in_progress: 'text-brand-600',
                done: 'text-green-600',
              };
              const priorityColors = {
                low: 'bg-green-400',
                medium: 'bg-yellow-400',
                high: 'bg-red-400',
              };
              return (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-surface-50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
                  <p
                    className={`text-sm font-medium flex-1 truncate ${
                      task.status === 'done' ? 'line-through text-ink-tertiary' : 'text-ink-primary'
                    }`}
                  >
                    {task.title}
                  </p>
                  <span className={`text-xs font-semibold flex-shrink-0 ${statusColors[task.status]}`}>
                    {task.status === 'in_progress'
                      ? 'In Progress'
                      : task.status === 'done'
                      ? 'Done'
                      : 'To Do'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
