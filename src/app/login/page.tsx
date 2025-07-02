import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/50 p-4">
       <div className="absolute top-4 left-4">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xl font-bold font-headline">MySales Hub</span>
          </Link>
        </div>
      <Card className="w-full max-w-md shadow-xl bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
