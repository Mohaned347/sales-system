import { FiX, FiShoppingCart, FiCalendar, FiDollarSign, FiPackage } from 'react-icons/fi'

export default function SalesHistory({ customer, onClose }) {
  // بيانات افتراضية - في التطبيق الحقيقي ستأتي من قاعدة البيانات
  const salesHistory = [
    { id: 1, date: '2023-05-15', total: 450, items: 3, invoiceNo: 'INV-2023-001' },
    { id: 2, date: '2023-04-22', total: 1200, items: 5, invoiceNo: 'INV-2023-002' },
    { id: 3, date: '2023-03-10', total: 750, items: 2, invoiceNo: 'INV-2023-003' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-bold">
            <span>سجل المشتريات للعميل: </span>
            <span className="text-primary-600">{customer.name}</span>
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {salesHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا يوجد سجل مشتريات لهذا العميل
            </div>
          ) : (
            <div className="space-y-4">
              {salesHistory.map(sale => (
                <div key={sale.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <FiShoppingCart size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium">فاتورة #{sale.invoiceNo}</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FiCalendar className="ml-1" />
                          <span>{new Date(sale.date).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary-600">
                        {sale.total.toLocaleString()} ج.س
                      </div>
                      <div className="text-sm text-gray-500">
                        <FiPackage className="inline ml-1" />
                        {sale.items} منتج
                      </div>
                    </div>
                  </div>
                  <button className="mt-3 text-sm text-blue-600 hover:underline">
                    عرض تفاصيل الفاتورة
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <div>
            <span className="font-medium">إجمالي المشتريات: </span>
            <span className="text-primary-600 font-bold">
              {salesHistory.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()} ج.س
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}