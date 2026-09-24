// src/pages/account/Profile.tsx
import { useState, useRef } from 'react';
import { User, Phone, Mail, Check, Save, Camera } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function validate(): string | null {
    if (!fullName.trim()) return 'Full name is required.';
    if (fullName.trim().length < 2) return 'Full name must be at least 2 characters.';
    if (phone && !/^\+?[\d\s\-()]{7,20}$/.test(phone.trim())) {
      return 'Phone number format is invalid.';
    }
    return null;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleAvatarClick() {
    fileRef.current?.click();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <User className="text-[#008ECC]" size={28} />
          Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#008ECC] flex items-center justify-center text-white text-3xl font-bold">
              {(fullName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={handleAvatarClick}
              aria-label="Change avatar"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="font-bold text-gray-800">{fullName || 'Your Name'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="max-w-xl space-y-5" noValidate>
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-[#C0392B]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError(null); }}
                placeholder="Enter your full name"
                aria-invalid={!!error && !fullName.trim()}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008ECC] focus:ring-2 focus:ring-[#008ECC]/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(null); }}
                placeholder="+92 300 1234567"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008ECC] focus:ring-2 focus:ring-[#008ECC]/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="emailRO" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="emailRO"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed</p>
          </div>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-[#C0392B] text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>

            {saved && (
              <span role="status" className="flex items-center gap-1.5 text-sm text-[#249B3E] font-semibold">
                <Check size={16} strokeWidth={3} />
                Saved successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}