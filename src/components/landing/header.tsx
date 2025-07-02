'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoIcon } from '@/components/icons/logo';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import React from 'react';

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
        
        {/* Desktop Navigation */}
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

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">فتح القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
               <div className="p-4 border-b">
                 <Link href="/" className="flex items-center gap-2">
                    <LogoIcon className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold font-headline">مبيعاتي</span>
                </Link>
               </div>
              <nav className="flex flex-col gap-4 mt-8 px-4">
                {navLinks.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link href={link.href} className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 text-right">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="flex flex-col gap-4 mt-8 pt-4 border-t">
                  <SheetClose asChild>
                    <Button variant="ghost" asChild>
                      <Link href="/login">تسجيل الدخول</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild>
                      <Link href="/signup">إنشاء حساب</Link>
                    </Button>
                  </SheetClose>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
