import { FiPrinter } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

export default function PrintSale({ sale, products }) {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        body { direction: rtl; font-family: Arial, sans-serif; }
        .print-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .print-title { text-align: center; font-size: 24px; margin-bottom: 20px; }
        .customer-info, .sale-info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        .summary { margin-top: 30px; }
      }
    `,
  });

  // حساب الإجماليات
  const subtotal = sale?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const taxAmount = subtotal * ((sale?.tax || 0) / 100);
  const total = subtotal - (sale?.discount || 0) + taxAmount;

  return (
    <div className="hidden">
      <div ref={printRef} className="p-6">
        {/* رأس الفاتورة */}
        <div className="print-header">
          <div>
            <h1 className="print-title">فاتورة بيع</h1>
            <p className="text-sm text-gray-500">تاريخ الفاتورة: {new Date(sale?.date).toLocaleDateString('ar-EG')}</p>
          </div>
          <div className="text-left">
            <p className="font-bold">رقم الفاتورة: #{sale?.invoiceNumber}</p>
            <p className="text-sm">الحالة: 
              <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                sale?.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {sale?.status === 'paid' ? 'مدفوعة' : 'قيد الانتظار'}
              </span>
            </p>
          </div>
        </div>

        {/* معلومات العميل */}
        <div className="customer-info">
          <h2 className="font-bold text-lg mb-2">معلومات العميل</h2>
          <div className="grid grid-cols-2 gap-4">
            <p><span className="font-medium">الاسم:</span> {sale?.customer?.name || 'بدون عميل'}</p>
            <p><span className="font-medium">الهاتف:</span> {sale?.customer?.phone || 'غير متوفر'}</p>
            <p><span className="font-medium">البريد الإلكتروني:</span> {sale?.customer?.email || 'غير متوفر'}</p>
            <p><span className="font-medium">طريقة الدفع:</span> 
              {sale?.paymentMethod === 'cash' ? ' نقدي' : 
               sale?.paymentMethod === 'credit' ? ' آجل' : ' غير محدد'}
            </p>
          </div>
        </div>

        {/* جدول المنتجات */}
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-right">#</th>
              <th className="p-2 text-right">المنتج</th>
              <th className="p-2 text-right">السعر</th>
              <th className="p-2 text-right">الكمية</th>
              <th className="p-2 text-right">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {sale?.items?.map((item, index) => {
              const product = products?.find(p => p.id === item.productId);
              return (
                <tr key={index}>
                  <td className="p-2 text-center">{index + 1}</td>
                  <td className="p-2">{product?.name || item.name || 'منتج غير معروف'}</td>
                  <td className="p-2">{item.price?.toLocaleString('ar-EG')} ج.س</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{(item.price * item.quantity)?.toLocaleString('ar-EG')} ج.س</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ملخص الفاتورة */}
        <div className="summary">
          <div className="flex justify-between mb-1">
            <span>إجمالي المنتجات:</span>
            <span>{subtotal.toLocaleString('ar-EG')} ج.س</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>الخصم:</span>
            <span className="text-red-600">- {(sale?.discount || 0).toLocaleString('ar-EG')} ج.س</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>الضريبة ({sale?.tax || 0}%):</span>
            <span className="text-green-600">+ {taxAmount.toLocaleString('ar-EG')} ج.س</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t">
            <span>الإجمالي النهائي:</span>
            <span>{total.toLocaleString('ar-EG')} ج.س</span>
          </div>
        </div>

        {/* تذييل الفاتورة */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>شكراً لتعاملكم معنا</p>
          <p>للاستفسارات: 0123456789</p>
        </div>
      </div>

      <button 
        onClick={handlePrint}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <FiPrinter size={24} />
      </button>
    </div>
  );
}