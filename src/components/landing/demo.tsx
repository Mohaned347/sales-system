import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Demo() {
  return (
    <section id="demo" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
            See MySales Hub in Action
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Explore our core features through this interactive demo. Click through the tabs to see how we can transform your business operations.
          </p>
        </div>
        <Card className="shadow-2xl">
          <CardContent className="p-0">
            <Tabs defaultValue="dashboard" className="w-full">
              <div className="p-4 border-b">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                  <TabsTrigger value="dashboard">Sales Dashboard</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="dashboard" className="p-4 md:p-6">
                 <Image
                    src="https://placehold.co/1200x700.png"
                    alt="Sales Dashboard"
                    width={1200}
                    height={700}
                    className="rounded-md w-full shadow-inner border"
                    data-ai-hint="sales dashboard"
                  />
              </TabsContent>
              <TabsContent value="inventory" className="p-4 md:p-6">
                <Image
                    src="https://placehold.co/1200x700.png"
                    alt="Inventory Management"
                    width={1200}
                    height={700}
                    className="rounded-md w-full shadow-inner border"
                    data-ai-hint="inventory list"
                  />
              </TabsContent>
              <TabsContent value="billing" className="p-4 md:p-6">
                <Image
                    src="https://placehold.co/1200x700.png"
                    alt="Billing"
                    width={1200}
                    height={700}
                    className="rounded-md w-full shadow-inner border"
                    data-ai-hint="billing invoice"
                  />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
