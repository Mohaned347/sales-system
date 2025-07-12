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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "يجب أن يتكون الاسم من حرفين على الأقل.",
  }),
  email: z.string().email({
    message: "الرجاء إدخال بريد إلكتروني صالح.",
  }),
  message: z.string().min(10, {
    message: "يجب أن تتكون الرسالة من 10 أحرف على الأقل.",
  }),
});

export default function Contact() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "تم إرسال الرسالة!",
      description: "شكرًا لتواصلك معنا. سنعاود الاتصال بك قريبًا.",
    });
    form.reset();
  }

  return (
    <section id="contact" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">
              تواصل معنا
            </h2>
            <p className="text-lg text-muted-foreground mt-4">
              هل لديك أسئلة أو تحتاج إلى دعم؟ املأ النموذج، وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن.
            </p>
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
                <Button type="submit" className="w-full">إرسال الرسالة</Button>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </section>
  );
}
