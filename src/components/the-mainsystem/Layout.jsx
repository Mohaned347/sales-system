import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiPackage, FiShoppingCart, FiSettings, 
  FiLogOut, FiUser, FiMenu, FiX, FiUsers,
  FiDollarSign, FiPieChart, FiCreditCard,FiHeadphones, FiTruck
} from 'react-icons/fi';
import { auth } from '../../backEnd/firebase';
import { signOut } from 'firebase/auth';
import { useAppContext } from '../../backEnd/context/AppContext';
import { useState, useEffect } from 'react';
import montygoLogo from '../assets/WhatsApp Image 2025-01-16 at 22.17.38_bb6deaba.jpg';
import ventasLogo from '../assets/Untitled (10).png';

export default function Layout() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const menuItems = [
    { name: 'الرئيسية', icon: FiHome, path: '/' },
    { name: 'المنتجات', icon: FiPackage, path: '/products' },
    { name: 'المبيعات', icon: FiShoppingCart, path: '/sales' },
    { name: 'العملاء', icon: FiUsers, path: '/costumars' },
    { name: 'الإعدادات', icon: FiSettings, path: '/settings' },
    { name: 'خدمة العملاء', icon: FiHeadphones, path: '/customer-service' }
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Mobile menu button */}
      <div className="md:hidden fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-full bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 transition-colors"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} 
                      md:translate-x-0 transform fixed md:static inset-y-0 right-0 z-40
                      w-64 bg-white shadow-xl md:shadow-none border-l border-gray-100
                      transition-transform duration-300 ease-in-out flex flex-col`}>
        
        {/* Logo section */}
        <div className="flex flex-col items-center py-6 px-4 border-b border-gray-200">
          <div className="flex items-center justify-center mb-3">
            <img 
              src={ventasLogo} 
              alt="MontyGo Logo" 
              className="h-10 w-auto object-contain"
            />
            <div className="mr-2">
              <h1 className="text-xl font-bold text-gray-800">
                {user?.storeData?.storeName || 'متجرك'}
              </h1>
            </div>
          </div>
        </div>

        {/* User info section */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center ml-3 text-white">
                  <FiUser size={16} />
                </div>
                <div>
                  <p className="font-medium text-sm">{user.displayName || user.email.split('@')[0]}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
                </div>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                مدير
              </span>
            </div>
          )}
        </div>

        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-yellow-50 text-gray-700 hover:text-yellow-600 transition-all duration-200 group"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-yellow-100 transition-colors duration-200">
                  <item.icon className="text-gray-600 group-hover:text-yellow-600" />
                </div>
                <span className="mr-2">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-lg mr-2">
              <FiLogOut className="text-red-600" />
            </div>
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top toolbar */}
        <div className="flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="md:hidden flex items-center">
              <img 
                src={montygoLogo} 
                alt="Store Logo" 
                className="h-8 w-auto object-contain mr-2"
              />
              <span className="font-semibold">
                {user?.storeData?.storeName || 'متجرك'}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 hidden md:block">
              مرحباً بك، {user?.displayName || user?.email.split('@')[0]}
            </h2>
          </div>
          
          {/* Quick user info */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-medium">
                {user?.storeData?.storeName || 'متجرك'}
              </p>
              <div className="flex items-center">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mr-2">
                  أساسي
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  مدير
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer">
              <img 
                src={ventasLogo} 
                alt="Ventas Logo" 
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
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
  );
}