// components/SaleDetailsModal.js
import { 
  FiX, FiShoppingCart, FiDollarSign, FiFileText, 
  FiUser, FiPrinter, FiPhone, FiMapPin, FiCalendar, FiClock 
} from 'react-icons/fi';
import { useRef, forwardRef, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet"></link>
import ventasLogo from './assets/Untitled (10).png';
const PrintableInvoice = forwardRef(({ sale, products, storeData, user }, ref) => {
  const subtotal = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * ((sale.tax || 0) / 100);
  const total = subtotal - (sale.discount || 0) + taxAmount;

  return (
    <div ref={ref} className="p-8 print:p-0 font-tajawal" dir="rtl">
      {/* رأس الفاتورة للطباعة فقط */}
      <div className="hidden print:block text-center mb-6">
        <div className="border-b-2 border-gray-300 pb-4">
          {storeData?.logo && (
            <img 
              src={storeData.logo} 
              alt="شعار المتجر" 
              className="h-20 mx-auto mb-3"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-800">
            {storeData?.storeName || 'فاتورة تجارية'}
          </h1>
          <div className="text-gray-600 mt-2">
            <p>{storeData?.storeAddress || 'الخرطوم - السودان'}</p>
            <p>تلفون: {storeData?.storePhone || '٠٩١٢٣٤٥٦٧٨'}</p>
            {storeData?.taxId && <p>الرقم الضريبي: {storeData.taxId}</p>}
          </div>
        </div>

        {/* جدول معلومات الفاتورة */}
        <table className="w-full my-6">
          <tbody>
            <tr>
              <td className="p-2 border text-center">
                <strong>رقم الفاتورة:</strong> {sale.invoiceNumber?.toString().padStart(6, '٠')}
              </td>
              <td className="p-2 border text-center">
                <strong>التاريخ:</strong> {new Date(sale.date).toLocaleDateString('ar-SD')}
              </td>
            </tr>
            <tr>
              <td className="p-2 border text-center">
                <strong>العميل:</strong> {sale.customer?.name || 'عميل نقدي'}
              </td>
              <td className="p-2 border text-center">
                <strong>طريقة الدفع:</strong> {sale.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* جدول العناصر */}
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border-2 border-gray-300 text-center">#</th>
            <th className="p-3 border-2 border-gray-300 text-center">البيان</th>
            <th className="p-3 border-2 border-gray-300 text-center">السعر</th>
            <th className="p-3 border-2 border-gray-300 text-center">الكمية</th>
            <th className="p-3 border-2 border-gray-300 text-center">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, i) => (
            <tr key={i}>
              <td className="p-3 border text-center align-middle">{i + 1}</td>
              <td className="p-3 border text-center align-middle">
                {(products || []).find(p => p.id === item.productId)?.name || item.name}
              </td>
              <td className="p-3 border text-center align-middle">
                {item.price?.toLocaleString('ar-SD')} ج.س
              </td>
              <td className="p-3 border text-center align-middle">{item.quantity}</td>
              <td className="p-3 border text-center align-middle font-semibold">
                {(item.price * item.quantity)?.toLocaleString('ar-SD')} ج.س
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* جدول الحسابات النهائية */}
      <div className="print:flex print:justify-center">
        <table className="w-full print:w-auto border-collapse">
          <tbody>
            <tr>
              <td className="p-2 border text-center">
                <strong>المجموع الجزئي:</strong>
              </td>
              <td className="p-2 border text-center">
                {subtotal.toLocaleString('ar-SD')} ج.س
              </td>
            </tr>
            <tr>
              <td className="p-2 border text-center">
                <strong>الخصم:</strong>
              </td>
              <td className="p-2 border text-center text-red-600">
                -{(sale.discount || 0).toLocaleString('ar-SD')} ج.س
              </td>
            </tr>
            <tr>
              <td className="p-2 border text-center">
                <strong>الضريبة ({sale.tax || 0}%):</strong>
              </td>
              <td className="p-2 border text-center text-green-600">
                +{taxAmount.toLocaleString('ar-SD')} ج.س
              </td>
            </tr>
            <tr>
              <td className="p-2 border text-center font-bold">
                <strong>المبلغ المستحق:</strong>
              </td>
              <td className="p-2 border text-center font-bold text-blue-800">
                {total.toLocaleString('ar-SD')} ج.س
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* تذييل الفاتورة للطباعة فقط */}
      <div className="hidden print:block text-center mt-8 text-sm text-gray-600">
        <p>شكراً لتعاملك مع {storeData?.storeName || 'متجرنا'}</p>
        <p>هذه الفاتورة وثيقة رسمية صادرة إلكترونياً</p>
        <p>للاستفسارات: {storeData?.storePhone || '٠٩١٢٣٤٥٦٧٨'}</p>
      </div>
    </div>
  );
});

export default function SaleDetailsModal({ isOpen, onClose, sale, products, user }) {
  const printRef = useRef();
  const [storeData, setStoreData] = useState(null);


// الكود المعدل في useEffect:
useEffect(() => {
  const fetchStoreData = async () => {
    if (!isOpen || !sale?.userId) return;
    
    try {
      // الحصول على وثيقة المستخدم
      const userDocRef = doc(db, "users", sale.userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        // استخراج storeData من وثيقة المستخدم
        const userData = userDocSnap.data();
        setStoreData(userData.storeData || {}); // افتراض وجود حقل storeData
      } else {
        setStoreData({
          storeName: "متجر مونتي جو",
          storePhone: "0912345678",
          storeAddress: "الخرطوم، السودان"
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setStoreData({
        storeName: "متجر مونتي جو",
        storePhone: "0912345678",
        storeAddress: "الخرطوم، السودان"
      });
    }
  };

  fetchStoreData();
}, [isOpen, sale]);
const handlePrint = () => {
  try {
    // إنشاء نافذة طباعة جديدة
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('تعذر فتح نافذة الطباعة. يرجى تعطيل مانع النوافذ المنبثقة.');
    }

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>فاتورة ${sale?.invoiceNumber || ''}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: 'Tajawal', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              text-align: center;
              padding: 20px;
              direction: rtl;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: center;
            }
            .header {
              margin-bottom: 20px;
              border-bottom: 2px solid #eee;
              padding-bottom: 10px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #eee;
              font-size: 12px;
            }
            img.logo {
              max-height: 80px;
              margin: 0 auto;
            }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
        </head>
        <body>
          ${printRef.current.innerHTML}
          <script>
            // محاولة الطباعة تلقائياً
            setTimeout(() => {
              if (window.matchMedia) {
                const mediaQueryList = window.matchMedia('print');
                mediaQueryList.addListener((mql) => {
                  if (!mql.matches) {
                    window.close();
                  }
                });
              }
              window.print();
              
              // إغلاق النافذة بعد 5 ثوان إذا لم يتم الطباعة
              setTimeout(() => {
                window.close();
              }, 5000);
            }, 300);
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    // حلول بديلة للجوال
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const printFrame = printWindow.document.createElement('iframe');
      printFrame.style.display = 'none';
      printFrame.src = 'about:blank';
      printWindow.document.body.appendChild(printFrame);
      
      printFrame.contentWindow.document.open();
      printFrame.contentWindow.document.write(printContent);
      printFrame.contentWindow.document.close();
      
      setTimeout(() => {
        printFrame.contentWindow.print();
      }, 500);
    }

  } catch (error) {
    console.error('خطأ في الطباعة:', error);
    alert(`حدث خطأ أثناء الطباعة: ${error.message}\nيمكنك محاولة حفظ الصفحة كـ PDF بدلاً من ذلك.`);
    
    // حل بديل للجوال - عرض محتوى الفاتورة في نفس الصفحة للطباعة
    const printSection = document.createElement('div');
    printSection.innerHTML = printRef.current.innerHTML;
    printSection.style.position = 'fixed';
    printSection.style.top = '0';
    printSection.style.left = '0';
    printSection.style.width = '100%';
    printSection.style.height = '100%';
    printSection.style.backgroundColor = 'white';
    printSection.style.zIndex = '9999';
    printSection.style.overflow = 'auto';
    printSection.style.padding = '20px';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'إغلاق';
    closeButton.style.position = 'fixed';
    closeButton.style.top = '10px';
    closeButton.style.left = '10px';
    closeButton.style.padding = '10px';
    closeButton.style.backgroundColor = '#f44336';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.zIndex = '10000';
    closeButton.onclick = () => document.body.removeChild(printSection);
    
    printSection.appendChild(closeButton);
    document.body.appendChild(printSection);
    
    // محاولة الطباعة بعد عرض المحتوى
    setTimeout(() => {
      window.print();
    }, 500);
  }
};
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">تفاصيل الفاتورة</h3>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              title="طباعة الفاتورة"
            >
              <FiPrinter size={24} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          <PrintableInvoice 
            ref={printRef} 
            sale={sale} 
            products={products} 
            storeData={storeData}
            user={user}
          />
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            إغلاق
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPrinter size={18} /> طباعة
          </button>
        </div>
      </div>
    </div>
  );
}