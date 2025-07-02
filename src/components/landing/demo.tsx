
"use client";

import { AppProvider } from '@/context/app-context';
import Products from '@/components/dashboard/products';
import Sales from '@/components/dashboard/sales';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

export default function Demo() {
  return (
    <section id="demo" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">
            جرّب النظام مباشرة
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            هذا ليس مجرد عرض، بل هي نسخة تفاعلية بالكامل من النظام. يمكنك إضافة منتجات وتسجيل مبيعات ورؤية التغييرات فوراً. كل البيانات تحفظ مؤقتاً في متصفحك.
          </p>
        </div>
        <AppProvider>
          <Card className="shadow-2xl">
            <Tabs defaultValue="products" className="w-full">
              <div className="p-4 border-b">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
                  <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
                  <TabsTrigger value="sales">إدارة المبيعات</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="products" className="p-0">
                  <Products />
              </TabsContent>
              <TabsContent value="sales" className="p-0">
                  <Sales />
              </TabsContent>
            </Tabs>
          </Card>
        </AppProvider>
      </div>
    </section>
  );
}
