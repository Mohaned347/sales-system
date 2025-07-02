import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, ShoppingCart, Wrench, Shirt, Book, Utensils } from 'lucide-react';

const useCases = [
  {
    icon: <Store className="w-10 h-10 text-primary" />,
    title: 'متاجر التجزئة الصغيرة',
    description: 'أدر مخزونك بسهولة، وسرّع عملية الدفع عند الكاشير، وافهم سلوك عملائك.',
  },
  {
    icon: <ShoppingCart className="w-10 h-10 text-primary" />,
    title: 'المتاجر الإلكترونية',
    description: 'تتبع المبيعات عبر الإنترنت، وأدر المخزون بشكل مركزي، ووفر تجربة شراء سلسة.',
  },
  {
    icon: <Wrench className="w-10 h-10 text-primary" />,
    title: 'مقدمو الخدمات',
    description: 'أنشئ فواتير احترافية لخدماتك، وتتبع المدفوعات، وأدر علاقاتك مع العملاء بكفاءة.',
  },
  {
    icon: <Shirt className="w-10 h-10 text-primary" />,
    title: 'محلات الملابس والأزياء',
    description: 'قم بإدارة المقاسات والألوان المختلفة لمنتجاتك، واحصل على تقارير عن الأكثر مبيعًا.',
  },
  {
    icon: <Book className="w-10 h-10 text-primary" />,
    title: 'المكتبات والقرطاسيات',
    description: 'نظّم آلاف الكتب والمستلزمات، واستخدم قارئ الباركود لتسريع عمليات البيع.',
  },
  {
    icon: <Utensils className="w-10 h-10 text-primary" />,
    title: 'المطاعم والمقاهي الصغيرة',
    description: 'بسط عملية الطلب، أدر مخزون المكونات، وحلل الأصناف الأكثر طلبًا لزيادة الأرباح.',
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">
            لمن هذا النظام؟
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            "مبيعاتي" مصمم ليلبي احتياجات مختلف أنواع الأعمال التجارية، الصغيرة والمتوسطة.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  {useCase.icon}
                </div>
                <CardTitle className="font-headline mt-4 text-xl">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{useCase.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
