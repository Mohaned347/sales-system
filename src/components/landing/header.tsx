
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoIcon } from '@/components/icons/logo';

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-foreground">
            مبيعاتي
          </h1>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
           <Button variant="ghost" asChild>
            <Link href="/login">تسجيل الدخول</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">إنشاء حساب</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
