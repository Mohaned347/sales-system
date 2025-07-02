import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-secondary/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center text-primary">سياسة الخصوصية</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none text-right">
            <h2 className="font-headline">مقدمة</h2>
            <p>
              نحن في "مبيعاتي" نلتزم بحماية خصوصية زوارنا ومستخدمينا. توضح سياسة الخصوصية هذه كيف نجمع ونستخدم ونحمي معلوماتك الشخصية عند استخدامك لموقعنا وخدماتنا.
            </p>
            <h2 className="font-headline">المعلومات التي نجمعها</h2>
            <p>
              قد نجمع معلومات التعريف الشخصية مثل الاسم وعنوان البريد الإلكتروني ورقم الهاتف عند تسجيلك في خدمتنا أو تواصلك معنا. كما نجمع بيانات غير شخصية مثل نوع المتصفح وعنوان IP لأغراض تحليلية.
            </p>
            <h2 className="font-headline">كيف نستخدم معلوماتك</h2>
            <ul>
              <li>لتقديم وتحسين خدماتنا.</li>
              <li>لتخصيص تجربتك على المنصة.</li>
              <li>للتواصل معك بخصوص حسابك أو تحديثات الخدمة.</li>
              <li>لأغراض تحليلية لتحسين أداء المنصة.</li>
            </ul>
            <h2 className="font-headline">مشاركة المعلومات</h2>
            <p>
              نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع مزودي الخدمة الموثوقين الذين يساعدوننا في تشغيل موقعنا، بشرط أن يوافقوا على الحفاظ على سرية هذه المعلومات.
            </p>
            <h2 className="font-headline">أمان البيانات</h2>
            <p>
              نتخذ تدابير أمنية معقولة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الكشف. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بنسبة 100%.
            </p>
            <h2 className="font-headline">التغييرات على سياسة الخصوصية</h2>
            <p>
              قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنعلمك بأي تغييرات عن طريق نشر السياسة الجديدة على هذه الصفحة.
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
