"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { auth, db } from "../../lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, serverTimestamp } from "firebase/firestore"
import Link from "next/link"

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
        const settingsDoc = await getDoc(doc(db, 'settings', 'trial'))
        if (settingsDoc.exists()) {
          setTrialDays(settingsDoc.data().totalDays || 14)
        }
      } catch (e) {}
    }
    fetchTrialDays()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
      const user = userCredential.user
      
      const idToken = await user.getIdToken()
      document.cookie = `token=${idToken}; path=/; max-age=3600; samesite=lax`

      const trialStartDate = new Date()
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + trialDays)

      await setDoc(doc(db, 'users', user.uid), {
        name: values.name,
        storeName: values.storeName,
        phone: values.phone,
        email: values.email,
        role: 'trial_user',
        subscriptionStatus: 'trial',
        trialStartDate: trialStartDate,
        trialEndDate: trialEndDate,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        storeData: {
          storeName: values.storeName,
          storeAddress: '',
          storePhone: values.phone,
          storeWebsite: '',
          currency: 'SDG',
          language: 'ar'
        }
      })

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
      })

      toast({
        title: "تم إنشاء الحساب بنجاح!",
        description: `تبدأ فترة تجريبية مجانية لمدة ${trialDays} يوم. جارٍ توجيهك إلى لوحة التحكم.`,
      })
      router.replace('/dashboard')
    } catch (error: any) {
      console.error("Error during signup:", error)
      toast({
        title: "فشل إنشاء الحساب.",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <motion.form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">الاسم الكامل</FormLabel>
              <FormControl>
                <motion.div whileHover={{ scale: 1.01 }} whileFocus={{ scale: 1.02 }} className="relative">
                  <Input 
                    placeholder="مثال: سارة عبدالله" 
                    {...field} 
                    className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg pl-9"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-indigo-500">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6366f1"><circle cx="12" cy="8" r="4" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4"/></svg>
                  </span>
                </motion.div>
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="storeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">اسم المتجر</FormLabel>
              <FormControl>
                <motion.div whileHover={{ scale: 1.01 }} whileFocus={{ scale: 1.02 }} className="relative">
                  <Input 
                    placeholder="مثال: متجر الأناقة" 
                    {...field} 
                    className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg pl-9"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-500">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#a78bfa"><rect x="4" y="7" width="16" height="10" rx="2" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 11v2m4-2v2"/></svg>
                  </span>
                </motion.div>
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">رقم الهاتف</FormLabel>
              <FormControl>
                <motion.div whileHover={{ scale: 1.01 }} whileFocus={{ scale: 1.02 }} className="relative">
                  <Input 
                    placeholder="مثال: 0912345678" 
                    {...field} 
                    className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg pl-9"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-green-500">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10b981"><rect x="3" y="7" width="18" height="10" rx="2" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 11v2m4-2v2m4-2v2"/></svg>
                  </span>
                </motion.div>
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">البريد الإلكتروني</FormLabel>
              <FormControl>
                <motion.div whileHover={{ scale: 1.01 }} whileFocus={{ scale: 1.02 }} className="relative">
                  <Input 
                    placeholder="you@example.com" 
                    {...field} 
                    className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg pl-9"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-500">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#2563eb"><rect x="3" y="7" width="18" height="10" rx="2" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 11v2m4-2v2m4-2v2"/></svg>
                  </span>
                </motion.div>
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">كلمة المرور</FormLabel>
              <FormControl>
                <motion.div whileHover={{ scale: 1.01 }} whileFocus={{ scale: 1.02 }} className="relative">
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg pl-9"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280"><rect x="6" y="10" width="12" height="8" rx="2" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 14v2"/></svg>
                  </span>
                </motion.div>
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />
        
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg shadow-md transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري إنشاء الحساب...
              </>
            ) : (
              `ابدأ تجربتك المجانية (${trialDays} يوم)`
            )}
          </Button>
        </motion.div>
        
        
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 mt-2">
          <div className="flex items-center bg-gray-50 p-3 rounded-lg justify-center gap-2">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#4f46e5"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4"/></svg>
            <span>فترة تجريبية مجانية لمدة {trialDays} يوم</span>
          </div>
          <div className="flex items-center bg-gray-50 p-3 rounded-lg justify-center gap-2">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#059669"><rect x="4" y="7" width="16" height="10" rx="2" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 11v2m4-2v2"/></svg>
            <span>لا توجد بطاقة ائتمان مطلوبة</span>
          </div>
        </div>
      </motion.form>
    </Form>
  )
}