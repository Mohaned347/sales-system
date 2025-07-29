
// DashboardClientWrapper is a client component that loads Dashboard dynamically with SSR disabled
"use client";
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/auth/protected-route';

const Dashboard = dynamic(() => import('@/components/the-mainsystem/Dashboard'), { ssr: false });

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
