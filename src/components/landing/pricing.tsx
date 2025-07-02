import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const plans = [
  {
    name: 'المبتدئة',
    price: '$29',
    period: 'شهرياً',
    description: 'مثالية للفرق الصغيرة والشركات الناشئة.',
    features: [
      'تتبع المبيعات',
      'إدارة المخزون (حتى 100 منتج)',
      'تقارير أساسية',
      'دعم عبر البريد الإلكتروني',
    ],
    cta: 'ابدأ التجربة المجانية',
    popular: false,
    link: '/signup'
  },
  {
    name: 'الاحترافية',
    price: '$79',
    period: 'شهرياً',
    description: 'للشركات النامية التي تحتاج إلى قوة ودعم أكبر.',
    features: [
      'كل شيء في الخطة المبتدئة',
      'تقارير متقدمة وتفصيلية',
      'إدارة مخزون غير محدودة',
      'وصول لواجهة برمجة التطبيقات (API)',
      'دعم فني ذو أولوية',
    ],
    cta: 'ابدأ التجربة المجانية',
    popular: true,
    link: '/signup'
  },
  {
    name: 'المؤسسات',
    price: 'مخصص',
    period: '',
    description: 'للشركات الكبيرة ذات الاحتياجات المخصصة.',
    features: [
      'كل شيء في الخطة الاحترافية',
      'مدير حساب مخصص',
      'تكاملات مخصصة',
      'خيار التثبيت المحلي',
      'دعم على مدار 24/7',
    ],
    cta: 'تواصل مع المبيعات',
    popular: false,
    link: '#contact'
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
            اختر الخطة التي تناسبك
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            ابدأ مجانًا، ثم اختر الخطة التي تناسب احتياجات عملك. لا توجد رسوم خفية، ويمكنك الإلغاء في أي وقت.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col h-full shadow-lg transition-all duration-300 hover:scale-105 ${plan.popular ? 'border-primary ring-2 ring-primary' : ''}`}>
              <CardHeader className="relative pb-4">
                {plan.popular && (
                  <div className="absolute top-0 -translate-y-1/2 bg-accent text-accent-foreground px-3 py-1 text-sm font-semibold rounded-full shadow-md">
                    الأكثر شيوعًا
                  </div>
                )}
                <CardTitle className="font-headline pt-4">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  <Link href={plan.link}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
