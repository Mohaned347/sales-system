"use client"

import { useState, useEffect, useCallback } from 'react';
import { useAppContext, AppProvider } from '@/context/app-context';
import { AuthProvider } from '@/components/auth/auth-provider';
import { FiMenu, FiHome, FiPackage, FiShoppingCart, FiUsers, FiBarChart2, FiSettings, FiHeadphones, FiLogOut, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, handleLogout } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const handleLogoutClick = useCallback(async () => {
    try {
      await handleLogout();
      // لا داعي لاستدعاء router.push('/login') هنا لأن handleLogout يوجه تلقائياً
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  }, [handleLogout]);

  const menuItems = [
    { name: 'الرئيسية', icon: FiHome, path: '/dashboard' },
    { name: 'المنتجات', icon: FiPackage, path: '/dashboard/products' },
    { name: 'المبيعات', icon: FiShoppingCart, path: '/dashboard/sales' },
    { name: 'العملاء', icon: FiUsers, path: '/dashboard/customers' },
    { name: 'التقارير', icon: FiBarChart2, path: '/dashboard/analytics' },
    { name: 'الإعدادات', icon: FiSettings, path: '/dashboard/settings' },
    { name: 'خدمة العملاء', icon: FiHeadphones, path: '/dashboard/customer-service' }
  ];

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (desktop) {
        setIsMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <AuthProvider>
      <AppProvider>
        <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
          {/* Top bar */}
          <div className="w-full flex justify-start items-center p-2 bg-gradient-to-r from-yellow-100 to-orange-100 border-b border-yellow-200">
            <a href="/" className="text-yellow-700 font-bold px-4 py-2 rounded-lg hover:bg-yellow-200 transition-all">العودة للموقع الرئيسي</a>
          </div>

          {/* Sidebar - ثابت */}
          <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                          md:translate-x-0 transform fixed md:static inset-y-0 right-0 z-40
                          w-64 bg-white shadow-xl md:shadow-lg border-l border-gray-200
                          transition-transform duration-300 ease-in-out flex flex-col
                          md:flex-shrink-0`}>
            {/* Logo section */}
            <div className="flex flex-col items-center py-6 px-4 border-b border-gray-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <FiPackage className="text-white text-xl" />
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
          
          </div>
          {/* Main content area - متحرك */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top toolbar */}
            <div className="flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 mr-3"
                >
                  <FiMenu size={20} />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  {menuItems.find(item => item.path === pathname)?.name || 'لوحة التحكم'}
                </h2>
              </div>
              {/* Quick user info */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex flex-col items-end">
                  <p className="text-sm font-medium">
                    {user?.storeData?.storeName || 'متجرك'}
                  </p>
                  <div className="flex items-center">
                    {user?.role === 'trial_user' && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mr-2">
                        تجريبي
                      </span>
                    )}
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      مدير
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
                  <FiUser size={18} />
                </div>
              </div>
            </div>
            {/* Main content - متحرك */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
              {children}
            </main>
          </div>
          {/* Mobile menu overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>
      </AppProvider>
    </AuthProvider>
  );
}
