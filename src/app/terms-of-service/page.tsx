import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-secondary/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center text-primary">شروط الخدمة</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none text-right">
            <h2 className="font-headline">1. القبول بالشروط</h2>
            <p>
              باستخدامك لمنصة "مبيعاتي"، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام المنصة.
            </p>
            <h2 className="font-headline">2. استخدام المنصة</h2>
            <p>
              أنت توافق على استخدام المنصة للأغراض المشروعة فقط. يُحظر عليك استخدام المنصة بأي طريقة قد تلحق الضرر بها أو تعطلها أو تضعفها.
            </p>
            <h2 className="font-headline">3. الحسابات</h2>
            <p>
              عند إنشاء حساب معنا، يجب عليك تزويدنا بمعلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك.
            </p>
            <h2 className="font-headline">4. الملكية الفكرية</h2>
            <p>
              المنصة وجميع محتوياتها وميزاتها ووظائفها هي ملك حصري لشركة "مونتي قو اس دي ان" وهي محمية بموجب قوانين حقوق النشر والعلامات التجارية الدولية.
            </p>
            <h2 className="font-headline">5. إنهاء الخدمة</h2>
            <p>
              يجوز لنا إنهاء أو تعليق وصولك إلى منصتنا على الفور، دون إشعار مسبق أو مسؤولية، لأي سبب من الأسباب، بما في ذلك على سبيل المثال لا الحصر إذا انتهكت الشروط.
            </p>
            <h2 className="font-headline">6. تحديد المسؤولية</h2>
            <p>
              لن نكون مسؤولين بأي حال من الأحوال عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية تنشأ عن استخدامك للمنصة.
            </p>
          </CardContent>
        </Card>
        <div className="mt-8 text-center">
            <Button asChild>
                <Link href="/">
                    <ArrowRight className="ml-2" />
                    العودة إلى الصفحة الرئيسية
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
