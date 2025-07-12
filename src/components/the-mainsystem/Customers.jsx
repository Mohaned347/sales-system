import { useState, useEffect } from 'react';
import { 
  collection, getDocs, doc, updateDoc, 
  deleteDoc, addDoc, query, where 
} from 'firebase/firestore';
import { db } from '../../backEnd/firebase';
import { 
  FiUser, FiPhone, FiMail, FiEdit2, 
  FiTrash2, FiPlus, FiCalendar, FiSearch, 
  FiDollarSign, FiGrid, FiList, FiShoppingCart,
  FiFileText, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import CustomerModal from './Customers/CustomerModal';
import NewInvoiceModal from './Customers/NewInvoiceModal';
import CustomerInvoicesModal from './Customers/CustomerInvoicesModal';
import { useAppContext } from '../../backEnd/context/AppContext';

export default function Customers() {
  const { user } = useAppContext();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);
  const [view, setView] = useState('cards');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user?.uid) return;
      
      try {
        const customersCol = collection(db, 'users', user.uid, 'customers');
        const querySnapshot = await getDocs(customersCol);
        
        const customersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          totalSpent: doc.data().totalSpent || 0,
          purchaseCount: doc.data().purchaseCount || 0,
          lastPurchase: doc.data().lastPurchase?.toDate()?.toLocaleDateString('ar-EG') || 'لا يوجد'
        }));
        
        setCustomers(customersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customers: ', error);
        toast.error('حدث خطأ في جلب بيانات العملاء');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [user?.uid]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         customer.phone?.includes(searchTerm) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'frequent') return matchesSearch && (customer.purchaseCount || 0) >= 3;
    if (activeTab === 'inactive') return matchesSearch && (customer.purchaseCount || 0) === 0;
    return matchesSearch;
  });

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'customers', id));
        setCustomers(customers.filter(customer => customer.id !== id));
        toast.success('تم حذف العميل بنجاح');
      } catch (error) {
        console.error('Error deleting customer: ', error);
        toast.error('حدث خطأ أثناء حذف العميل');
      }
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleNewInvoice = (customer) => {
    setSelectedCustomer(customer);
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoices = (customer) => {
    setSelectedCustomer(customer);
    setIsInvoicesModalOpen(true);
  };

  const handleSave = async (customerData) => {
    try {
      if (selectedCustomer) {
        await updateDoc(
          doc(db, 'users', user.uid, 'customers', selectedCustomer.id), 
          customerData
        );
        setCustomers(customers.map(c => 
          c.id === selectedCustomer.id ? { ...c, ...customerData } : c
        ));
        toast.success('تم تحديث بيانات العميل بنجاح');
      } else {
        const docRef = await addDoc(
          collection(db, 'users', user.uid, 'customers'), 
          customerData
        );
        setCustomers([...customers, { 
          id: docRef.id, 
          ...customerData,
          totalSpent: 0,
          purchaseCount: 0,
          lastPurchase: 'لا يوجد'
        }]);
        toast.success('تم إضافة العميل بنجاح');
      }
      
      setIsCustomerModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error saving customer: ', error);
      toast.error('حدث خطأ أثناء حفظ بيانات العميل');
    }
  };

  // إحصائيات العملاء
  const totalCustomers = filteredCustomers.length;
  const totalPurchases = filteredCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const frequentCustomers = customers.filter(c => (c.purchaseCount || 0) >= 3).length;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">إدارة العملاء</h1>
          <p className="text-xs md:text-sm text-gray-500">إدارة قاعدة بيانات العملاء وإنشاء الفواتير</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => { setSelectedCustomer(null); setIsCustomerModalOpen(true) }}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-lg transition-all hover:from-blue-700 hover:to-blue-600 text-sm md:text-base"
          >
            <FiPlus className="text-sm md:text-lg" />
            <span>إضافة عميل</span>
          </button>
          
          <div className="flex bg-gray-200 rounded-lg overflow-hidden shadow-inner">
            <button 
              onClick={() => setView('cards')} 
              className={`flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 ${view === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'} text-xs md:text-sm`}
            >
              <FiGrid size={14} />
              <span>بطاقات</span>
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'} text-xs md:text-sm`}
            >
              <FiList size={14} />
              <span>قائمة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md p-3 md:p-5 mb-4 md:mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 mb-3 md:mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <FiSearch size={16} />
            </div>
            <input
              type="text"
              placeholder="ابحث عن عميل بالاسم أو الهاتف أو البريد..."
              className="w-full pr-9 pl-3 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-xs md:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-gray-200 rounded-lg overflow-hidden shadow-inner">
            <button 
              onClick={() => setActiveTab('all')} 
              className={`flex-1 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'}`}
            >
              الكل
            </button>
            <button 
              onClick={() => setActiveTab('frequent')} 
              className={`flex-1 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm ${activeTab === 'frequent' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'}`}
            >
              دائمي الشراء
            </button>
            <button 
              onClick={() => setActiveTab('inactive')} 
              className={`flex-1 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm ${activeTab === 'inactive' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'}`}
            >
              غير نشطين
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-between items-center gap-2 md:gap-4">
          <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-xs md:text-sm">
            <span className="text-gray-700">إجمالي العملاء: </span>
            <span className="font-bold text-blue-600">{totalCustomers}</span>
          </div>
          <div className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 text-xs md:text-sm">
            <span className="text-gray-700">إجمالي المشتريات: </span>
            <span className="font-bold text-green-600">
              {totalPurchases.toLocaleString()} ج.س
            </span>
          </div>
          <div className="bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 text-xs md:text-sm">
            <span className="text-gray-700">عملاء دائمي الشراء: </span>
            <span className="font-bold text-purple-600">{frequentCustomers}</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCustomers.length === 0 && (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md p-4 md:p-8 text-center border border-gray-200">
          <div className="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-3 md:mb-4 border border-gray-300">
            <FiUser className="text-gray-400 text-2xl md:text-3xl" />
          </div>
          <h3 className="text-base md:text-lg font-medium text-gray-700 mb-1 md:mb-2">لا يوجد عملاء</h3>
          <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">لم يتم العثور على عملاء متطابقين مع معايير البحث</p>
          <button 
            onClick={() => { setSearchTerm(''); setActiveTab('all') }}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm md:shadow-md text-xs md:text-sm"
          >
            عرض جميع العملاء
          </button>
        </div>
      )}

     {/* Cards View */}
{!loading && filteredCustomers.length > 0 && view === 'cards' && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    {filteredCustomers.map((customer) => (
      <div key={customer.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col min-h-[380px]">
        {/* Customer Header - Larger */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl truncate" title={customer.name}>
              {customer.name}
            </h3>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full whitespace-nowrap">
              {customer.purchaseCount || 0} عملية
            </span>
          </div>
          <p className="text-md text-blue-100 truncate mt-1" title={customer.company || 'لا يوجد'}>
            {customer.company || 'لا يوجد'}
          </p>
        </div>
        
        {/* Customer Details - Larger */}
        <div className="p-5 flex-grow">
          <div className="flex items-start mb-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold shadow-inner border-2 border-blue-200 flex-shrink-0">
              {customer.name?.charAt(0) || '?'}
            </div>
            <div className="mr-4 flex-grow min-w-0">
              <div className="flex items-center text-gray-700 text-md mb-3">
                <FiPhone className="ml-2 text-gray-500 flex-shrink-0 text-lg" />
                <span className="truncate" title={customer.phone || 'لا يوجد'}>
                  {customer.phone || 'لا يوجد'}
                </span>
              </div>
              <div className="flex items-center text-gray-700 text-md">
                <FiMail className="ml-2 text-gray-500 flex-shrink-0 text-lg" />
                <span className="truncate" title={customer.email || 'لا يوجد'}>
                  {customer.email || 'لا يوجد'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Stats - Larger */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">إجمالي المشتريات</p>
              <p className="font-bold text-blue-600 text-lg">
                {(customer.totalSpent || 0).toLocaleString()} ج.س
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <p className="text-sm text-gray-600 mb-1">آخر عملية</p>
              <p className="font-bold text-green-600 text-lg">
                {customer.lastPurchase || 'لا يوجد'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions - Larger */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-4 gap-2">
            <button 
              onClick={() => handleEdit(customer)}
              className="flex flex-col items-center justify-center gap-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm border border-blue-100"
              title="تعديل"
            >
              <FiEdit2 size={18} />
              <span>تعديل</span>
            </button>
            <button 
              onClick={() => handleNewInvoice(customer)}
              className="flex flex-col items-center justify-center gap-1 p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm border border-green-100"
              title="فاتورة جديدة"
            >
              <FiShoppingCart size={18} />
              <span>فاتورة</span>
            </button>
            <button 
              onClick={() => handleViewInvoices(customer)}
              className="flex flex-col items-center justify-center gap-1 p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm border border-purple-100"
              title="عرض الفواتير"
            >
              <FiFileText size={18} />
              <span>الفواتير</span>
            </button>
            <button 
              onClick={() => handleDelete(customer.id)}
              className="flex flex-col items-center justify-center gap-1 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm border border-red-100"
              title="حذف العميل"
            >
              <FiTrash2 size={18} />
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

      {/* Table View */}
      {!loading && filteredCustomers.length > 0 && view === 'list' && (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 md:px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">العميل</th>
                  <th className="px-3 md:px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">التواصل</th>
                  <th className="px-3 md:px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">المشتريات</th>
                  <th className="px-3 md:px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">آخر عملية</th>
                  <th className="px-3 md:px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                          {customer.name?.charAt(0) || '?'}
                        </div>
                        <div className="mr-2 md:mr-3">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs md:text-sm text-gray-500">{customer.company || 'لا يوجد'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone || 'لا يوجد'}</div>
                      <div className="text-xs md:text-sm text-gray-500">{customer.email || 'لا يوجد'}</div>
                    </td>
                    <td className="px-3 md:px-4 py-2 whitespace-nowrap">
                      <div className="text-sm">
                        <span className="font-bold text-blue-600">{customer.purchaseCount || 0}</span> عملية
                      </div>
                      <div className="text-xs md:text-sm text-gray-500">
                        {(customer.totalSpent || 0).toLocaleString()} ج.س
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 whitespace-nowrap">
                      <div className="text-xs md:text-sm text-gray-500 flex items-center">
                        <FiCalendar className="ml-1 text-gray-400" />
                        {customer.lastPurchase || 'لا يوجد'}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 md:gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md border border-blue-100 text-xs md:text-sm"
                        >
                          <FiEdit2 size={12} className="md:size-[14px]" />
                          تعديل
                        </button>
                        <button
                          onClick={() => handleNewInvoice(customer)}
                          className="text-green-600 hover:text-green-800 flex items-center gap-1 px-2 py-1 bg-green-50 rounded-md border border-green-100 text-xs md:text-sm"
                        >
                          <FiShoppingCart size={12} className="md:size-[14px]" />
                          فاتورة
                        </button>
                        <button
                          onClick={() => handleViewInvoices(customer)}
                          className="text-purple-600 hover:text-purple-800 flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-md border border-purple-100 text-xs md:text-sm"
                        >
                          <FiFileText size={12} className="md:size-[14px]" />
                          الفواتير
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setIsCustomerModalOpen(false);
            setSelectedCustomer(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* New Invoice Modal */}
      {isInvoiceModalOpen && selectedCustomer && (
        <NewInvoiceModal
          customer={selectedCustomer}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* Customer Invoices Modal */}
      {isInvoicesModalOpen && selectedCustomer && (
        <CustomerInvoicesModal
          customer={selectedCustomer}
          onClose={() => {
            setIsInvoicesModalOpen(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}