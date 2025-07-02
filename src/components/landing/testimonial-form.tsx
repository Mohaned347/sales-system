'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Star } from "lucide-react";

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
import { useAppContext } from "@/context/app-context";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "يجب أن يتكون الاسم من حرفين على الأقل.",
  }),
  title: z.string().min(2, {
    message: "يجب أن يتكون المسمى الوظيفي من حرفين على الأقل.",
  }),
  quote: z.string().min(10, {
    message: "يجب أن تتكون الرسالة من 10 أحرف على الأقل.",
  }),
  rating: z.number().min(1, { message: "الرجاء تحديد تقييم." }).max(5),
});

export default function TestimonialForm() {
  const { toast } = useToast();
  const { addTestimonial } = useAppContext();
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      title: "",
      quote: "",
      rating: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await addTestimonial(values);
      toast({
        title: "شكرًا لك!",
        description: "تم إرسال تقييمك بنجاح.",
      });
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من إرسال تقييمك. الرجاء المحاولة مرة أخرى.",
      });
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">أضف رأيك</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input placeholder="اسمك الكامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المنصب/الشركة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: مدير, شركة الأناقة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="quote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رأيك</FormLabel>
                <FormControl>
                  <Textarea placeholder="شاركنا تجربتك مع مبيعاتي..." {...field} />
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
                <FormLabel>التقييم</FormLabel>
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
                              ? "text-accent fill-accent"
                              : "text-muted-foreground/50"
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
