import Link from 'next/link';
import { LogoIcon } from '@/components/icons/logo';
import TestimonialForm from './testimonial-form';
import { Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Using inline SVGs for icons not available in lucide-react
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.46 3.49 1.32 4.95L2 22l5.25-1.38c1.41.81 3.02 1.29 4.79 1.29h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM9.53 8.5c.24-.49 1.05-.49 1.34-.49.24 0 .42.03.63.42.21.39.69 1.68.69 1.82 0 .14-.12.33-.21.42-.09.09-.21.12-.39.21-.18.09-.39.15-.54.24-.21.12-.36.18-.48.3s-.12.27-.03.42c.09.15.39.51.84.93.54.51.99.66 1.13.72.14.06.24.03.33-.06.12-.12.51-.6.63-.72s.24-.12.42-.06c.18.06 1.05.48 1.23.57s.3.12.33.18c.03.06 0 .33-.09.42-.09.09-.69.66-1.2.93-.45.24-.93.27-1.32.15-.45-.12-1.32-.48-2.52-1.47-1.44-1.17-2.34-2.58-2.43-2.76s-.18-.3-.09-.42z"></path>
    </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.38 1.92-3.54 2.99-5.85 2.99-1.49 0-2.98-.33-4.32-1.1-1.17-.65-2.22-1.52-3-2.65-1.4-1.92-2.12-4.14-2.12-6.38 0-2.83 1.15-5.59 3.21-7.52 1.72-1.6 3.84-2.55 6.07-2.55.07 0 .14 0 .21.01z"></path>
  </svg>
);

const navLinks = [
    { href: '#features', label: 'الميزات' },
    { href: '#demo', label: 'تجربة' },
    { href: '#pricing', label: 'الأسعار' },
    { href: '#contact', label: 'تواصل معنا' },
];

export default function Footer() {
  return (
    <footer className="border-t bg-secondary/50 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
                <TestimonialForm />
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">روابط سريعة</h3>
                <ul className="space-y-2">
                    {navLinks.map(link => (
                        <li key={link.href}>
                            <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">تابعنا</h3>
                 <div className="flex gap-2">
                  <Button asChild variant="ghost" size="icon" aria-label="Facebook">
                    <Link href="#" passHref>
                       <Facebook className="h-5 w-5 text-[#1877F2]" />
                    </Link>
                  </Button>
                   <Button asChild variant="ghost" size="icon" aria-label="WhatsApp">
                    <Link href="#" passHref>
                       <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                    </Link>
                  </Button>
                   <Button asChild variant="ghost" size="icon" aria-label="TikTok">
                    <Link href="#" passHref>
                       <TikTokIcon className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
            </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <LogoIcon className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold font-headline text-foreground">
              مبيعاتي
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} مبيعاتي. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              شروط الخدمة
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              سياسة الخصوصية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
