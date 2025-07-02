import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Package, CreditCard } from 'lucide-react';

const features = [
  {
    icon: <BarChart className="w-10 h-10 text-primary" />,
    title: 'Sales Tracking',
    description: 'Monitor your sales performance in real-time with our intuitive analytics dashboard.',
  },
  {
    icon: <Package className="w-10 h-10 text-primary" />,
    title: 'Inventory Management',
    description: 'Keep track of your stock levels effortlessly and avoid shortages or overstocking.',
  },
  {
    icon: <CreditCard className="w-10 h-10 text-primary" />,
    title: 'Effortless Billing',
    description: 'Generate and send professional invoices in seconds, and get paid faster.',
  },
];

export default function About() {
  return (
    <section id="about" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
            Everything You Need, All in One Place
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            MySales Hub is designed to simplify your workflow, so you can focus on what matters most: growing your business.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="font-headline mt-4">{feature.title}</CardTitle>
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
