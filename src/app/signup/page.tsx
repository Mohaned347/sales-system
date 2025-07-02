import Link from 'next/link';
import { SignUpForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/50 p-4">
        <div className="absolute top-4 left-4">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xl font-bold font-headline">مركزي للمبيعات</span>
          </Link>
        </div>
      <Card className="w-full max-w-md shadow-xl bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">أنشئ حسابك الجديد</CardTitle>
          <CardDescription>ابدأ تجربتك المجانية. أدخل بياناتك وبيانات متجرك للمتابعة.</CardDescription>
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
    </div>
  );
}
