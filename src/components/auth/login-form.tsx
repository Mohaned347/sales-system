"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../../lib/firebase"

const formSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(1, { message: "كلمة المرور مطلوبة." }),
})

export function LoginForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // Set auth token in cookies
      const idToken = await user.getIdToken();
      document.cookie = `token=${idToken}; path=/; max-age=3600; samesite=lax`;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check trial status
        if (userData.subscriptionStatus === 'trial') {
          const trialEndDate = userData.trialEndDate?.toDate();
          const now = new Date();
          
          if (trialEndDate && now > trialEndDate) {
            toast({
              title: "انتهت الفترة التجريبية",
              description: "يرجى الاشتراك في إحدى خططنا لمواصلة استخدام النظام.",
              variant: "destructive",
            });
            router.push('/pricing');
            return;
          }
        }

        // Redirect based on user role
        if (userData.role === 'admin') {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "جاري توجيهك إلى لوحة التحكم الإدارية...",
          });
          router.push('/admin');
        } else {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "جاري توجيهك إلى لوحة التحكم...",
          });
          router.push('/dashboard');
        }
      } else {
        toast({
          title: "خطأ في البيانات",
          description: "لم يتم العثور على بيانات المستخدم.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error during login:", error);
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "البريد الإلكتروني غير مسجل.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "كلمة المرور غير صحيحة.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "تم تجاوز عدد المحاولات المسموح. يرجى المحاولة لاحقاً.";
      }
      
      toast({
        title: "فشل تسجيل الدخول",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>كلمة المرور</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          تسجيل الدخول
        </Button>
      </form>
    </Form>
  )
}
