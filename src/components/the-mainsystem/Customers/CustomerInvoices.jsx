import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FiSearch, FiTrash2, FiPrinter, FiFileText, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAppContext } from '../../context/app-context';
import InvoiceDetailsModal from './InvoiceDetailsModal';

export default function CustomerInvoices({ customerId }) {
  const { user, invoices, fetchUserData } = useAppContext();
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!customerId || !user?.uid) return;
      
      try {
        const querySnapshot = await getDocs(
          collection(db, 'users', user.uid, 'customers', customerId, 'invoices')
        );
        const invoicesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate()?.toLocaleDateString('ar-EG') || 'غير محدد'
        }));
        setFilteredInvoices(invoicesList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoices: ', error);
        toast.error('حدث خطأ في جلب الفواتير');
      }
    };

    fetchInvoices();
  }, [customerId, user?.uid, invoices]);

  const applyFilters = () => {
    let result = invoices.filter(invoice => 
      invoice.customer?.id === customerId &&
      (invoice.invoiceNumber?.includes(searchTerm) || 
       invoice.total?.toString().includes(searchTerm) ||
       invoice.date?.includes(searchTerm))
    );

    if (filters.status !== 'all') {
      result = result.filter(invoice => invoice.status === filters.status);
    }

    if (filters.dateFrom) {
      result = result.filter(invoice => 
        new Date(invoice.date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      result = result.filter(invoice => 
        new Date(invoice.date) <= new Date(filters.dateTo)
      );
    }

    if (filters.minAmount) {
      result = result.filter(invoice => 
        invoice.total >= Number(filters.minAmount)
      );
    }

    if (filters.maxAmount) {
      result = result.filter(invoice => 
        invoice.total <= Number(filters.maxAmount)
      );
    }

    setFilteredInvoices(result);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, invoices]);

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'invoices', id));
        await deleteDoc(doc(db, 'users', user.uid, 'customers', customerId, 'invoices', id));
        fetchUserData();
        toast.success('تم حذف الفاتورة بنجاح');
      } catch (error) {
        console.error('Error deleting invoice: ', error);
        toast.error('حدث خطأ أثناء حذف الفاتورة');
      }
    }
  };

  const printInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>فاتورة ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            .total { font-weight: bold; text-align: left; margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>فاتورة بيع</h1>
            <h2>رقم: ${invoice.invoiceNumber}</h2>
          </div>
          <div class="info">
            <div>
              <p><strong>التاريخ:</strong> ${invoice.date}</p>
              <p><strong>العميل:</strong> ${invoice.customer?.name}</p>
            </div>
            <div>
              <p><strong>الهاتف:</strong> ${invoice.customer?.phone || 'غير متوفر'}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>المنتج</th>
                <th>السعر</th>
                <th>الكمية</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.price.toLocaleString()} ج.س</td>
                  <td>${item.quantity}</td>
                  <td>${(item.price * item.quantity).toLocaleString()} ج.س</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p><strong>المجموع:</strong> ${invoice.subtotal?.toLocaleString() || invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} ج.س</p>
            <p><strong>الخصم:</strong> ${invoice.discount?.toLocaleString() || 0} ج.س</p>
            <p><strong>الضريبة:</strong> ${invoice.tax || 0}%</p>
            <p><strong>الإجمالي النهائي:</strong> ${invoice.total.toLocaleString()} ج.س</p>
          </div>
          <div class="footer">
            <p>شكراً لتعاملكم معنا</p>
            <p>للاستفسار: 0123456789</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportToExcel = () => {
    const csvContent = [
      ['رقم الفاتورة', 'التاريخ', 'العميل', 'المبلغ', 'الحالة'],
      ...filteredInvoices.map(inv => [
        inv.invoiceNumber,
        inv.date,
        inv.customer?.name,
        inv.total,
        inv.status === 'paid' ? 'مدفوعة' : 'قيد الانتظار'
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob(["\uFEFF"+csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `فواتير_${new Date().toLocaleDateString('ar-EG')}.csv`);
    link.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">الفواتير السابقة</h2>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <FiSearch />
            </div>
            <input
              type="text"
              placeholder="ابحث في الفواتير..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiDownload size={18} />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* فلترة متقدمة */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">حالة الفاتورة</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">الكل</option>
              <option value="paid">مدفوعة</option>
              <option value="pending">قيد الانتظار</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">أقل مبلغ</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="أقل مبلغ"
                value={filters.minAmount}
                onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">أعلى مبلغ</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="أعلى مبلغ"
                value={filters.maxAmount}
                onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <FiFileText className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">لا توجد فواتير</h3>
          <p className="text-gray-500">لم يتم العثور على فواتير متطابقة مع معايير البحث</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">رقم الفاتورة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.customer?.name || 'غير معروف'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.total?.toLocaleString()} ج.س
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status === 'paid' ? 'مدفوعة' : 'قيد الانتظار'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedInvoice(invoice); setIsDetailsOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-md border border-blue-100"
                      >
                        <FiFileText size={14} />
                        تفاصيل
                      </button>
                      <button
                        onClick={() => printInvoice(invoice)}
                        className="text-gray-600 hover:text-gray-800 flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-md border border-gray-100"
                      >
                        <FiPrinter size={14} />
                        طباعة
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 px-3 py-1 bg-red-50 rounded-md border border-red-100"
                      >
                        <FiTrash2 size={14} />
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isDetailsOpen && selectedInvoice && (
        <InvoiceDetailsModal 
          invoice={selectedInvoice}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </div>
  );
}