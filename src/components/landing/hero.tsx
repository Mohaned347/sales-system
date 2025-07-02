import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section id="hero" className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-extrabold font-headline text-foreground mb-4">
          منصتك المتكاملة لإدارة المبيعات
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          بسّط مبيعاتك، أدر مخزونك، وتعامل مع الفواتير بكل سهولة. مركزي للمبيعات هو الأداة الوحيدة التي تحتاجها لتنمية أعمالك وتحقيق النجاح.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">
              ابدأ تجربتك المجانية <ArrowLeft className="mr-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#demo">
              شاهد العرض التوضيحي
            </Link>
          </Button>
        </div>
        <div className="mt-16">
          <Image
            src="https://placehold.co/1200x600.png"
            alt="لوحة تحكم مركزي للمبيعات"
            width={1200}
            height={600}
            className="rounded-lg shadow-2xl mx-auto"
            data-ai-hint="dashboard analytics"
            priority
          />
        </div>
      </div>
       <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
       <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
       <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </section>
  );
}
