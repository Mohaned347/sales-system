import Image from 'next/image';

export default function ResponsiveDemo() {
  return (
    <section id="responsive-demo" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-right">
            <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">
              يعمل على جميع أجهزتك
            </h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto md:mx-0">
              سواء كنت تستخدم حاسوبك المكتبي، جهازك اللوحي، أو هاتفك المحمول، تم تصميم "مبيعاتي" ليوفر لك تجربة استخدام سلسة ومتكاملة على جميع المنصات.
            </p>
          </div>
          <div>
            <Image
              src="https://placehold.co/1000x600.png"
              alt="مبيعاتي يعمل على جميع الأجهزة"
              width={1000}
              height={600}
              className="rounded-lg shadow-2xl shadow-primary/10"
              data-ai-hint="responsive app design"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
