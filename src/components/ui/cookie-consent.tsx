"use client";
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [decision, setDecision] = useState<string | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // أضف تأخير 2.5 ثانية قبل الظهور
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    } else {
      setDecision(consent);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setDecision("accepted");
    setVisible(false);
  };
  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    // مسح كل الكوكيز والتخزين المحلي عند الرفض
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/');
    });
    localStorage.clear();
    sessionStorage.clear();
    setDecision("rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[9999] flex justify-center animate-fade-in">
      <div className="max-w-2xl w-full m-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-indigo-700 shadow-2xl rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 text-sm text-right">
          <b className="text-lg">تنويه حول الكوكيز 🍪</b>
          <div className="mt-2">
            نحن نستخدم الكوكيز لتحسين تجربتك، حفظ تفضيلاتك، تفعيل تسجيل الدخول، وتحليل الاستخدام بشكل مجهول. <br />
            <span className="text-xs text-indigo-100">الكوكيز هي ملفات صغيرة تُخزن في متصفحك وتُستخدم لتذكر تسجيل الدخول، تفضيلات اللغة، إعدادات العرض، وتحليل زيارات الموقع بشكل مجهول (بدون تتبع شخصي). بعض الكوكيز ضرورية لتشغيل الموقع بشكل صحيح، وبعضها اختياري لتحسين الأداء والتسويق.</span>
            <br />
            باستخدامك هذا الموقع، أنت توافق على 
            <a href="/privacy-policy" className="underline text-yellow-200 hover:text-yellow-300" target="_blank">سياسة الخصوصية</a>
            ،
            <a href="/terms-of-service" className="underline text-yellow-200 hover:text-yellow-300" target="_blank">الشروط والأحكام</a>
            ، و
            <a href="/security-policy" className="underline text-yellow-200 hover:text-yellow-300" target="_blank">سياسة الحماية</a>.
          </div>
        </div>
        <div className="flex flex-col gap-2 min-w-[120px]">
          <button
            onClick={handleAccept}
            className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-2 px-6 rounded-lg shadow transition-all border border-yellow-300"
            aria-label="موافق على استخدام الكوكيز"
          >
            أوافق
          </button>
          <button
            onClick={handleReject}
            className="bg-white/20 hover:bg-white/40 text-white font-bold py-2 px-6 rounded-lg border border-white/30 transition-all"
            aria-label="رفض الكوكيز"
          >
            أرفض
          </button>
        </div>
      </div>
    </div>
  );
}
