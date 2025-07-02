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
            <span className="text-xl font-bold font-headline">MySales Hub</span>
          </Link>
        </div>
      <Card className="w-full max-w-md shadow-xl bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Create an Account</CardTitle>
          <CardDescription>Start your 5-day free trial today. No credit card required.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
