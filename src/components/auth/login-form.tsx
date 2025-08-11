"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../../lib/firebase"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password)
      const user = userCredential.user
      
      const idToken = await user.getIdToken()
      document.cookie = `token=${idToken}; path=/; max-age=3600; samesite=lax`

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        // إذا كان المستخدم مدير، وجهه مباشرة للإدارة بدون أي رسائل أو تحقق
        if (userData.role === 'admin') {
          router.replace('/admin')
          return
        }
        // باقي المنطق كما هو
        if (userData.subscriptionStatus === 'trial') {
          const trialEndDate = userData.trialEndDate?.toDate()
          const now = new Date()
          if (trialEndDate && now > trialEndDate) {
            toast({
              title: "انتهت الفترة التجريبية",
              description: "يرجى الاشتراك في إحدى خططنا لمواصلة استخدام النظام.",
              variant: "destructive",
            })
            router.replace('/pricing')
            return
          }
        }

        if (userData.role === 'admin') {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "جاري توجيهك إلى لوحة التحكم الإدارية...",
          })
          router.replace('/admin')
        } else {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "جاري توجيهك إلى لوحة التحكم...",
          })
          router.replace('/dashboard')
        }
      } else {
        toast({
          title: "خطأ في البيانات",
          description: "لم يتم العثور على بيانات المستخدم.",
          variant: "destructive",
        })
  // أزلنا return المكرر القديم، والآن return واحد فقط في نهاية الدالة
      }
    } catch (error: any) {
      console.error("Error during login:", error)
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى."
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "البريد الإلكتروني غير مسجل."
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "كلمة المرور غير صحيحة."
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "تم تجاوز عدد المحاولات المسموح. يرجى المحاولة لاحقاً."
      }
      
      toast({
        title: "فشل تسجيل الدخول",
        description: errorMessage,
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
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        aria-label="نموذج تسجيل الدخول"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700" htmlFor="login-email">البريد الإلكتروني</FormLabel>
              <FormControl>
                <motion.div whileHover={{ scale: 1.01 }} whileFocus={{ scale: 1.02 }}>
                  <Input 
                    id="login-email"
                    placeholder="you@example.com" 
                    {...field} 
                    className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                    aria-label="البريد الإلكتروني"
                    aria-describedby="login-email-desc"
                    tabIndex={0}
                  />
                </motion.div>
              </FormControl>
              <FormMessage id="login-email-desc" className="text-red-500 text-sm" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-gray-700" htmlFor="login-password">كلمة المرور</FormLabel>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                  tabIndex={0}
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <FormControl>
                <motion.div whileHover={{ scale: 1.01 }} whileFocus={{ scale: 1.02 }}>
                  <Input 
                    id="login-password"
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                    aria-label="كلمة المرور"
                    aria-describedby="login-password-desc"
                    tabIndex={0}
                  />
                </motion.div>
              </FormControl>
              <FormMessage id="login-password-desc" className="text-red-500 text-sm" />
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
            aria-label="زر تسجيل الدخول"
            tabIndex={0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                جاري تسجيل الدخول...
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </Button>
        </motion.div>
        
        <div className="text-center text-sm text-gray-600">
          ليس لديك حساب؟{' '}
          <Link 
            href="/signup" 
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            aria-label="رابط التسجيل"
            tabIndex={0}
          >
            ابدأ تجربتك المجانية
          </Link>
        </div>
      </motion.form>
    </Form>
  )
}