import { useState } from 'react';
import { User, Lock, Palette, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const COLORS = ['#6272f5', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];

const Avatar = ({ user, size = 'lg' }) => {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  return (
    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white`}
         style={{ backgroundColor: user?.avatar_color || '#6272f5' }}>
      {initials}
    </div>
  );
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || '#6272f5');
  const [profileLoading, setProfileLoading] = useState(false);

  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passErrors, setPassErrors] = useState({});

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', { name: name.trim(), avatarColor });
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const validatePass = () => {
    const e = {};
    if (!passForm.current) e.current = 'Required';
    if (!passForm.next) e.next = 'Required';
    else if (passForm.next.length < 6) e.next = 'At least 6 characters';
    if (passForm.next !== passForm.confirm) e.confirm = 'Passwords do not match';
    setPassErrors(e);
    return !Object.keys(e).length;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePass()) return;
    setPassLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: passForm.current, newPassword: passForm.next });
      toast.success('Password changed successfully!');
      setPassForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setPassLoading(false);
    }
  };

  const previewUser = { ...user, name, avatar_color: avatarColor };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-primary">Profile</h1>
        <p className="text-sm text-ink-tertiary mt-0.5">Manage your account settings</p>
      </div>

      {/* Profile section */}
      <div className="card mb-4">
        <div className="flex items-center gap-3 p-5 border-b border-surface-200">
          <User className="w-4 h-4 text-ink-tertiary" />
          <h2 className="text-sm font-bold text-ink-primary">Personal Info</h2>
        </div>
        <form onSubmit={handleProfileSave} className="p-5 space-y-5">
          <div className="flex items-center gap-5">
            <Avatar user={previewUser} />
            <div>
              <p className="text-sm font-semibold text-ink-primary">{previewUser.name}</p>
              <p className="text-xs text-ink-tertiary">{user?.email}</p>
              <p className="text-xs text-ink-disabled mt-1">
                Member since {user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : '—'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1.5">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-2">
              <Palette className="w-3.5 h-3.5 inline mr-1.5" />Avatar Color
            </label>
            <div className="flex items-center gap-2.5">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setAvatarColor(c)}
                  className="w-8 h-8 rounded-xl transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: c }}>
                  {avatarColor === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password section */}
      <div className="card">
        <div className="flex items-center gap-3 p-5 border-b border-surface-200">
          <Lock className="w-4 h-4 text-ink-tertiary" />
          <h2 className="text-sm font-bold text-ink-primary">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
          {[
            { key: 'current', label: 'Current Password', placeholder: '••••••••' },
            { key: 'next', label: 'New Password', placeholder: 'At least 6 characters' },
            { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-ink-secondary mb-1.5">{label}</label>
              <input type="password" value={passForm[key]}
                onChange={e => setPassForm(p => ({ ...p, [key]: e.target.value }))}
                className={`input-field ${passErrors[key] ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder={placeholder} />
              {passErrors[key] && <p className="mt-1 text-xs text-red-500">{passErrors[key]}</p>}
            </div>
          ))}
          <button type="submit" disabled={passLoading} className="btn-primary">
            {passLoading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating...</> : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
