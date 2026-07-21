import { useState, useEffect } from 'react';
import { X, Tag, Plus, Crown } from 'lucide-react';

const PRIORITIES = [
  { value: 'low',    label: ' Low'    },
  { value: 'medium', label: ' Medium' },
  { value: 'high',   label: ' High'   },
];
const STATUSES = [
  { value: 'todo',        label: ' To Do'       },
  { value: 'in_progress', label: ' In Progress' },
  { value: 'done',        label: ' Done'         },
];
const PROMPTS = [
  'What needs to be done?',
  'What will you conquer today?',
  'Name this mission…',
  'Describe your next win…',
];

export default function TaskModal({ task, onSave, onClose }) {
  const isEdit = !!task?.id;
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [placeholder] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  useEffect(() => {
    if (task) setForm({
      title:       task.title || '',
      description: task.description || '',
      status:      task.status || 'todo',
      priority:    task.priority || 'medium',
      dueDate:     task.due_date ? task.due_date.split('T')[0] : '',
      tags:        Array.isArray(task.tags) ? task.tags : [],
    });
  }, [task]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Give this task a name';
    setErrors(e); return !Object.keys(e).length;
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm(p => ({ ...p, tags: [...p.tags, t] }));
    setTagInput('');
  };

  const removeTag = t => setForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { await onSave({ ...form, dueDate: form.dueDate || null }); onClose(); }
    catch { /* handled by parent */ }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl animate-scale-in overflow-hidden"
        style={{ boxShadow: '0 24px 80px rgba(26,20,4,0.25), 0 0 0 1px rgba(212,175,55,0.1)' }}>

        {/* Gold accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #d4af37, #f5d020, #b8860b, #d4af37)', backgroundSize: '200% auto', animation: 'goldShimmer 3s linear infinite' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #d4af37, #b8860b)' }}>
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="font-display text-base font-bold" style={{ color: '#1a1404' }}>
              {isEdit ? 'Edit Task' : 'New Task'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-surface-100" style={{ color: '#f1cb64' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>
                Task title <span style={{ color: '#d4af37' }}>*</span>
              </label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className={`input-field text-base font-medium ${errors.title ? 'border-red-400' : ''}`}
                placeholder={placeholder} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="input-field resize-none" rows={3}
                placeholder="Add context, notes, or acceptance criteria…" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-field">
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>Priority</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="input-field">
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>Tags</label>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  className="input-field flex-1" placeholder="Add a tag and press Enter" />
                <button type="button" onClick={addTag} className="btn-secondary px-3"><Plus className="w-4 h-4" /></button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.map(tag => (
                    <span key={tag} className="tag flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-surface-200"
            style={{ background: 'rgba(212,175,55,0.02)' }}>
            <p className="text-xs italic" style={{ color: '#b09f65' }}>
              {isEdit ? 'Refine until it shines.' : 'Great tasks start with clear goals.'}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" /> Saving...</>
                  : isEdit ? 'Save changes' : 'Create task'
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
