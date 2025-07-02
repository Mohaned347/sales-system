import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Rocket } from 'lucide-react';

const features = [
  'إدارة شاملة للمبيعات والفواتير',
  'نظام متكامل لتتبع المخزون والمنتجات',
  'لوحة تحكم وتقارير تحليلية ذكية',
  'إدارة علاقات العملاء (CRM) مبسطة',
  'دعم فني متكامل عبر البريد الإلكتروني والهاتف',
  'تحديثات مستمرة وميزات جديدة بانتظام',
  'عدد غير محدود من المستخدمين والمنتجات',
  'لا توجد أي رسوم خفية أو اشتراكات شهرية',
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">
            استثمار واحد لنمو لا محدود
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            نؤمن بالبساطة والشفافية. احصل على جميع ميزات "مبيعاتي" القوية بسعر ثابت وواضح، بدون أي تعقيدات أو تكاليف إضافية.
          </p>
        </div>
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl shadow-2xl shadow-primary/20 border-primary ring-2 ring-primary/50 flex flex-col transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-secondary/30">
              <CardHeader className="text-center p-8 rounded-t-lg">
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 border-4 border-primary/20">
                    <Rocket className="w-12 h-12 text-primary" />
                  </div>
                <CardTitle className="font-headline text-3xl">باقة مبيعاتي الشاملة</CardTitle>
                <CardDescription className="text-base mt-2">
                    كل ما تحتاجه لإدارة أعمالك بكفاءة وفعالية، في باقة واحدة متكاملة.
                </CardDescription>
                 <div className="flex items-baseline justify-center gap-2 pt-6">
                  <span className="text-5xl font-bold text-foreground">200,000</span>
                  <span className="text-xl font-medium text-muted-foreground">ج.س</span>
                </div>
                 <p className="text-sm text-muted-foreground mt-1">دفعة واحدة / ترخيص مدى الحياة</p>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-8 pt-0 mt-auto">
                <Button asChild className="w-full text-lg py-6 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow">
                  <Link href={'/signup'}>اشترك الآن وابدأ رحلة النجاح</Link>
                </Button>
              </CardFooter>
            </Card>
        </div>
      </div>
    </section>
  );
}
