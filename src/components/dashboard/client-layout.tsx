"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image';
import { Package, DollarSign, Home, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import React from 'react'

export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const pathname = usePathname()
    const { toast } = useToast()

    const navItems = [
        { href: '/dashboard', label: 'لوحة التحكم', icon: Home },
        { href: '/dashboard/products', label: 'المنتجات', icon: Package },
        { href: '/dashboard/sales', label: 'المبيعات', icon: DollarSign },
    ]

    const handleComingSoon = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        toast({
            title: "قريباً!",
            description: "هذه الميزة لا تزال قيد التطوير.",
        })
    }

    const navLinks = (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map(item => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        pathname === item.href && 'bg-muted text-primary'
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Link>
            ))}
        </nav>
    )
    
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]" dir='rtl'>
            <div className="hidden border-l bg-card md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Image src="https://placehold.co/140x40.png" alt="مبيعاتي Logo" width={120} height={30} data-ai-hint="sales logo" />
                        </Link>
                    </div>
                    <div className="flex-1">
                        {navLinks}
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">فتح قائمة التنقل</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="flex flex-col">
                            <div className="flex h-14 items-center border-b px-4">
                                <Link href="/" className="flex items-center gap-2 font-semibold">
                                    <Image src="https://placehold.co/140x40.png" alt="مبيعاتي Logo" width={120} height={30} data-ai-hint="sales logo" />
                                </Link>
                            </div>
                            {navLinks}
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        {/* Can add search bar here later */}
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
                    {children}
                </main>
            </div>
        </div>
    )
}
