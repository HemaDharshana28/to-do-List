import { format, isPast, parseISO } from 'date-fns';
import { Calendar, Flag, Tag, MoreVertical, Pencil, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useState } from 'react';

const PRIORITY_STYLES = {
  low: { badge: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-400' },
  medium: { badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  high: { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-400' },
};

const STATUS_STYLES = {
  todo: { label: 'To Do', icon: Circle, color: 'text-ink-disabled' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-brand-600' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-green-600' },
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, selected, onSelect }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const s = STATUS_STYLES[task.status] || STATUS_STYLES.todo;
  const StatusIcon = s.icon;
  const isOverdue = task.due_date && task.status !== 'done' && isPast(parseISO(task.due_date));

  const cycleStatus = () => {
    const next = { todo: 'in_progress', in_progress: 'done', done: 'todo' };
    onStatusChange(task.id, next[task.status]);
  };

  return (
    <div className={`card group transition-all duration-200 hover:shadow-card-hover ${task.status === 'done' ? 'opacity-70' : ''} ${selected ? 'ring-2 ring-brand-500' : ''}`}>
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={selected} onChange={e => onSelect(task.id, e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-surface-300 text-brand-600 cursor-pointer flex-shrink-0" />

          <button onClick={cycleStatus} className={`mt-0.5 flex-shrink-0 transition-colors ${s.color} hover:scale-110 transition-transform`} title="Click to change status">
            <StatusIcon className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold text-ink-primary leading-snug ${task.status === 'done' ? 'line-through text-ink-tertiary' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-ink-tertiary mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
            )}
          </div>

          <div className="relative flex-shrink-0">
            <button onClick={() => setMenuOpen(p => !p)}
              className="p-1 rounded-lg hover:bg-surface-100 text-ink-disabled hover:text-ink-tertiary opacity-0 group-hover:opacity-100 transition-all">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-7 z-20 w-36 bg-white border border-surface-200 rounded-xl shadow-card-hover animate-fade-in overflow-hidden">
                  <button onClick={() => { onEdit(task); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-surface-50">
                    <Pencil className="w-3 h-3" /> Edit task
                  </button>
                  <button onClick={() => { onDelete(task.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center flex-wrap gap-2 mt-3 ml-11">
          <span className={`badge border ${p.badge} gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
            {task.priority}
          </span>

          {task.due_date && (
            <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-ink-tertiary'}`}>
              <Calendar className="w-3 h-3" />
              {format(parseISO(task.due_date), 'MMM d')}
              {isOverdue && <span className="badge bg-red-50 text-red-600 border-red-200 ml-1">Overdue</span>}
            </span>
          )}

          {task.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="tag">
              <Tag className="w-2.5 h-2.5" /> {tag}
            </span>
          ))}
          {task.tags?.length > 2 && (
            <span className="text-xs text-ink-disabled">+{task.tags.length - 2}</span>
          )}
        </div>
      </div>
    </div>
  );
}
