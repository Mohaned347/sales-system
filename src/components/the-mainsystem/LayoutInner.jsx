"use client"

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/app-context';
import { FiMenu, FiHome, FiPackage, FiShoppingCart, FiUsers, FiBarChart2, FiSettings, FiHeadphones, FiLogOut, FiUser, FiStar, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Pricing from '@/components/landing/pricing';
import { useTrialExpired } from '@/components/trial-status/trial-alert';

function OnboardingTutorial({ onFinish }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: 'مرحباً بك في النظام!',
      desc: 'هنا ستجد كل ما تحتاجه لإدارة مبيعاتك بسهولة. سنرشدك خطوة بخطوة لتتعرف على كل قسم.',
      icon: FiHome,
      button: 'الرئيسية',
      color: 'bg-yellow-100 text-yellow-700',
      extra: 'ابدأ من هنا لمتابعة ملخص متجرك وإحصائياتك المهمة.'
    },
    {
      title: 'القائمة الرئيسية',
      desc: 'تنقل بين الصفحات بسهولة من خلال السايدبار الجانبي. كل قسم له أيقونة مميزة.',
      icon: FiMenu,
      button: 'القائمة',
      color: 'bg-blue-100 text-blue-700',
      extra: 'جرب الضغط على أي قسم للانتقال إليه.'
    },
    {
      title: 'إدارة المنتجات',
      desc: 'أضف وعدل منتجاتك وتابع المخزون من صفحة المنتجات.',
      icon: FiPackage,
      button: 'المنتجات',
      color: 'bg-purple-100 text-purple-700',
      extra: 'كل منتج يمكنك تعديله أو حذفه بسهولة.'
    },
    {
      title: 'تسجيل المبيعات',
      desc: 'سجل عمليات البيع وتابع تقاريرك بسهولة من صفحة المبيعات.',
      icon: FiShoppingCart,
      button: 'المبيعات',
      color: 'bg-green-100 text-green-700',
      extra: 'كل عملية بيع تسجل تلقائياً في النظام.'
    },
    {
      title: 'العملاء',
      desc: 'تابع بيانات عملائك وسجل مشترياتهم وتواصل معهم.',
      icon: FiUsers,
      button: 'العملاء',
      color: 'bg-pink-100 text-pink-700',
      extra: 'يمكنك إضافة عملاء جدد أو تعديل بياناتهم.'
    },
    {
      title: 'التقارير',
      desc: 'شاهد تقارير وتحليلات متقدمة حول أداء متجرك ومبيعاتك.',
      icon: FiBarChart2,
      button: 'التقارير',
      color: 'bg-orange-100 text-orange-700',
      extra: 'كل تقرير يعرض بيانات مفصلة مع رسوم بيانية.'
    },
    {
      title: 'الإعدادات',
      desc: 'عدل بيانات متجرك، طرق الدفع، إعدادات الحساب والمزيد.',
      icon: FiSettings,
      button: 'الإعدادات',
      color: 'bg-gray-100 text-gray-700',
      extra: 'خصص النظام كما يناسبك من هنا.'
    },
    {
      title: 'خدمة العملاء',
      desc: 'تواصل مع الدعم الفني أو راجع طلبات العملاء.',
      icon: FiHeadphones,
      button: 'خدمة العملاء',
      color: 'bg-blue-50 text-blue-700',
      extra: 'دعم فني متوفر دائماً لمساعدتك.'
    },
    {
      title: 'جاهز للانطلاق!',
      desc: 'يمكنك الآن البدء في استخدام النظام. بالتوفيق! إذا احتجت أي مساعدة يمكنك إعادة الشرح من زر "إعادة شرح النظام".',
      icon: FiStar,
      button: '',
      color: 'bg-green-100 text-green-700',
      extra: 'نتمنى لك تجربة رائعة ونجاحاً باهراً!'
    }
  ];
  const isSidebarStep = step < steps.length - 1;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative animate-fade-in">
        {/* زر إغلاق */}
        <button onClick={onFinish} className="absolute top-3 left-3 text-gray-400 hover:text-red-600 text-2xl font-bold">×</button>
        <div className="flex flex-col items-center mb-4">
          <span className={`mb-2 flex items-center justify-center w-16 h-16 rounded-full shadow-lg ${steps[step].color} animate-bounce`}> 
            {React.createElement(steps[step].icon, { className: 'w-8 h-8' })}
          </span>
          <h2 className="text-2xl font-bold mb-2 text-primary">{steps[step].title}</h2>
          <p className="text-gray-700 mb-2 text-base">{steps[step].desc}</p>
          {steps[step].extra && <div className="text-xs text-gray-500 mb-2">{steps[step].extra}</div>}
          {steps[step].button && (
            <button className={`mt-2 px-6 py-2 rounded-lg font-bold shadow-lg border-2 border-primary bg-primary/10 text-primary text-lg animate-pulse flex items-center gap-2`} disabled>
              {React.createElement(steps[step].icon, { className: 'w-5 h-5' })}
              {steps[step].button}
            </button>
          )}
        </div>
        <div className="flex justify-between items-center mt-6">
          <button
            className="px-4 py-2 bg-gray-200 rounded font-bold"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
          >السابق</button>
          {step < steps.length - 1 ? (
            <button
              className="px-6 py-2 bg-primary text-white rounded font-bold"
              onClick={() => setStep(s => s + 1)}
            >التالي</button>
          ) : (
            <button
              className="px-6 py-2 bg-green-600 text-white rounded font-bold"
              onClick={onFinish}
            >إنهاء</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayoutInner({ children }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAppContext();
  const [showTutorialButton, setShowTutorialButton] = useState(true);
  const trialExpired = typeof window !== 'undefined' && localStorage.getItem('trial_expired') === 'true';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('onboarding_seen');
      if (!seen) setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    if (user && user.metadata?.creationTime) {
      const createdAt = new Date(user.metadata.creationTime);
      const now = new Date();
      const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
      setShowTutorialButton(diffDays <= 2);
    }
  }, [user]);

  const handleFinishTutorial = () => {
    setShowTutorial(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_seen', 'true');
    }
  };

  const menuItems = [
    { name: 'الرئيسية', icon: FiHome, path: '/dashboard' },
    { name: 'المنتجات', icon: FiPackage, path: '/dashboard/products' },
    { name: 'المبيعات', icon: FiShoppingCart, path: '/dashboard/sales' },
    { name: 'العملاء', icon: FiUsers, path: '/dashboard/customers' },
    { name: 'التقارير', icon: FiBarChart2, path: '/dashboard/analytics' },
    { name: 'الإعدادات', icon: FiSettings, path: '/dashboard/settings' },
    { name: 'خدمة العملاء', icon: FiHeadphones, path: '/dashboard/customer-service' }
  ];

  // إغلاق السايدبار تلقائياً عند اختيار أي رابط في الموبايل
  const handleNavClick = () => setSidebarOpen(false);

  if (user && user.role === 'trial_user' && trialExpired && pathname !== '/dashboard/customer-service') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 flex-col gap-8" dir="rtl">
        <div className="bg-white border border-red-300 rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">انتهت الفترة التجريبية</h2>
          <p className="text-red-600 mb-4">لا يمكنك الوصول إلى النظام بعد انتهاء الفترة التجريبية. يرجى ترقية حسابك للاستمرار أو التواصل مع الدعم.</p>
          <div className="flex flex-col gap-4 items-center">
            <Link href="/pricing" legacyBehavior>
              <a className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-bold border-2 border-yellow-600 animate-pulse">ترقية الحساب</a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* زر فتح السايدبار في الموبايل */}
      <button
        className="md:hidden fixed top-4 right-4 z-[100] bg-primary text-white p-2 rounded-full shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="فتح القائمة الجانبية"
      >
        <FiMenu className="w-6 h-6" />
      </button>
      {/* Overlay للموبايل */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[99] md:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
      )}
      {/* سايدبار ثابت في الديسكتوب و ثابتة فوق المحتوى في الموبايل */}
      <aside
        className={`
          md:fixed md:top-0 md:right-0 md:bottom-0 md:w-64 md:bg-white md:border-r md:border-gray-200 md:shadow-xl md:flex md:flex-col md:z-50
          fixed top-0 right-0 h-screen w-64 bg-white border-r border-gray-200 shadow-xl flex flex-col z-[100]
          ${sidebarOpen ? 'block' : 'hidden'}
          md:static md:block
        `}
        style={{ minHeight: '100vh' }}
      >
        {/* زر إغلاق في الموبايل */}
        <div className="md:hidden flex justify-start p-4">
          <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-red-600 text-2xl"><FiX /></button>
        </div>
        {/* Logo section */}
       <div className="flex flex-col items-center py-6 px-4 border-b border-gray-200 bg-gradient-to-br from-yellow-50 to-orange-50">
  <div className="flex items-center justify-center mb-3">
    <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-yellow-200">
      <img src={require('@/components/landing/photos/image.png').default.src} alt="مبيعاتي Logo" width={48} height={48} className="rounded-md" />
    </div>
    <div className="mr-3">
      <h1 className="text-xl font-bold text-gray-800">
        {user?.storeData?.storeName || 'متجرك'}
      </h1>
      <p className="text-xs text-gray-500">نظام إدارة المبيعات</p>
    </div>
  </div>
</div>
        {/* User info section */}
        <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center ml-3 text-white">
                  <FiUser size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm">{user.displayName || user.email.split('@')[0]}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {user.role === 'trial_user' ? 'تجريبي' : 'مدفوع'}
              </span>
            </div>
          )}
        </div>
        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2 px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-yellow-100 text-yellow-700 border-r-2 border-yellow-500' 
                      : 'hover:bg-yellow-50 text-gray-700 hover:text-yellow-600'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'bg-yellow-200 text-yellow-700' 
                      : 'bg-gray-100 group-hover:bg-yellow-100 text-gray-600 group-hover:text-yellow-600'
                  }`}>
                    <item.icon />
                  </div>
                  <span className="mr-3">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      {/* محتوى الصفحة بدون تأثر بفتح السايدبار في الموبايل */}
      <div className="flex-1 flex flex-col min-h-screen mr-0 md:mr-64 overflow-x-hidden bg-white">
        {showTutorial && <OnboardingTutorial onFinish={handleFinishTutorial} />}
        {showTutorialButton && (
          <div className="fixed left-4 bottom-4 z-50">
            <button
              className="bg-primary text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-primary/90"
              onClick={() => setShowTutorial(true)}
            >
              إعادة شرح النظام
            </button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">{children}</main>
      </div>
    </div>
  );
} 