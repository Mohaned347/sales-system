import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "هل يوجد فترة تجريبية مجانية؟",
        answer: "نعم، نحن نقدم فترة تجريبية مجانية لمدة 5 أيام لجميع الخطط. يمكنك استكشاف جميع الميزات دون الحاجة إلى بطاقة ائتمان."
    },
    {
        question: "هل يمكنني إلغاء اشتراكي في أي وقت؟",
        answer: "بالتأكيد. يمكنك إلغاء اشتراكك في أي وقت مباشرة من لوحة التحكم الخاصة بك. لا توجد عقود طويلة الأجل أو رسوم إلغاء."
    },
    {
        question: "هل بياناتي آمنة مع مركزي للمبيعات؟",
        answer: "أمان بياناتك هو أولويتنا القصوى. نستخدم أحدث تقنيات التشفير وبروتوكولات الأمان لضمان حماية معلومات عملك وعملائك."
    },
    {
        question: "هل يدعم البرنامج التكامل مع أدوات أخرى؟",
        answer: "نعم، خطة 'الاحترافية' و 'المؤسسات' توفر وصولاً إلى واجهة برمجة التطبيقات (API) التي تتيح لك ربط مركزي للمبيعات مع الأدوات والأنظمة الأخرى التي تستخدمها."
    },
    {
        question: "ما نوع الدعم الفني الذي تقدمونه؟",
        answer: "نحن نقدم دعمًا عبر البريد الإلكتروني لجميع الخطط. تتمتع خطط 'الاحترافية' و 'المؤسسات' بدعم ذي أولوية ودعم على مدار الساعة طوال أيام الأسبوع على التوالي."
    }
]

export default function Faq() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">
            أسئلة شائعة
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            هل لديك سؤال آخر؟ <a href="#contact" className="text-primary underline">تواصل معنا</a>.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-lg font-semibold text-right">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground">
                        {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </div>
    </section>
  )
}
