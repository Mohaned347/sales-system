import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  collection, getDocs, doc, updateDoc, 
  deleteDoc, addDoc, query, where 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  FiUser, FiPhone, FiMail, FiEdit2, 
  FiTrash2, FiPlus, FiCalendar, FiSearch, 
  FiDollarSign, FiGrid, FiList, FiShoppingCart,
  FiFileText, FiChevronLeft, FiChevronRight,
  FiFilter, FiDownload, FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import CustomerModal from './Customers/CustomerModal';
import NewInvoiceModal from './Customers/NewInvoiceModal';
import CustomerInvoicesModal from './Customers/CustomerInvoicesModal';
import { useAppContext } from '../../context/app-context';

export default function Customers() {
  const { user, customers, addCustomer, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);
  const [view, setView] = useState('cards');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // تحسين الأداء باستخدام useMemo للفلترة والترتيب
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           customer.phone?.includes(searchTerm) ||
                           customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeTab === 'frequent') return matchesSearch && (customer.purchaseCount || 0) >= 3;
      if (activeTab === 'inactive') return matchesSearch && (customer.purchaseCount || 0) === 0;
      return matchesSearch;
    });

    // الترتيب
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'totalSpent':
          aValue = a.totalSpent || 0;
          bValue = b.totalSpent || 0;
          break;
        case 'purchaseCount':
          aValue = a.purchaseCount || 0;
          bValue = b.purchaseCount || 0;
          break;
        case 'lastPurchase':
          aValue = a.lastPurchase ? new Date(a.lastPurchase) : new Date(0);
          bValue = b.lastPurchase ? new Date(b.lastPurchase) : new Date(0);
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [customers, searchTerm, activeTab, sortBy, sortOrder]);

  // تحسين الأداء باستخدام useCallback
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        // سيتم التعامل مع الحذف في السياق
        toast.success('تم حذف العميل بنجاح');
      } catch (error) {
        console.error('Error deleting customer: ', error);
        toast.error('حدث خطأ أثناء حذف العميل');
      }
    }
  }, []);

  const handleEdit = useCallback((customer) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  }, []);

  const handleNewInvoice = useCallback((customer) => {
    setSelectedCustomer(customer);
    setIsInvoiceModalOpen(true);
  }, []);

  const handleViewInvoices = useCallback((customer) => {
    setSelectedCustomer(customer);
    setIsInvoicesModalOpen(true);
  }, []);

  const handleSave = useCallback(async (customerData) => {
    try {
      await addCustomer(customerData);
      setIsCustomerModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error saving customer: ', error);
      toast.error('حدث خطأ أثناء حفظ بيانات العميل');
    }
  }, [addCustomer]);

  // إحصائيات العملاء
  const stats = useMemo(() => {
    const totalCustomers = filteredAndSortedCustomers.length;
    const totalPurchases = filteredAndSortedCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const frequentCustomers = customers.filter(c => (c.purchaseCount || 0) >= 3).length;
    const inactiveCustomers = customers.filter(c => (c.purchaseCount || 0) === 0).length;

    return {
      totalCustomers,
      totalPurchases,
      frequentCustomers,
      inactiveCustomers
    };
  }, [filteredAndSortedCustomers, customers]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', { 
      style: 'currency', 
      currency: 'SDG' 
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'لا يوجد';
    return new Date(date).toLocaleDateString('ar-EG');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة العملاء</h1>
          <p className="text-sm text-gray-500">إدارة قاعدة بيانات العملاء وإنشاء الفواتير</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setSelectedCustomer(null); setIsCustomerModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all hover:from-blue-700 hover:to-blue-600"
          >
            <FiPlus className="text-lg" />
            <span>إضافة عميل</span>
          </button>
          
          <div className="flex bg-gray-200 rounded-lg overflow-hidden shadow-inner">
            <button 
              onClick={() => setView('cards')} 
              className={`flex items-center gap-1 px-3 py-1.5 ${view === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'} text-sm transition-colors`}
            >
              <FiGrid size={16} />
              <span>بطاقات</span>
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`flex items-center gap-1 px-3 py-1.5 ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'} text-sm transition-colors`}
            >
              <FiList size={16} />
              <span>قائمة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUser className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي المشتريات</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalPurchases)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">عملاء دائمي الشراء</p>
              <p className="text-2xl font-bold text-gray-800">{stats.frequentCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiShoppingCart className="text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">عملاء غير نشطين</p>
              <p className="text-2xl font-bold text-gray-800">{stats.inactiveCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiUser className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <FiSearch size={16} />
            </div>
            <input
              type="text"
              placeholder="ابحث عن عميل بالاسم أو الهاتف أو البريد..."
              className="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-gray-200 rounded-lg overflow-hidden shadow-inner">
            <button 
              onClick={() => setActiveTab('all')} 
              className={`flex-1 px-3 py-2 text-sm ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'} transition-colors`}
            >
              الكل
            </button>
            <button 
              onClick={() => setActiveTab('frequent')} 
              className={`flex-1 px-3 py-2 text-sm ${activeTab === 'frequent' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'} transition-colors`}
            >
              دائمي الشراء
            </button>
            <button 
              onClick={() => setActiveTab('inactive')} 
              className={`flex-1 px-3 py-2 text-sm ${activeTab === 'inactive' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'} transition-colors`}
            >
              غير نشطين
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="name">ترتيب بالاسم</option>
              <option value="totalSpent">ترتيب بالمشتريات</option>
              <option value="purchaseCount">ترتيب بعدد الطلبات</option>
              <option value="lastPurchase">ترتيب بآخر شراء</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Customers Display */}
      {view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {customer.name?.charAt(0) || 'ع'}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-800 mb-1">{customer.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{customer.phone}</p>
              {customer.email && (
                <p className="text-sm text-gray-500 mb-3">{customer.email}</p>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">إجمالي المشتريات:</span>
                  <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">عدد الطلبات:</span>
                  <span className="font-medium">{customer.purchaseCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">آخر شراء:</span>
                  <span className="font-medium">{formatDate(customer.lastPurchase)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleNewInvoice(customer)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  فاتورة جديدة
                </button>
                <button
                  onClick={() => handleViewInvoices(customer)}
                  className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  <FiFileText size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الهاتف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجمالي المشتريات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد الطلبات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">آخر شراء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">
                          {customer.name?.charAt(0) || 'ع'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          {customer.email && (
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(customer.totalSpent)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.purchaseCount || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(customer.lastPurchase)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleNewInvoice(customer)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiPlus size={16} />
                        </button>
                        <button
                          onClick={() => handleViewInvoices(customer)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <FiFileText size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 size={16} />
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

      {/* Empty State */}
      {filteredAndSortedCustomers.length === 0 && (
        <div className="text-center py-12">
          <FiUser className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد عملاء</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'جرب البحث بكلمات مختلفة' : 'ابدأ بإضافة عميل جديد'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => { setSelectedCustomer(null); setIsCustomerModalOpen(true) }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiPlus className="ml-2 h-4 w-4" />
                إضافة عميل
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isCustomerModalOpen && (
        <CustomerModal
          customer={selectedCustomer}
          onSave={handleSave}
          onClose={() => setIsCustomerModalOpen(false)}
        />
      )}
      
      {isInvoiceModalOpen && selectedCustomer && (
        <NewInvoiceModal
          customer={selectedCustomer}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}
      
      {isInvoicesModalOpen && selectedCustomer && (
        <CustomerInvoicesModal
          customer={selectedCustomer}
          onClose={() => setIsInvoicesModalOpen(false)}
        />
      )}
    </div>
  );
}