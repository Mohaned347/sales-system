import Link from 'next/link';
import Image from 'next/image';
import TestimonialForm from './testimonial-form';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
    </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.46 3.49 1.32 4.95L2 22l5.25-1.38c1.41.81 3.02 1.29 4.79 1.29h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM9.53 8.5c.24-.49 1.05-.49 1.34-.49.24 0 .42.03.63.42.21.39.69 1.68.69 1.82 0 .14-.12.33-.21.42-.09.09-.21.12-.39.21-.18.09-.39.15-.54.24-.21.12-.36.18-.48.3s-.12.27-.03.42c.09.15.39.51.84.93.54.51.99.66 1.13.72.14.06.24.03.33-.06.12-.12.51-.6.63-.72s.24-.12.42-.06c.18.06 1.05.48 1.23.57s.3.12.33.18c.03.06 0 .33-.09.42-.09.09-.69.66-1.2.93-.45.24-.93.27-1.32.15-.45-.12-1.32-.48-2.52-1.47-1.44-1.17-2.34-2.58-2.43-2.76s-.18-.3-.09-.42z"></path>
    </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.148-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z"></path>
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
                   <Link href="#" aria-label="Facebook" className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-[#1877F2] hover:text-white transition-colors">
                    <FacebookIcon className="h-5 w-5" />
                  </Link>
                   <Link href="#" aria-label="WhatsApp" className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-[#25D366] hover:text-white transition-colors">
                    <WhatsAppIcon className="h-5 w-5" />
                  </Link>
                   <Link href="#" aria-label="Instagram" className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-[#E4405F] hover:text-white transition-colors">
                    <InstagramIcon className="h-5 w-5" />
                  </Link>
                </div>
            </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <Image src="https://placehold.co/140x40.png" alt="مبيعاتي Logo" width={140} height={40} data-ai-hint="sales logo" />
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} مبيعاتي. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              شروط الخدمة
            </Link>
            <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              سياسة الخصوصية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
