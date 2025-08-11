import { useState, useMemo, useCallback, useEffect } from 'react';
import { FiTrendingUp, FiPackage, FiShoppingCart, FiCalendar, FiPieChart, FiBarChart2, FiDownload, FiStar, FiAward, FiRefreshCw, FiFilter } from 'react-icons/fi';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useAppContext } from '../../context/app-context';
import Link from 'next/link';
import { getAllLocalProducts, getAllLocalSales, localDB } from '@/lib/local-db';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Analytics() {
  const { sales, products, getSalesAnalytics, getInventoryReport } = useAppContext();
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('daily');
  const [isExporting, setIsExporting] = useState(false);
  
  // جلب البيانات المحلية عند فقدان الإنترنت
  const [offlineProducts, setOfflineProducts] = useState([]);
  const [offlineSales, setOfflineSales] = useState([]);

  useEffect(() => {
    if (!navigator.onLine) {
      getAllLocalProducts().then(setOfflineProducts);
      getAllLocalSales().then(setOfflineSales);
    }
  }, []);

  // استخدم البيانات المحلية إذا كنت أوفلاين
  const productsToUse = navigator.onLine ? products : offlineProducts;
  const salesToUse = navigator.onLine ? sales : offlineSales;

  // تحسين الأداء باستخدام useMemo
  const analyticsData = useMemo(() => {
    // تحليل المبيعات
    const dailyAnalytics = getSalesAnalytics('daily', salesToUse);
    const monthlyAnalytics = getSalesAnalytics('monthly', salesToUse);
    const yearlyAnalytics = getSalesAnalytics('yearly', salesToUse);

    // تحليل المخزون
    const inventoryReport = getInventoryReport(productsToUse);
    const inventoryProducts = inventoryReport.products || [];

    // تحليل العملاء من بيانات المبيعات
    // بناء قائمة العملاء من عمليات البيع
    const customerMap = {};
    salesToUse.forEach(sale => {
      if (sale.customerId) {
        if (!customerMap[sale.customerId]) {
          customerMap[sale.customerId] = {
            id: sale.customerId,
            name: sale.customerName || 'غير معروف',
            phone: sale.customerPhone || '',
            totalSpent: 0,
            purchaseCount: 0,
            lastPurchase: sale.date ? new Date(sale.date) : null
          };
        }
        customerMap[sale.customerId].totalSpent += sale.total || 0;
        customerMap[sale.customerId].purchaseCount += 1;
        if (sale.date && (!customerMap[sale.customerId].lastPurchase || new Date(sale.date) > customerMap[sale.customerId].lastPurchase)) {
          customerMap[sale.customerId].lastPurchase = new Date(sale.date);
        }
      }
    });
    const customerArray = Object.values(customerMap);

    // أفضل العملاء حسب إجمالي المشتريات
    const topCustomers = [...customerArray].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

    // العملاء النشطين هم من لديهم عمليات بيع في الفترة المحددة
    const salesPeriod = (() => {
      if (period === 'daily') return dailyAnalytics.salesData || [];
      if (period === 'monthly') return monthlyAnalytics.salesData || [];
      if (period === 'yearly') return yearlyAnalytics.salesData || [];
      return [];
    })();
    const activeCustomerIds = new Set();
    salesPeriod.forEach(sale => {
      if (sale.customerId) activeCustomerIds.add(sale.customerId);
    });
    const activeCustomersCount = customerArray.filter(c => activeCustomerIds.has(c.id)).length;

    return {
      sales: {
        daily: dailyAnalytics,
        monthly: monthlyAnalytics,
        yearly: yearlyAnalytics
      },
      inventory: {
        report: inventoryReport,
        products: inventoryProducts
      },
      customers: {
        customerStats: customerArray,
        totalCustomers: customerArray.length,
        activeCustomers: activeCustomersCount,
        topCustomers
      },
      products: (() => {
        // ...existing code...
        const productMap = {};
        salesToUse.forEach(sale => {
          sale.items?.forEach(item => {
            if (!productMap[item.productId]) {
              const product = productsToUse.find(p => p.id === item.productId) || {};
              productMap[item.productId] = {
                id: item.productId,
                name: product.name || 'غير معروف',
                category: product.category || 'غير معروف',
                price: product.price || 0,
                totalSold: 0,
                totalRevenue: 0,
                lastSold: sale.date ? new Date(sale.date) : null
              };
            }
            productMap[item.productId].totalSold += item.quantity || 0;
            productMap[item.productId].totalRevenue += (item.quantity || 0) * (item.price || 0);
            if (sale.date && (!productMap[item.productId].lastSold || new Date(sale.date) > productMap[item.productId].lastSold)) {
              productMap[item.productId].lastSold = new Date(sale.date);
            }
          });
        });
        const productArray = Object.values(productMap);
        return {
          topSellingByQuantity: [...productArray].sort((a, b) => b.totalSold - a.totalSold).slice(0, 5),
          topSellingByRevenue: [...productArray].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5),
          recentlySold: [...productArray].filter(p => p.lastSold).sort((a, b) => b.lastSold - a.lastSold).slice(0, 5),
          allProducts: productArray
        };
      })()
    };
  }, [productsToUse, salesToUse, getSalesAnalytics, getInventoryReport, period]);
  // ...تم نقل حساب العملاء النشطين داخل useMemo الرئيسي...

  const formatNumber = useCallback((num) => {
    return new Intl.NumberFormat('ar-EG').format(num || 0);
  }, []);

  const formatCurrency = useCallback((num) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'SDG' }).format(num || 0);
  }, []);

  const formatDate = useCallback((date) => {
    return date ? new Date(date).toLocaleDateString('ar-EG') : 'غير معروف';
  }, []);

  const exportToExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      let data = [];
      
      if (activeTab === 'sales') {
        const currentAnalytics = analyticsData.sales[period];
        data = currentAnalytics.salesData.map(sale => ({
          'رقم الفاتورة': sale.invoiceNumber || 'غير معروف',
          'التاريخ': formatDate(sale.date),
          'العميل': sale.customerName || 'غير معروف',
          'الكمية': sale.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
          'الإجمالي': sale.total || 0,
          'طريقة الدفع': sale.paymentMethod || 'نقدي'
        }));
      } else if (activeTab === 'inventory') {
        data = analyticsData.inventory.products.map(product => ({
          'اسم المنتج': product.name || 'غير معروف',
          'التصنيف': product.category || 'غير معروف',
          'السعر': formatCurrency(product.price),
          'المخزون': product.stock || 0,
          'القيمة': formatCurrency((product.price || 0) * (product.stock || 0)),
          'الحالة': product.stock <= 0 ? 'منتهي' : product.stock < 10 ? 'منخفض' : 'متوفر',
          'تاريخ آخر حركة': product.lastSold ? formatDate(product.lastSold) : 'غير معروف'
        }));
      } else if (activeTab === 'customers') {
        data = analyticsData.customers.customerStats.map(customer => ({
          'اسم العميل': customer.name,
          'الهاتف': customer.phone,
          'إجمالي المشتريات': formatCurrency(customer.totalSpent),
          'عدد الطلبات': customer.purchaseCount,
          'آخر شراء': formatDate(customer.lastPurchase)
        }));
      } else if (activeTab === 'products') {
        data = analyticsData.products.allProducts.map(product => ({
          'اسم المنتج': product.name,
          'التصنيف': product.category,
          'السعر': formatCurrency(product.price),
          'الكمية المباعة': product.totalSold,
          'إجمالي الإيرادات': formatCurrency(product.totalRevenue),
          'تاريخ آخر بيع': formatDate(product.lastSold)
        }));
      }
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "التقرير");
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `تقرير_${activeTab === 'sales' ? 'المبيعات' : activeTab === 'inventory' ? 'المخزون' : activeTab === 'customers' ? 'العملاء' : 'المنتجات'}.xlsx`);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  }, [activeTab, period, analyticsData, formatDate, formatCurrency]);

  // رسوم بيانية محسنة
  const chartData = useMemo(() => {
    const currentSales = analyticsData.sales[period];
    
    return {
      sales: {
        labels: ['يومي', 'شهري', 'سنوي'],
        datasets: [{
          label: 'إجمالي المبيعات',
          data: [
            analyticsData.sales.daily.totalSales,
            analyticsData.sales.monthly.totalSales,
            analyticsData.sales.yearly.totalSales
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
        }],
      },
      inventory: {
        labels: ['متوفر', 'منخفض', 'منتهي'],
        datasets: [{
          data: [
            analyticsData.inventory.report.inStock || 0,
            analyticsData.inventory.report.lowStock || 0,
            analyticsData.inventory.report.outOfStock || 0
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
        }],
      },
      products: {
        topSelling: {
          labels: analyticsData.products.topSellingByQuantity.map(p => p.name),
          datasets: [{
            label: 'الكمية المباعة',
            data: analyticsData.products.topSellingByQuantity.map(p => p.totalSold),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          }],
        },
        revenue: {
          labels: analyticsData.products.topSellingByRevenue.map(p => p.name),
          datasets: [{
            label: 'إجمالي الإيرادات',
            data: analyticsData.products.topSellingByRevenue.map(p => p.totalRevenue),
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
          }],
        }
      }
    };
  }, [analyticsData, period]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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
            if (activeTab === 'inventory') {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
            return `${label}: ${formatNumber(value)}`;
          }
        }
      }
    }
  };

  // حفظ نسخة من بيانات التحليلات من الإنترنت في IndexedDB
  useEffect(() => {
    if (navigator.onLine && products.length > 0 && sales.length > 0) {
      // حفظ نسخة من الإحصائيات (يمكنك تخصيص ما تريد حفظه)
      localDB.products.clear().then(() => {
        localDB.products.bulkAdd(products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          category: p.category,
          barcode: p.barcode
        })));
      });
      localDB.sales.clear().then(() => {
        localDB.sales.bulkAdd(sales.map(s => ({
          id: s.id,
          date: s.date,
          total: s.total,
          items: s.items
        })));
      });
    }
  }, [products, sales]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">التقارير والتحليلات</h1>
          <p className="text-sm text-gray-500">تحليل شامل لأداء المتجر والمبيعات</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiDownload />
            )}
            <span>{isExporting ? 'جاري التصدير...' : 'تصدير Excel'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
        <div className="flex space-x-1 flex-nowrap overflow-x-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-100">
          {[ 
            { id: 'sales', name: 'المبيعات', icon: FiTrendingUp },
            { id: 'inventory', name: 'المخزون', icon: FiPackage },
            { id: 'customers', name: 'العملاء', icon: FiShoppingCart },
            { id: 'products', name: 'المنتجات', icon: FiBarChart2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Period Selector for Sales */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">الفترة الزمنية:</span>
            <div className="flex bg-gray-200 rounded-lg overflow-hidden">
              {['daily', 'monthly', 'yearly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 text-sm transition-colors ${
                    period === p
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {p === 'daily' ? 'يومي' : p === 'monthly' ? 'شهري' : 'سنوي'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-blue-600" />
                نظرة عامة على المبيعات
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(analyticsData.sales[period].totalSales)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">عدد الطلبات</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(analyticsData.sales[period].salesCount)}
                  </p>
                </div>
              </div>
              
              <div className="h-64">
                <Bar data={chartData.sales} options={chartOptions} />
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">آخر المبيعات</h3>
              <div className="space-y-3">
                {analyticsData.sales[period].salesData.slice(0, 5).map((sale, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">فاتورة #{sale.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">{formatDate(sale.date)}</p>
                    </div>
                    <p className="font-bold text-green-600">{formatCurrency(sale.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiPackage className="text-purple-600" />
                حالة المخزون
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">متوفر</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analyticsData.inventory.report.inStock}
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-500">منخفض</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {analyticsData.inventory.report.lowStock}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-500">منتهي</p>
                  <p className="text-2xl font-bold text-red-600">
                    {analyticsData.inventory.report.outOfStock}
                  </p>
                </div>
              </div>
              
              <div className="h-64">
                <Pie data={chartData.inventory} options={chartOptions} />
              </div>
            </div>

            {/* Low Stock Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">المنتجات منخفضة المخزون</h3>
              <div className="space-y-3">
                {analyticsData.inventory.products
                  .filter(p => p.stock > 0 && p.stock <= 10)
                  .slice(0, 5)
                  .map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">{product.stock}</p>
                        <p className="text-sm text-gray-500">قطعة</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiShoppingCart className="text-blue-600" />
                نظرة عامة على العملاء
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">إجمالي العملاء</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analyticsData.customers.totalCustomers}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">عملاء نشطين</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analyticsData.customers.activeCustomers}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">أفضل العملاء</h3>
              <div className="space-y-3">
                {analyticsData.customers.topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-sm text-gray-500">{customer.purchaseCount} طلب</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">المنتجات الأكثر مبيعاً</h3>
              <div className="h-64">
                <Bar data={chartData.products.topSelling} options={chartOptions} />
              </div>
            </div>

            {/* Top Revenue Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">المنتجات الأعلى إيراداً</h3>
              <div className="h-64">
                <Bar data={chartData.products.revenue} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}