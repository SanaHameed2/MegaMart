// src/pages/account/Addresses.tsx
import { useEffect, useState } from 'react';
import { MapPin, Plus, Check, Trash2, Pencil, X } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { supabase } from '../../lib/supabase';
import type { Address } from '../../types';

const EMPTY = {
  full_name: '',
  phone: '',
  line1: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Pakistan',
};

export default function Addresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    setAddresses(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    if (editingId) {
      await supabase.from('addresses').update(form).eq('id', editingId);
    } else {
      await supabase.from('addresses').insert({
        ...form,
        user_id: user.id,
        is_default: addresses.length === 0,
      });
    }

    setSaving(false);
    setForm(EMPTY);
    setShowForm(false);
    setEditingId(null);
    load();
  }

  async function setDefault(id: string) {
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this address?')) return;
    await supabase.from('addresses').delete().eq('id', id);
    load();
  }

  function openAdd() {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(a: Address) {
    setForm({
      full_name: a.full_name,
      phone: a.phone,
      line1: a.line1,
      city: a.city,
      state: a.state,
      postal_code: a.postal_code,
      country: a.country,
    });
    setEditingId(a.id);
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <MapPin className="text-[#008ECC]" size={28} />
            Addresses
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openAdd}
            className="bg-[#008ECC] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            Add Address
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-gray-800">
              {editingId ? 'Edit Address' : 'New Address'}
            </h2>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            <Field label="Full Name"   value={form.full_name}   onChange={(v) => setForm({ ...form, full_name: v })} />
            <Field label="Phone"       value={form.phone}       onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Address"     value={form.line1}       onChange={(v) => setForm({ ...form, line1: v })} full />
            <Field label="City"        value={form.city}        onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="State"       value={form.state}       onChange={(v) => setForm({ ...form, state: v })} />
            <Field label="Postal Code" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} />
            <Field label="Country"     value={form.country}     onChange={(v) => setForm({ ...form, country: v })} />
          </div>

          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : editingId ? 'Update Address' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY); }}
              className="px-6 py-3 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">No saved addresses</h2>
          <p className="text-gray-500 mb-6">Add an address to speed up checkout.</p>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
          >
            <Plus size={16} />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${
                a.is_default ? 'border-[#008ECC] ring-2 ring-[#008ECC]/10' : 'border-gray-100 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    a.is_default ? 'bg-[#008ECC] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{a.full_name}</p>
                    {a.is_default && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#249B3E]">
                        <Check size={12} strokeWidth={3} />
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {a.line1}<br />
                {a.city}, {a.state} {a.postal_code}<br />
                {a.country}
              </p>
              <p className="text-sm text-gray-500 mt-2">{a.phone}</p>

              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-gray-100">
                {!a.is_default && (
                  <button
                    type="button"
                    onClick={() => setDefault(a.id)}
                    className="text-xs font-semibold text-[#008ECC] hover:text-[#0077B6] px-3 py-2 rounded-lg hover:bg-[#008ECC]/5 transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  className="text-xs font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="text-xs font-semibold text-[#C0392B] hover:text-[#A93226] px-3 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, full,
}: { label: string; value: string; onChange: (v: string) => void; full?: boolean }) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={id}
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008ECC] focus:ring-2 focus:ring-[#008ECC]/10 transition-all"
      />
    </div>
  );
}