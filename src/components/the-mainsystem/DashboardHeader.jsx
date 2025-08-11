import React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';

export default function DashboardHeader() {
  const { user, signOut } = useAuth();
  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-6 py-3 border-b">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/sales" className="font-bold text-xl text-primary">مبيعاتي</Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">{user?.displayName || user?.email}</span>
        </div>
        {user?.subscriptionStatus === 'trial' && (
          <Link href="/pricing" className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition font-bold">ترقية الحساب</Link>
        )}
        <button onClick={signOut} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition font-bold">تسجيل الخروج</button>
      </div>
    </header>
  );
}
