
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoIcon } from '@/components/icons/logo';

const navLinks = [
  { href: '#features', label: 'الميزات' },
  { href: '#demo', label: 'تجربة' },
  { href: '#pricing', label: 'الأسعار' },
  { href: '#contact', label: 'تواصل معنا' },
];

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
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
           <Button variant="ghost" asChild>
            <Link href="/login">تسجيل الدخول</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">إنشاء حساب</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
