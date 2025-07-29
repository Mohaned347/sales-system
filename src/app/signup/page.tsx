import Link from 'next/link';
import { SignUpForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">ابدأ تجربتك المجانية الآن</CardTitle>
            <CardDescription>أدخل بياناتك وبيانات متجرك للمتابعة.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
            <div className="mt-4 text-center text-sm">
              هل لديك حساب بالفعل؟{' '}
              <Link href="/login" className="underline hover:text-primary">
                سجل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
