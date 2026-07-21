import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Trash2, CheckSquare, X } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import toast from 'react-hot-toast';

const FILTER_OPTS = {
  status: [
    { value: '', label: 'All statuses' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ],
  priority: [
    { value: '', label: 'All priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ],
  sort: [
    { value: 'created', label: 'Date created' },
    { value: 'due', label: 'Due date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
  ],
};

// Tell DashboardPage to re-fetch after any mutation
const notifyDashboard = () =>
  window.dispatchEvent(new Event('taskflow:tasks-changed'));

export default function TasksPage() {
  const { tasks, loading, fetchTasks, fetchStats, createTask, updateTask, deleteTask, bulkAction } =
    useTasks();

  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params set by dashboard stat-card clicks
  const urlStatus  = searchParams.get('status') || '';
  const urlOverdue = searchParams.get('overdue') === '1'; // ?overdue=1

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    status: urlStatus,
    priority: '',
    sort: 'created',
    dir: 'desc',
    // "overdue" is a date-based filter — send today's date as dueBefore
    dueBefore: urlOverdue ? new Date().toISOString().split('T')[0] : '',
    overdueMode: urlOverdue, // local flag to show "Overdue" label in UI
  });
  const [searchInput, setSearchInput] = useState('');

  // Sync filters when URL params change (e.g. navigating from dashboard)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: urlStatus,
      dueBefore: urlOverdue ? new Date().toISOString().split('T')[0] : '',
      overdueMode: urlOverdue,
    }));
  }, [urlStatus, urlOverdue]);

  const load = useCallback(() => {
    // Build the API filter object — never send 'overdue' as a status value
    const apiFilters = {
      search: filters.search,
      status: filters.status,       // only real DB values: todo | in_progress | done | ''
      priority: filters.priority,
      sort: filters.sort,
      dir: filters.dir,
      // For overdue: filter by due_date < today AND exclude done tasks
      ...(filters.overdueMode && {
        dueBefore: filters.dueBefore,
        // Exclude done tasks when showing overdue
        excludeStatus: 'done',
      }),
    };
    fetchTasks(apiFilters);
    fetchStats();
  }, [filters, fetchTasks, fetchStats]);

  useEffect(() => { load(); }, [load]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((p) => ({ ...p, search: searchInput }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const setFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value, overdueMode: false, dueBefore: '' }));
    if (key === 'status') {
      if (value) setSearchParams({ status: value });
      else setSearchParams({});
    }
  };

  const clearFilters = () => {
    setFilters((p) => ({
      ...p,
      status: '',
      priority: '',
      overdueMode: false,
      dueBefore: '',
    }));
    setSearchParams({});
  };

  const toggleSelect = (id, checked) => {
    setSelected((prev) => {
      const n = new Set(prev);
      checked ? n.add(id) : n.delete(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === tasks.length) setSelected(new Set());
    else setSelected(new Set(tasks.map((t) => t.id)));
  };

  const handleSave = async (data) => {
    if (modal?.task?.id) {
      await updateTask(modal.task.id, data);
    } else {
      await createTask(data);
    }
    load();
    notifyDashboard();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(id);
      notifyDashboard();
    }
  };

  const handleStatusChange = async (id, status) => {
    await updateTask(id, { status });
    notifyDashboard();
  };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (window.confirm(`Delete ${selected.size} selected task(s)?`)) {
      await bulkAction('delete', [...selected]);
      setSelected(new Set());
      notifyDashboard();
    }
  };

  const handleBulkStatus = async (status) => {
    if (!selected.size) return;
    await bulkAction('status', [...selected], { status });
    setSelected(new Set());
    notifyDashboard();
  };

  const activeFilters =
    [filters.status, filters.priority, filters.overdueMode ? 'overdue' : ''].filter(Boolean).length;

  // Human-readable label for current filter
  const activeLabel = filters.overdueMode
    ? 'Overdue'
    : FILTER_OPTS.status.find((o) => o.value === filters.status)?.label || '';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">My Tasks</h1>
          <p className="text-sm text-ink-tertiary mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            {activeLabel && (
              <span className="ml-1 text-brand-600 font-semibold">
                · {activeLabel}
              </span>
            )}
          </p>
        </div>
        <button onClick={() => setModal({ task: null })} className="btn-primary">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Filters bar */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-disabled" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field pl-8 pr-3 py-2 text-sm"
              placeholder="Search tasks..."
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-disabled hover:text-ink-tertiary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Show "Overdue" pill when coming from dashboard, else show status dropdown */}
          {filters.overdueMode ? (
            <span className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl">
              Overdue
              <button onClick={clearFilters} className="hover:text-red-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ) : (
            <select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className="input-field py-2 text-sm w-auto min-w-32"
            >
              {FILTER_OPTS.status.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}

          <select
            value={filters.priority}
            onChange={(e) => setFilter('priority', e.target.value)}
            className="input-field py-2 text-sm w-auto min-w-36"
          >
            {FILTER_OPTS.priority.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={`${filters.sort}:${filters.dir}`}
            onChange={(e) => {
              const [sort, dir] = e.target.value.split(':');
              setFilters((p) => ({ ...p, sort, dir }));
            }}
            className="input-field py-2 text-sm w-auto min-w-36"
          >
            {FILTER_OPTS.sort.map((o) => [
              <option key={`${o.value}:desc`} value={`${o.value}:desc`}>
                {o.label} ↓
              </option>,
              <option key={`${o.value}:asc`} value={`${o.value}:asc`}>
                {o.label} ↑
              </option>,
            ])}
          </select>

          {activeFilters > 0 && !filters.overdueMode && (
            <button onClick={clearFilters} className="btn-ghost text-xs">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-brand-50 border border-brand-200 rounded-xl animate-fade-in">
          <span className="text-sm font-semibold text-brand-700">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => handleBulkStatus('done')} className="btn-secondary py-1.5 text-xs">
              <CheckSquare className="w-3 h-3" /> Mark done
            </button>
            <button onClick={() => handleBulkStatus('in_progress')} className="btn-secondary py-1.5 text-xs">
              Mark in progress
            </button>
            <button onClick={handleBulkDelete} className="btn-danger py-1.5 text-xs">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
            <button onClick={() => setSelected(new Set())} className="btn-ghost text-xs">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Select all */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <input
            type="checkbox"
            checked={selected.size === tasks.length && tasks.length > 0}
            onChange={toggleAll}
            className="w-4 h-4 rounded border-surface-300 text-brand-600 cursor-pointer"
          />
          <span className="text-xs text-ink-tertiary font-medium">Select all</span>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-7 h-7 text-ink-disabled" />
          </div>
          <h3 className="text-sm font-semibold text-ink-primary mb-1">No tasks found</h3>
          <p className="text-xs text-ink-tertiary mb-4">
            {filters.search || filters.status || filters.priority || filters.overdueMode
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </p>
          {!filters.search && !filters.status && !filters.priority && !filters.overdueMode && (
            <button onClick={() => setModal({ task: null })} className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> New Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              selected={selected.has(task.id)}
              onSelect={toggleSelect}
              onEdit={(t) => setModal({ task: t })}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <TaskModal task={modal.task} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
