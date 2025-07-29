"use client";
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import Header from '@/components/landing/header';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      {/* <Header /> */}
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">أهلاً بعودتك</CardTitle>
            <CardDescription>أدخل بياناتك للوصول إلى حسابك.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-4 text-center text-sm">
              ليس لديك حساب؟{' '}
              <Link href="/signup" className="underline hover:text-primary">
                ابدأ تجربتك المجانية
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
