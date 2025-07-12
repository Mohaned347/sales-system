import { useState, useMemo } from 'react';
import { FiTrendingUp, FiPackage, FiShoppingCart, FiCalendar, FiPieChart, FiBarChart2, FiDownload, FiStar, FiAward } from 'react-icons/fi';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useAppContext } from '../../backEnd/context/AppContext';
import { Link } from 'react-router-dom';

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
  
  // تحليل المبيعات
  const dailyAnalytics = getSalesAnalytics('daily');
  const monthlyAnalytics = getSalesAnalytics('monthly');
  const yearlyAnalytics = getSalesAnalytics('yearly');
  
  // تحليل المخزون
  const inventoryReport = getInventoryReport();
  const inventoryProducts = inventoryReport.products || [];
  
  // تحليل المنتجات الأكثر مبيعًا (جديد)
  const productAnalysis = useMemo(() => {
    const productMap = {};
    
    sales.forEach(sale => {
      sale.items?.forEach(item => {
        if (!productMap[item.productId]) {
          const product = products.find(p => p.id === item.productId) || {};
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
  }, [sales, products]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-EG').format(num || 0);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'SDG' }).format(num || 0);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('ar-EG') : 'غير معروف';
  };

  const exportToExcel = () => {
    let data = [];
    
    if (activeTab === 'sales') {
      data = (period === 'daily' ? dailyAnalytics.salesData : 
              period === 'monthly' ? monthlyAnalytics.salesData : 
              yearlyAnalytics.salesData).map(sale => ({
        'رقم الفاتورة': sale.invoiceNumber || 'غير معروف',
        'التاريخ': formatDate(sale.date),
        'العميل': sale.customerName || 'غير معروف',
        'الكمية': sale.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
        'الإجمالي': sale.total || 0,
        'طريقة الدفع': sale.paymentMethod || 'نقدي'
      }));
    } else if (activeTab === 'inventory') {
      data = inventoryProducts.map(product => ({
        'اسم المنتج': product.name || 'غير معروف',
        'التصنيف': product.category || 'غير معروف',
        'السعر': formatCurrency(product.price),
        'المخزون': product.stock || 0,
        'القيمة': formatCurrency((product.price || 0) * (product.stock || 0)),
        'الحالة': product.stock <= 0 ? 'منتهي' : product.stock < 10 ? 'منخفض' : 'متوفر',
        'تاريخ آخر حركة': product.lastSold ? formatDate(product.lastSold) : 'غير معروف'
      }));
    } else if (activeTab === 'products') {
      data = productAnalysis.allProducts.map(product => ({
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
    saveAs(blob, `تقرير_${activeTab === 'sales' ? 'المبيعات' : activeTab === 'inventory' ? 'المخزون' : 'المنتجات'}.xlsx`);
  };

  // رسوم بيانية للمبيعات
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

  // رسوم بيانية للمخزون
  const inventoryPieData = {
    labels: ['متوفر', 'منخفض', 'منتهي'],
    datasets: [
      {
        data: [
          inventoryReport.inStock || 0,
          inventoryReport.lowStock || 0,
          inventoryReport.outOfStock || 0
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

  // رسوم بيانية للمنتجات (جديد)
  const topProductsChartData = {
    labels: productAnalysis.topSellingByQuantity.map(p => p.name),
    datasets: [
      {
        label: 'الكمية المباعة',
        data: productAnalysis.topSellingByQuantity.map(p => p.totalSold),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const revenueProductsChartData = {
    labels: productAnalysis.topSellingByRevenue.map(p => p.name),
    datasets: [
      {
        label: 'إجمالي الإيرادات',
        data: productAnalysis.topSellingByRevenue.map(p => p.totalRevenue),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const monthlySalesData = {
    labels: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(i);
      return date.toLocaleString('ar-EG', { month: 'long' });
    }),
    datasets: [
      {
        label: 'المبيعات الشهرية',
        data: Array.from({ length: 12 }, (_, i) => {
          const monthSales = sales.filter(s => {
            const saleDate = s.date ? new Date(s.date) : null;
            return saleDate && saleDate.getMonth() === i && saleDate.getFullYear() === new Date().getFullYear();
          });
          return monthSales.reduce((sum, s) => sum + (s.total || 0), 0);
        }),
        borderColor: 'rgba(234, 179, 8, 1)',
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const renderInventoryProducts = () => {
    if (!inventoryProducts || inventoryProducts.length === 0) {
      return (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-center">لا توجد منتجات في المخزون</p>
        </div>
      );
    }

    return (
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <h3 className="p-4 font-medium border-b">تفاصيل المخزون</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المنتج</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المخزون</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">القيمة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">آخر حركة</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryProducts.map((product) => (
                <tr key={product.id || product.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{product.name || 'غير معروف'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{product.category || 'غير معروف'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{product.stock || 0}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-yellow-600">
                    {formatCurrency((product.price || 0) * (product.stock || 0))}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {product.stock <= 0 ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">منتهي</span>
                    ) : product.stock < 10 ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">منخفض</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">متوفر</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {product.lastSold ? formatDate(product.lastSold) : 'لا يوجد'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProductAnalysis = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500">إجمالي المنتجات</p>
            <h3 className="text-2xl font-bold">{formatNumber(products.length)}</h3>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500">المنتجات المباعة</p>
            <h3 className="text-2xl font-bold">{formatNumber(productAnalysis.allProducts.length)}</h3>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500">إجمالي الإيرادات</p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(productAnalysis.allProducts.reduce((sum, p) => sum + p.totalRevenue, 0))}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <FiAward className="text-yellow-600" />
              أفضل 5 منتجات من حيث الكمية المباعة
            </h3>
            <div className="h-80">
              <Bar 
                data={topProductsChartData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                  },
                }} 
              />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <FiStar className="text-yellow-600" />
              أفضل 5 منتجات من حيث الإيرادات
            </h3>
            <div className="h-80">
              <Bar 
                data={revenueProductsChartData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                  },
                }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="p-4 font-medium border-b">تفاصيل أداء المنتجات</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الترتيب</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المنتج</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية المباعة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي الإيرادات</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">آخر بيع</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productAnalysis.allProducts
                  .sort((a, b) => b.totalRevenue - a.totalRevenue)
                  .map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{index + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{product.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{product.category}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{formatNumber(product.totalSold)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-600">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {product.lastSold ? formatDate(product.lastSold) : 'لا يوجد'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiBarChart2 className="text-yellow-600" />
          التحليلات والتقارير المتكاملة
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={exportToExcel}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            title="تصدير إلى إكسل"
          >
            <FiDownload size={20} />
          </button>
          <Link 
            to="/" 
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <FiCalendar size={20} />
          </Link>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'sales' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('sales')}
        >
          <FiTrendingUp className="inline mr-2" />
          تحليل المبيعات
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'inventory' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('inventory')}
        >
          <FiPackage className="inline mr-2" />
          تقرير المخزون
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'products' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('products')}
        >
          <FiShoppingCart className="inline mr-2" />
          أداء المنتجات
        </button>
      </div>

      {activeTab === 'sales' ? (
        <div>
          <div className="flex gap-2 mb-6">
            {['daily', 'monthly', 'yearly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg ${
                  period === p
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {p === 'daily' && 'يومي'}
                {p === 'monthly' && 'شهري'}
                {p === 'yearly' && 'سنوي'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500">إجمالي المبيعات</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(
                  period === 'daily' 
                    ? dailyAnalytics.totalSales 
                    : period === 'monthly' 
                      ? monthlyAnalytics.totalSales 
                      : yearlyAnalytics.totalSales
                )}
              </h3>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500">عدد الفواتير</p>
              <h3 className="text-2xl font-bold">
                {formatNumber(
                  period === 'daily' 
                    ? dailyAnalytics.salesCount 
                    : period === 'monthly' 
                      ? monthlyAnalytics.salesCount 
                      : yearlyAnalytics.salesCount
                )}
              </h3>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500">متوسط الفاتورة</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(
                  period === 'daily' 
                    ? dailyAnalytics.avgSale 
                    : period === 'monthly' 
                      ? monthlyAnalytics.avgSale 
                      : yearlyAnalytics.avgSale
                )}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-4">مقارنة المبيعات</h3>
              <div className="h-80">
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
                  }} 
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-4">المبيعات الشهرية للسنة الحالية</h3>
              <div className="h-80">
                <Line 
                  data={monthlySalesData} 
                  options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                    },
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'inventory' ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500">إجمالي قيمة المخزون</p>
              <h3 className="text-2xl font-bold">{formatCurrency(inventoryReport.totalStockValue)}</h3>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500">منخفض المخزون</p>
              <h3 className="text-2xl font-bold text-yellow-600">{inventoryReport.lowStock || 0}</h3>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500">منتهي المخزون</p>
              <h3 className="text-2xl font-bold text-red-600">{inventoryReport.outOfStock || 0}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-4">حالة المخزون</h3>
              <div className="h-80">
                <Pie 
                  data={inventoryPieData} 
                  options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        rtl: true,
                      },
                    },
                  }} 
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
  <h3 className="font-medium mb-4">توزيع المخزون حسب التصنيف</h3>
  <div className="h-80">
    <Doughnut 
      data={{
        labels: [...new Set(inventoryProducts.map(p => p.category || 'غير معروف'))],
        datasets: [{
          label: 'الكمية في المخزون',
          data: [...new Set(inventoryProducts.map(p => p.category || 'غير معروف'))]
            .map(cat => inventoryProducts
              .filter(p => (p.category || 'غير معروف') === cat)
              .reduce((sum, p) => sum + (p.stock || 0), 0)
            ),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(234, 179, 8, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ]
        }]
      }}
      options={{ 
        responsive: true,
        maintainAspectRatio: false,
      }} 
    />
  </div>
</div>
          </div>

          {renderInventoryProducts()}
        </div>
      ) : (
        renderProductAnalysis()
      )}
    </div>
  );
}