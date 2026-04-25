import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

const MyProfilePage = () => {
  const { user, hydrate } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setMobile(user?.mobile || '');
  }, [user]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setSaving(true);
      await authService.updateProfile({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
      });
      await hydrate();
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Update your personal account information." />
      <div className="panel max-w-3xl p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label className="label">Username</label>
            <input className="input opacity-70" value={user?.username || ''} disabled />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your.email@company.com"
            />
          </div>
          <div>
            <label className="label">Mobile</label>
            <input className="input" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input opacity-70" value={user?.roleName || ''} disabled />
          </div>
        </div>
        <div className="mt-6">
          <button className="btn-primary" disabled={saving} onClick={() => void handleSubmit()}>
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;