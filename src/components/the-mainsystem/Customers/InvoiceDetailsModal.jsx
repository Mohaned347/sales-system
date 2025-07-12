import { FiX, FiShoppingCart, FiDollarSign, FiFileText, FiPercent, FiUser, FiPhone, FiMail } from 'react-icons/fi';

export default function InvoiceDetailsModal({ invoice, onClose }) {
  // حساب الإجماليات مسبقاً لتبسيط الكود
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * (invoice.tax / 100 || 0);
  const total = subtotal - (invoice.discount || 0) + taxAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-xl">
          <div>
            <h3 className="text-xl font-bold">تفاصيل الفاتورة</h3>
            <p className="text-sm text-blue-100">رقم الفاتورة: {invoice.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="text-blue-100 hover:text-white p-1">
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiUser /> معلومات العميل
              </h4>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="font-medium ml-2">الاسم:</span> 
                  {invoice.customer?.name}
                </p>
                <p className="flex items-center">
                  <FiPhone className="ml-2 text-gray-400" />
                  <span>{invoice.customer?.phone || 'غير متوفر'}</span>
                </p>
                <p className="flex items-center">
                  <FiMail className="ml-2 text-gray-400" />
                  <span>{invoice.customer?.email || 'غير متوفر'}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiFileText /> معلومات الفاتورة
              </h4>
              <div className="space-y-2">
                <p><span className="font-medium">رقم الفاتورة:</span> {invoice.invoiceNumber}</p>
                <p><span className="font-medium">التاريخ:</span> {invoice.date}</p>
                <p><span className="font-medium">الحالة:</span> 
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status === 'paid' ? 'مدفوعة' : 'قيد الانتظار'}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiDollarSign /> معلومات الدفع
              </h4>
              <div className="space-y-2">
                <p><span className="font-medium">طريقة الدفع:</span> 
                  {invoice.paymentMethod === 'cash' ? ' نقدي' : 
                   invoice.paymentMethod === 'credit' ? ' آجل' : ' تحويل بنكي'}
                </p>
                <p><span className="font-medium">الضريبة:</span> {invoice.tax || 0}%</p>
                <p><span className="font-medium">الخصم:</span> {invoice.discount?.toLocaleString() || 0} ج.س</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiShoppingCart /> عناصر الفاتورة
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">المنتج</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">السعر</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الكمية</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-center">{index + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.price.toLocaleString()} ج.س</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{(item.price * item.quantity).toLocaleString()} ج.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <FiFileText /> ملخص الفاتورة
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>إجمالي المنتجات:</span>
                <span className="font-medium">
                  {subtotal.toLocaleString()} ج.س
                </span>
              </div>
              <div className="flex justify-between">
                <span>الخصم:</span>
                <span className="font-medium text-red-600">
                  - {(invoice.discount || 0).toLocaleString()} ج.س
                </span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة ({invoice.tax || 0}%):</span>
                <span className="font-medium text-green-600">
                  + {taxAmount.toLocaleString()} ج.س
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>الإجمالي النهائي:</span>
                <span className="text-blue-600">
                  {total.toLocaleString()} ج.س
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t p-4 bg-gray-50 flex justify-between rounded-b-xl">
          <button
            onClick={() => {
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
                    ${document.querySelector('.modal-content').innerHTML}
                    <script>
                      window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 500);
                      };
                    </script>
                  </body>
                </html>
              `);
              printWindow.document.close();
            }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            طباعة الفاتورة
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}