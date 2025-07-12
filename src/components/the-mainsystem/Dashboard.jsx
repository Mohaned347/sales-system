import { useState, useEffect } from 'react';
import { useAppContext } from '../../backEnd/context/AppContext';
import { FiTrendingUp, FiPackage, FiShoppingCart, FiCalendar, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import montygoLogo from '../assets/WhatsApp Image 2025-01-16 at 22.17.38_bb6deaba.jpg';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const { products, sales, user, getSalesAnalytics, getInventoryReport } = useAppContext();
  const [activeTab, setActiveTab] = useState('daily');
  const [storeData, setStoreData] = useState({});
  
  const dailyAnalytics = getSalesAnalytics('daily');
  const monthlyAnalytics = getSalesAnalytics('monthly');
  const yearlyAnalytics = getSalesAnalytics('yearly');
  const inventoryReport = getInventoryReport();

  useEffect(() => {
    if (user?.storeData) {
      setStoreData(user.storeData);
    }
  }, [user]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-EG').format(num || 0);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'SDG' }).format(num || 0);
  };

  const stats = [
    { 
      title: 'إجمالي المبيعات', 
      value: formatCurrency(sales.reduce((sum, sale) => sum + (sale?.total || 0), 0)), 
      icon: FiTrendingUp, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      title: 'المنتجات', 
      value: formatNumber(products.length), 
      icon: FiPackage, 
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      title: 'الطلبات', 
      value: formatNumber(sales.length), 
      icon: FiShoppingCart, 
      color: 'bg-green-100 text-green-600' 
    },
  ];

  const chartData = {
    labels: products.slice(0, 5).map(p => p.name),
    datasets: [
      {
        label: 'المخزون',
        data: products.slice(0, 5).map(p => p.stock),
        backgroundColor: 'rgba(234, 179, 8, 0.7)',
        borderColor: 'rgba(234, 179, 8, 1)',
        borderWidth: 1,
      },
    ],
  };

  const salesChartData = {
    labels: ['يومي', 'شهري', 'سنوي'],
    datasets: [
      {
        label: 'إجمالي المبيعات',
        data: [
          dailyAnalytics.totalSales,
          monthlyAnalytics.totalSales,
          yearlyAnalytics.totalSales
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const inventoryPieData = {
    labels: ['متوفر', 'منخفض', 'منتهي'],
    datasets: [
      {
        data: [
          products.length - inventoryReport.lowStock.length - inventoryReport.outOfStock.length,
          inventoryReport.lowStock.length,
          inventoryReport.outOfStock.length
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(239, 68, 68, 0.7)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-4 md:p-6" dir='rtl'>
    {/* عنوان الصفحة مع ترحيب بالمستخدم */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم {storeData.storeName || 'المتجر'}</h1>
      {user && (
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <p className="text-gray-600">
            مرحباً بعودتك، <span className="font-medium text-yellow-600">{user.displayName || user.email.split('@')[0]}</span>
          </p>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
            الخطة: أساسي
          </span>
        </div>
      )}
    </div>
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <h3 className="text-xl md:text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 md:p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* قسم التحليلات */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FiBarChart2 className="text-yellow-600" />
            التحليلات والتقارير
          </h2>
          <Link 
            to="/analytics" 
            className="text-sm text-yellow-600 hover:underline flex items-center gap-1"
          >
            عرض التفاصيل
            <FiCalendar className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* تحليل المبيعات */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-blue-600" />
              تحليل المبيعات
            </h3>
            <div className="flex gap-2 mb-4">
              {['daily', 'monthly', 'yearly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setActiveTab(period)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeTab === period
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {period === 'daily' && 'يومي'}
                  {period === 'monthly' && 'شهري'}
                  {period === 'yearly' && 'سنوي'}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white p-3 rounded shadow-xs">
                <p className="text-xs text-gray-500">إجمالي المبيعات</p>
                <p className="font-bold">
                  {formatCurrency(
                    activeTab === 'daily' 
                      ? dailyAnalytics.totalSales 
                      : activeTab === 'monthly' 
                        ? monthlyAnalytics.totalSales 
                        : yearlyAnalytics.totalSales
                  )}
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow-xs">
                <p className="text-xs text-gray-500">عدد المبيعات</p>
                <p className="font-bold">
                  {formatNumber(
                    activeTab === 'daily' 
                      ? dailyAnalytics.salesCount 
                      : activeTab === 'monthly' 
                        ? monthlyAnalytics.salesCount 
                        : yearlyAnalytics.salesCount
                  )}
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow-xs">
                <p className="text-xs text-gray-500">متوسط الفاتورة</p>
                <p className="font-bold">
                  {formatCurrency(
                    activeTab === 'daily' 
                      ? dailyAnalytics.avgSale 
                      : activeTab === 'monthly' 
                        ? monthlyAnalytics.avgSale 
                        : yearlyAnalytics.avgSale
                  )}
                </p>
              </div>
            </div>
            
            <div className="h-64">
              <Bar 
                data={salesChartData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false
                      }
                    },
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>
          
         {/* تقرير المخزون */}
<div className="bg-gray-50 p-4 rounded-lg">
  <h3 className="font-medium mb-4 flex items-center gap-2">
    <FiPackage className="text-purple-600" />
    تقرير المخزون
  </h3>
  
  <div className="grid grid-cols-3 gap-2 mb-4">
    <div className="bg-white p-3 rounded shadow-xs">
      <p className="text-xs text-gray-500">إجمالي القيمة</p>
      <p className="font-bold">
        {formatCurrency(products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0))}
      </p>
    </div>
    <div className="bg-white p-3 rounded shadow-xs">
      <p className="text-xs text-gray-500">منخفض المخزون</p>
      <p className="font-bold text-yellow-600">
        {products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length}
      </p>
    </div>
    <div className="bg-white p-3 rounded shadow-xs">
      <p className="text-xs text-gray-500">منتهي المخزون</p>
      <p className="font-bold text-red-600">
        {products.filter(p => (p.stock || 0) === 0).length}
      </p>
    </div>
  </div>
  
  <div className="h-64 relative">
    <Pie 
      data={{
        labels: ['متوفر', 'منخفض', 'منتهي'],
        datasets: [{
          data: [
            products.filter(p => (p.stock || 0) > 10).length,
            products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length,
            products.filter(p => (p.stock || 0) === 0).length
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',
            'rgba(234, 179, 8, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 1
        }]
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            rtl: true,
            labels: {
              font: {
                family: 'Tajawal, sans-serif'
              },
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }}
    />
  </div>
</div>
        </div>
      </div>

      {/* محتوى رئيسي - آخر المبيعات والمنتجات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* آخر المبيعات */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">آخر المبيعات</h2>
            <Link to="/sales" className="text-sm text-yellow-600 hover:underline">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {sales.slice(0, 5).map(sale => (
              <div key={sale.id} className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                <div>
                  <p className="font-medium">فاتورة #{sale.invoiceNumber}</p>
                  <p className="text-xs md:text-sm text-gray-500">
                    {new Date(sale.date).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <p className="font-bold text-yellow-600">{formatNumber(sale.total)} ج.س</p>
              </div>
            ))}
            {sales.length === 0 && (
              <p className="text-center text-gray-500 py-4">لا توجد مبيعات مسجلة بعد</p>
            )}
          </div>
        </div>
        
       {/* المنتجات الأقل في المخزون */}
<div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold">المنتجات حسب الكمية في المخزون</h2>
    <Link to="/products" className="text-sm text-yellow-600 hover:underline">عرض الكل</Link>
  </div>
  
  {/* مفتاح الألوان */}
  <div className="flex flex-wrap justify-center gap-4 mb-4">
    <div className="flex items-center">
      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
      <span className="text-sm">متوفر (أكثر من 10)</span>
    </div>
    <div className="flex items-center">
      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
      <span className="text-sm">منخفض (1-10)</span>
    </div>
    <div className="flex items-center">
      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
      <span className="text-sm">منتهي (0)</span>
    </div>
  </div>

  {/* المخطط الشريطي */}
  <div className="h-[400px] relative">
    <Bar 
      data={{
        labels: products
          .sort((a, b) => a.stock - b.stock) // ترتيب حسب الكمية (من الأقل للأكثر)
          .map(p => p.name), // أسماء المنتجات
        datasets: [{
          label: 'الكمية في المخزون',
          data: products
            .sort((a, b) => a.stock - b.stock)
            .map(p => p.stock),
          backgroundColor: products
            .sort((a, b) => a.stock - b.stock)
            .map(p => 
              p.stock === 0 ? 'rgba(239, 68, 68, 0.7)' : // أحمر للمنتهي
              p.stock <= 10 ? 'rgba(234, 179, 8, 0.7)' : // أصفر للمنخفض
              'rgba(16, 185, 129, 0.7)' // أخضر للمتوفر
            ),
          borderColor: products
            .sort((a, b) => a.stock - b.stock)
            .map(p => 
              p.stock === 0 ? 'rgba(239, 68, 68, 1)' :
              p.stock <= 10 ? 'rgba(234, 179, 8, 1)' :
              'rgba(16, 185, 129, 1)'
            ),
          borderWidth: 1
        }]
      }}
      options={{
        indexAxis: 'y', // لجعل الأشرطة أفقية
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // إخفاء وسيلة الإيضاح
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `الكمية: ${context.raw}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'الكمية في المخزون'
            }
          },
          y: {
            ticks: {
              autoSkip: false // عرض جميع التسميات
            }
          }
        }
      }}
    />
  </div>
</div>
      </div>
    </div>
  );
}