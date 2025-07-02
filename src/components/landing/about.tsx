import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Package, CreditCard, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: <BarChart className="w-10 h-10 text-primary" />,
    title: 'تحليلات مبيعات قوية',
    description: 'راقب أداء مبيعاتك لحظة بلحظة من خلال لوحة تحكم تحليلية سهلة الاستخدام وقارير تفصيلية.',
  },
  {
    icon: <Package className="w-10 h-10 text-primary" />,
    title: 'إدارة مخزون ذكية',
    description: 'تتبع مستويات مخزونك بكل سهولة وتجنب النقص أو التكدس، مع تنبيهات تلقائية للمخزون المنخفض.',
  },
  {
    icon: <CreditCard className="w-10 h-10 text-primary" />,
    title: 'فوترة احترافية وسريعة',
    description: 'أنشئ وأرسل فواتير احترافية في ثوانٍ، وتتبع المدفوعات لتحصل على أموالك بشكل أسرع.',
  },
  {
    icon: <Users className="w-10 h-10 text-primary" />,
    title: 'إدارة علاقات العملاء (CRM)',
    description: 'احتفظ بجميع بيانات عملائك في مكان واحد، وحسّن تواصلك معهم لزيادة الولاء والمبيعات.',
  },
  {
    icon: <Zap className="w-10 h-10 text-primary" />,
    title: 'أتمتة المهام الروتينية',
    description: 'وفّر وقتك وجهدك عبر أتمتة المهام المتكررة، وركز على ما يهم حقًا: إتمام الصفقات.',
  },
];

export default function About() {
  return (
    <section id="features" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">
            كل ما تحتاجه للنجاح في مكان واحد
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            صُمم "مبيعاتي" لتبسيط سير عملك، وتزويدك بالأدوات اللازمة لتسريع نمو أعمالك، وتعزيز أرباحك.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="font-headline mt-4 text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
