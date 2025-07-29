'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import team from './photos/team.jpg'
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Card } from "../ui/card";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "يجب أن يتكون الاسم من حرفين على الأقل.",
  }),
  email: z.string().email({
    message: "الرجاء إدخال بريد إلكتروني صالح.",
  }),
  phone: z.string().optional(),
  message: z.string().min(10, {
    message: "يجب أن تتكون الرسالة من 10 أحرف على الأقل.",
  }),
  rating: z.number().min(1, { message: "الرجاء تحديد تقييم." }).max(5),
});

export default function Contact() {
  const { toast } = useToast();
  const [hoverRating, setHoverRating] = useState(0);
  const [contactInfo, setContactInfo] = useState({ storePhone: '', storeAddress: '', storeEmail: '' });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      rating: 0,
    },
  });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const contactDoc = await getDoc(doc(db, 'settings', 'contact'));
        if (contactDoc.exists()) {
          setContactInfo({
            storePhone: contactDoc.data().storePhone || '',
            storeAddress: contactDoc.data().storeAddress || '',
            storeEmail: contactDoc.data().storeEmail || '',
          });
        }
      } catch (e) {}
    };
    fetchContact();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log('Sending data:', values); // للتشخيص
      
      if (values.rating) {
        // إذا كان هناك تقييم، أرسله إلى جدول التقييمات
        const testimonialData = {
          name: values.name,
          title: 'عميل سعيد',
          quote: values.message,
          rating: values.rating,
          email: values.email,
          phone: values.phone,
          status: 'pending',
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'testimonials'), testimonialData);
        
        toast({
          title: "تم إرسال التقييم!",
          description: "شكرًا لتقييمك. سيتم مراجعة تقييمك قريبًا.",
        });
      } else {
        // إذا كان طلب تواصل عادي، أرسله إلى جدول طلبات التواصل
        const contactRequestData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          message: values.message,
          status: 'pending',
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'contactRequests'), contactRequestData);
        
        toast({
          title: "تم إرسال الرسالة!",
          description: "شكرًا لتواصلك معنا. سيتم الرد عليك قريبًا.",
        });
      }
      
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error); // للتشخيص
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: `لم نتمكن من إرسال رسالتك: ${error.message}`,
      });
    }
  }

  return (
    <section id="contact" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">
              تواصل معنا وشاركنا رأيك
            </h2>
            <p className="text-lg text-muted-foreground mt-4">
              هل لديك أسئلة أو تحتاج إلى دعم؟ شاركنا تجربتك مع مبيعاتي وساعدنا في تحسين خدماتنا.
            </p>
            <div className="mt-8 space-y-2 text-muted-foreground">
              <div>📞 {contactInfo.storePhone}</div>
              <div>📧 {contactInfo.storeEmail}</div>
              <div>📍 {contactInfo.storeAddress}</div>
            </div>
            <div className="mt-8">
                <Image src={team} alt="تواصل مع الدعم" width={600} height={400} className="rounded-lg shadow-lg" data-ai-hint="customer support"/>
            </div>
          </div>
          <Card className="p-8 shadow-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: أحمد محمد" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="+966 50 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رسالتك</FormLabel>
                      <FormControl>
                        <Textarea placeholder="كيف يمكننا مساعدتك؟" {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تقييمك لنا</FormLabel>
                      <FormControl>
                        <div className="flex gap-1" dir="ltr" onMouseLeave={() => setHoverRating(0)}>
                          {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                              <Star
                                key={ratingValue}
                                className={cn(
                                  "w-6 h-6 cursor-pointer transition-colors",
                                  ratingValue <= (hoverRating || field.value)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                )}
                                onClick={() => field.onChange(ratingValue)}
                                onMouseEnter={() => setHoverRating(ratingValue)}
                              />
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">إرسال الرسالة والتقييم</Button>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </section>
  );
}
