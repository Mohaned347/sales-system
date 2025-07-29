"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from "react"

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
import { auth, db } from "../../lib/firebase" // Adjust the import path if necessary
import { createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, serverTimestamp } from "firebase/firestore"

const formSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يتكون الاسم من حرفين على الأقل." }),
  storeName: z.string().min(2, { message: "يجب أن يتكون اسم المتجر من حرفين على الأقل." }),
  phone: z.string().min(9, { message: "الرجاء إدخال رقم هاتف صالح." }),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(8, { message: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل." }),
})

export function SignUpForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [trialDays, setTrialDays] = useState(14)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      storeName: "",
      phone: "",
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    const fetchTrialDays = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'trial'));
        if (settingsDoc.exists()) {
          setTrialDays(settingsDoc.data().totalDays || 14);
        }
      } catch (e) {}
    };
    fetchTrialDays();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // Set auth token in cookies
      const idToken = await user.getIdToken();
      document.cookie = `token=${idToken}; path=/; max-age=3600; samesite=lax`;

      // Calculate trial period (trialDays from settings)
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + trialDays); // trialDays from settings

      // Store additional user data in Firestore with trial period and role
      await setDoc(doc(db, 'users', user.uid), {
        name: values.name,
        storeName: values.storeName,
        phone: values.phone,
        email: values.email,
        role: 'trial_user', // Role for trial period
        subscriptionStatus: 'trial',
        trialStartDate: trialStartDate,
        trialEndDate: trialEndDate,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Store settings
        storeData: {
          storeName: values.storeName,
          storeAddress: '',
          storePhone: values.phone,
          storeWebsite: '',
          currency: 'SDG',
          language: 'ar'
        }
      });

      // Create initial store data
      await setDoc(doc(db, 'stores', user.uid), {
        storeName: values.storeName,
        ownerId: user.uid,
        ownerName: values.name,
        phone: values.phone,
        email: values.email,
        createdAt: serverTimestamp(),
        isActive: true,
        subscription: {
          status: 'trial',
          plan: 'basic',
          startDate: trialStartDate,
          endDate: trialEndDate,
          isActive: true
        }
      });

      toast({
        title: "تم إنشاء الحساب بنجاح!",
        description: "تبدأ فترة تجريبية مجانية لمدة 14 يوم. جارٍ توجيهك إلى لوحة التحكم.",
      });
      router.push('/dashboard'); // Redirect to the dashboard route
      setIsLoading(false)
    } catch (error: any) {
      console.error("Error during signup:", error);
      toast({
        title: "فشل إنشاء الحساب.",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input placeholder="مثال: سارة عبدالله" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="storeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المتجر</FormLabel>
              <FormControl>
                <Input placeholder="مثال: متجر الأناقة" {...field} />
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
              <FormLabel>رقم الهاتف</FormLabel>
              <FormControl>
                <Input placeholder="مثال: 0912345678" {...field} />
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
          ابدأ تجربتك المجانية الآن
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          <p>✓ فترة تجريبية مجانية لمدة {trialDays} يوم</p>
          <p>✓ لا توجد بطاقة ائتمان مطلوبة</p>
        </div>
      </form>
    </Form>
  )
}
