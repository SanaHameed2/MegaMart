// src/pages/Unauthorized.tsx
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center py-20">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <ShieldAlert className="w-16 h-16 text-[#C0392B] mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-8">
            You don't have permission to view this page.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}