"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {

  const { user, loading } = useAppContext();
  const router = useRouter();
  // إضافة منطق انتظار قصير قبل إعادة التوجيه
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (typeof window === 'undefined') return;
    if (!loading && !user) {
      // انتظر 300ms إضافية قبل التوجيه، لإعطاء فرصة للـ context
      timeout = setTimeout(() => {
        if (!user) router.push('/login');
      }, 300);
    }
    return () => clearTimeout(timeout);
  }, [user, loading, router]);

  // أثناء التحميل أو إذا لم يوجد مستخدم بعد، أظهر شاشة التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  // إذا انتهى التحميل ولا يوجد مستخدم، لا تعرض شيئاً (سيتم التوجيه بعد قليل)
  if (!user) {
    return null;
  }

  // If user is logged in, render the children
  return <>{children}</>;
}
