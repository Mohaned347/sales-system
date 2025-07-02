import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

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


export default function CompanyProfile() {
  return (
    <section id="company-profile" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">
            عن الشركة المصنّعة
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            تعرّف على الفريق الذي يقف خلف "مبيعاتي" ورؤيتنا لتمكين الأعمال التجارية.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg overflow-hidden md:grid md:grid-cols-3 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
            <div className="md:col-span-1 flex items-center justify-center p-8 bg-primary/5">
               <Image
                src="https://placehold.co/200x200.png"
                alt="شعار شركة مونتي قو اس دي ان"
                width={150}
                height={150}
                className="rounded-full shadow-md object-cover ring-4 ring-primary/20"
                data-ai-hint="company logo montygo"
              />
            </div>
            <div className="md:col-span-2 p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-primary mb-2">مونتي قو اس دي ان</h3>
              <p className="text-muted-foreground mb-6">
                مونتي قو اس دي ان هي شركة تكنولوجية رائدة، متخصصة في تطوير حلول البرمجيات والأنظمة المبتكرة. بخبرتنا التي تمتد لتشمل التجارة وقطاعات الأعمال المتنوعة، نقدم منتجات تجمع بين القوة التقنية والفهم العميق لاحتياجات السوق.
              </p>
              <div className="flex items-center gap-4 mt-auto pt-4 border-t">
                <p className="font-semibold text-foreground">تواصل معنا:</p>
                <div className="flex gap-2">
                  <Link href="#" aria-label="Facebook" className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-[#1877F2] hover:text-white transition-colors">
                    <FacebookIcon className="h-5 w-5" />
                  </Link>
                   <Link href="#" aria-label="WhatsApp" className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-[#25D366] hover:text-white transition-colors">
                    <WhatsAppIcon className="h-5 w-5" />
                  </Link>
                   <Link href="#" aria-label="Instagram" className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-[#E4405F] hover:text-white transition-colors">
                    <InstagramIcon className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
