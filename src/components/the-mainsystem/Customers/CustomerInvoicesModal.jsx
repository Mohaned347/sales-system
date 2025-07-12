import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../backEnd/firebase';
import { FiX, FiFileText, FiDollarSign, FiCalendar, FiChevronLeft, FiChevronRight, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../backEnd/context/AppContext';
import InvoiceDetailsModal from './InvoiceDetailsModal';

export default function CustomerInvoicesModal({ customer, onClose }) {
  const { user } = useAppContext();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const invoicesPerPage = 5;

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user?.uid || !customer?.id) return;
      
      try {
        const invoicesCol = collection(db, 'users', user.uid, 'customers', customer.id, 'invoices');
        const querySnapshot = await getDocs(invoicesCol);
        
        const invoicesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate()?.toLocaleDateString('ar-EG') || 'غير معروف',
          customer: customer // إضافة معلومات العميل للفاتورة
        }));
        
        setInvoices(invoicesList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoices: ', error);
        toast.error('حدث خطأ في جلب الفواتير');
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user?.uid, customer?.id]);

  // حساب الفواتير للصفحة الحالية
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = invoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(invoices.length / invoicesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center border-b p-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-xl">
            <div>
              <h3 className="text-xl font-bold">فواتير العميل</h3>
              <p className="text-sm text-blue-100">{customer.name}</p>
            </div>
            <button onClick={onClose} className="text-blue-100 hover:text-white p-1">
              <FiX size={24} />
            </button>
          </div>
          
          <div className="p-5 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                <FiFileText className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">لا توجد فواتير</h3>
                <p className="text-gray-500">لم يتم العثور على فواتير لهذا العميل</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">رقم الفاتورة</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">التاريخ</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">المبلغ</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الحالة</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber || 'غير معروف'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FiCalendar className="ml-1 text-gray-400" />
                              {invoice.date}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FiDollarSign className="ml-1 text-gray-400" />
                              {invoice.total?.toLocaleString() || 0} ج.س
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status === 'paid' ? 'مدفوعة' : 'قيد الانتظار'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(invoice)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                              title="عرض التفاصيل"
                            >
                              <FiEye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6">
                    <button
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
                    >
                      <FiChevronRight size={20} />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`mx-1 w-10 h-10 rounded-md flex items-center justify-center ${
                          currentPage === number 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
                    >
                      <FiChevronLeft size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="border-t p-4 bg-gray-50 flex justify-end rounded-b-xl">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {isDetailsOpen && selectedInvoice && (
        <InvoiceDetailsModal 
          invoice={selectedInvoice} 
          onClose={() => setIsDetailsOpen(false)} 
        />
      )}
    </>
  );
}