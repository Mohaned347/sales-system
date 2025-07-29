'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import React from 'react';
import logo from './photos/image.png'
import { useAuth } from '@/components/auth/auth-provider';
import { FiUser, FiLogOut, FiStar } from 'react-icons/fi';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navLinks = [
  { href: '#features', label: 'الميزات' },
  { href: '#demo', label: 'تجربة' },
  { href: '#pricing', label: 'الأسعار' },
  { href: '#contact', label: 'تواصل معنا' },
];

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <Image src={logo} alt="مبيعاتي Logo" width={40} height={40} className="rounded-md" data-ai-hint="logo" />
          <span className="text-2xl font-bold  font-headline text-foreground">مبيعاتي</span>
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
          {!user ? (
            <>
              <Button asChild variant="outline" className="text-blue-600 border-blue-500 hover:bg-blue-50 font-bold">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">ابدأ تجربتك المجانية</Link>
              </Button>
            </>
          ) : (
            <>
              {user.role === 'admin' ? (
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  <Link href="/admin">الانتقال للإدارة</Link>
                </Button>
              ) : (
                <Button asChild className="bg-green-500 hover:bg-green-600 text-white font-bold">
                  <Link href="/dashboard/sales">الانتقال للنظام</Link>
                </Button>
              )}
              {user.role === 'trial_user' && (
                <Button asChild className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white animate-pulse border-2 border-yellow-600">
                  <Link href="/pricing">
                    <FiStar className="w-4 h-4 ml-2" /> ترقية الحساب
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-blue-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.displayName || user.email}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${user.role === 'trial_user' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role === 'trial_user' ? 'تجريبي' : 'مدفوع'}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <FiLogOut className="ml-2 h-4 w-4" /> تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
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
                 <Link href="/" className="flex items-center gap-3">
                    <Image src={logo} alt="مبيعاتي Logo" width={40} height={40} className="rounded-md" data-ai-hint="logo" />
                    <span className="text-2xl font-bold font-headline text-foreground">مبيعاتي</span>
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
                  {!user ? (
                    <>
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="text-blue-600 border-blue-500 hover:bg-blue-50 font-bold">
                          <Link href="/login">تسجيل الدخول</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild>
                          <Link href="/signup">ابدأ تجربتك المجانية</Link>
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      {user.role === 'admin' ? (
                        <SheetClose asChild>
                          <Link href="/admin" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md py-2 transition-colors">الانتقال للإدارة</Link>
                        </SheetClose>
                      ) : (
                        <SheetClose asChild>
                          <Link href={user.role === 'trial_user' ? "/dashboard/" : "/dashboard/sales"} className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold rounded-md py-2 transition-colors">الانتقال للنظام</Link>
                        </SheetClose>
                      )}
                      {user.role === 'trial_user' && (
                        <SheetClose asChild>
                          <Link href="/pricing" className="block w-full text-center bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-md py-2 border-2 border-yellow-600 animate-pulse transition-colors flex items-center justify-center gap-2">
                            <FiStar className="w-4 h-4 ml-2" /> ترقية الحساب
                          </Link>
                        </SheetClose>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{user.displayName || user.email}</span>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${user.role === 'trial_user' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {user.role === 'trial_user' ? 'تجريبي' : 'مدفوع'}
                          </span>
                        </div>
                        <Button variant="ghost" onClick={signOut} className="text-red-600">
                          <FiLogOut className="ml-2 h-4 w-4" /> تسجيل الخروج
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
