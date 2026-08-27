import { useState } from 'react';
import { useAuth } from '../../store/auth';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id);
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Profile</h1>
      <form onSubmit={handleSave} className="card" style={{ padding: 24, maxWidth: 420 }}>
        <label htmlFor="fullName" className="label">Full name</label>
        <input id="fullName" className="input" style={{ marginBottom: 14 }} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <label htmlFor="phone" className="label">Phone</label>
        <input id="phone" className="input" style={{ marginBottom: 14 }} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label htmlFor="emailRO" className="label">Email</label>
        <input id="emailRO" className="input" value={user?.email || ''} disabled style={{ marginBottom: 16, background: '#F5F5F0' }} />
        <button className="btn btn-primary">Save changes</button>
        {saved && <p role="status" style={{ fontSize: 13, color: 'var(--color-primary)', marginTop: 10 }}>Saved.</p>}
      </form>
    </div>
  );
}
