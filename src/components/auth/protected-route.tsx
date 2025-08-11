"use client";

import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';

import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppContext();
  const router = useRouter();
  // منطق hydration guard
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return null;
  }
  // أثناء التحميل، أظهر شاشة تحميل فقط
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  // بعد انتهاء التحميل، إذا لم يوجد مستخدم، أعد التوجيه مباشرة
  if (!user) {
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return null;
  }
  // إذا كان المستخدم موجود، اعرض الأطفال
  return <>{children}</>;
}
