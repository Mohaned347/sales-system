"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { FiClock, FiStar, FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function TrialAlert() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trialData, setTrialData] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [trialSettings, setTrialSettings] = useState({ totalDays: 14 });

  useEffect(() => {
    // جلب إعدادات الفترة التجريبية من Firestore
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'trial'));
        if (settingsDoc.exists()) {
          setTrialSettings({ totalDays: settingsDoc.data().totalDays || 14 });
        }
      } catch (e) { /* تجاهل الخطأ */ }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchTrialData = async () => {
      if (!user?.uid) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const trialEndDate = userData.trialEndDate?.toDate();
          if (trialEndDate) {
            const now = new Date();
            const timeLeft = trialEndDate.getTime() - now.getTime();
            const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
            const totalDays = trialSettings.totalDays;
            const daysUsed = Math.max(0, totalDays - daysLeft);
            const progress = totalDays > 0 ? Math.min(100, Math.max(0, (daysUsed / totalDays) * 100)) : 0;
            const isExpired = daysLeft <= 0;
            setTrialData({
              daysLeft,
              progress,
              isExpired,
              trialEndDate
            });
            // حفظ حالة انتهاء التجربة في localStorage
            if (isExpired) {
              localStorage.setItem('trial_expired', 'true');
            } else {
              localStorage.removeItem('trial_expired');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching trial data:', error);
      }
    };
    fetchTrialData();
  }, [user?.uid, trialSettings.totalDays]);

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleExtendTrial = async () => {
    setIsLoading(true);
    try {
      // هنا يمكن إضافة منطق تمديد التجربة
      toast({
        title: "تم إرسال طلب التمديد",
        description: "سنراجع طلبك ونرد عليك قريباً",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // حفظ في localStorage لتجنب إظهاره مرة أخرى في هذه الجلسة
    localStorage.setItem('trialAlertDismissed', 'true');
  };

  // لا تظهر إذا كان المستخدم ليس تجريبياً أو إذا تم إخفاؤه
  if (!user || user.role !== 'trial_user' || !isVisible || !trialData) {
    return null;
  }

  const { daysLeft, progress, isExpired } = trialData;

  return (
    <Card className={`mb-6 border-l-4 ${
      isExpired 
        ? 'border-red-500 bg-red-50' 
        : daysLeft <= 3 
          ? 'border-orange-500 bg-orange-50' 
          : 'border-yellow-500 bg-yellow-50'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isExpired ? (
              <FiAlertTriangle className="text-red-600 text-xl" />
            ) : daysLeft <= 3 ? (
              <FiClock className="text-orange-600 text-xl" />
            ) : (
              <FiClock className="text-yellow-600 text-xl" />
            )}
            <CardTitle className={`text-lg ${
              isExpired 
                ? 'text-red-800' 
                : daysLeft <= 3 
                  ? 'text-orange-800' 
                  : 'text-yellow-800'
            }`}>
              {isExpired ? 'انتهت الفترة التجريبية' : 'الفترة التجريبية'}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={16} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isExpired ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-700">
              <FiAlertTriangle className="text-red-600" />
              <span className="font-medium">انتهت فترة التجربة المجانية</span>
            </div>
            <p className="text-red-600 text-sm">
              لمواصلة استخدام جميع المميزات، يرجى ترقية حسابك إلى الخطة المدفوعة.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <FiStar className="ml-2" />
                ترقية الحساب
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiClock className="text-yellow-600" />
                <span className="font-medium text-gray-700">
                  متبقي {typeof daysLeft === 'number' ? daysLeft : trialSettings.totalDays}يوم
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(progress)}% من الفترة التجريبية
              </div>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            {daysLeft <= 3 && (
              <div className="flex items-center gap-2 text-orange-700 bg-orange-100 p-3 rounded-lg">
                <FiAlertTriangle className="text-orange-600" />
                <span className="text-sm font-medium">
                  تنبيه: الفترة التجريبية تنتهي قريباً!
                </span>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <FiStar className="ml-2" />
                ترقية الآن
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>• استمتع بجميع المميزات مجاناً لمدة {trialSettings.totalDays} يوم</p>
              <p>• يمكنك الترقية في أي وقت خلال الفترة التجريبية</p>
              <p>• لن يتم خصم أي مبلغ حتى انتهاء الفترة التجريبية</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook لتصدير حالة انتهاء التجربة لباقي النظام
export function useTrialExpired() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('trial_expired') === 'true';
} 