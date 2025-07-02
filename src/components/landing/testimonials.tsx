import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'أحمد منصور',
    title: 'مدير مبيعات, شركة تكوين',
    quote: '"لقد غير مركزي للمبيعات طريقة عملنا تمامًا. أصبح تتبع المبيعات وإدارة المخزون أسهل من أي وقت مضى. أوصي به بشدة!"',
    avatar: 'https://placehold.co/40x40.png',
    initials: 'أم'
  },
  {
    name: 'فاطمة الزهراء',
    title: 'صاحبة متجر إلكتروني',
    quote: '"كصاحبة عمل صغير، كنت أبحث عن أداة شاملة وبأسعار معقولة. مركزي للمبيعات قدم لي كل ما أحتاجه وأكثر. خدمة العملاء ممتازة أيضًا."',
    avatar: 'https://placehold.co/40x40.png',
    initials: 'فز'
  },
  {
    name: 'خالد الغامدي',
    title: 'مؤسس, شركة ريادة',
    quote: '"التقارير التحليلية دقيقة جدًا وساعدتني على اتخاذ قرارات أفضل لنمو شركتي. منصة قوية وموثوقة."',
    avatar: 'https://placehold.co/40x40.png',
    initials: 'خغ'
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
            ماذا يقول عملاؤنا السعداء
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            نحن نفخر ببناء علاقات قوية مع عملائنا ومساعدتهم على تحقيق أهدافهم.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person face" />
                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <blockquote className="italic text-foreground/80">
                  {testimonial.quote}
                </blockquote>
                 <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-accent fill-accent" />)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
