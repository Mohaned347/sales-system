"use client";

import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiRefreshCw, FiCornerUpLeft, FiEye, FiArchive } from 'react-icons/fi';
import SaleModal from './SaleModal';
import ReturnModal from './ReturnProductModal';
import SaleDetailsModal from './SaleDetailsModal';
import { toast } from 'react-toastify';

export default function Sales({ 
  sales = [], // Default empty array if undefined
  loading, 
  addSale, 
  updateSale, 
  deleteSale, 
  returnProduct, 
  refreshData,
  getProductById,
  deletedProducts = []
}) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [selectedSaleItem, setSelectedSaleItem] = useState(null);
  const [showDeletedProducts, setShowDeletedProducts] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (sales.length === 0 && typeof refreshData === 'function') {
      refreshData();
    }
  }, [sales.length, refreshData]);

  const handleSubmitSale = async (saleData) => {
    try {
      if (currentSale) {
        await updateSale(currentSale.id, saleData);
        toast.success('تم تحديث البيع بنجاح');
      } else {
        await addSale(saleData);
        toast.success('تمت إضافة البيع بنجاح');
      }
      setIsSaleModalOpen(false);
      setCurrentSale(null);
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ عملية البيع');
      console.error('Sale submission error:', error);
    }
  };

  const handleReturn = async (returnData) => {
    try {
      await returnProduct(returnData);
      toast.success('تمت عملية الإعادة بنجاح');
      setIsReturnModalOpen(false);
      setSelectedSaleItem(null);
    } catch (error) {
      toast.error('حدث خطأ أثناء عملية الإعادة');
      console.error('Return error:', error);
    }
  };

  const handleDeleteSale = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف عملية البيع؟')) {
      try {
        await deleteSale(id);
        toast.success('تم حذف عملية البيع بنجاح');
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف البيع');
        console.error('Delete sale error:', error);
      }
    }
  };

  const handleViewDetails = (sale) => {
    setCurrentSale(sale);
    setIsDetailsModalOpen(true);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('ar-EG') : 'غير معروف';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'SDG' }).format(amount || 0);
  };

  const filteredSales = (sales || []).filter(sale => {
    if (!sale.items) return false;
    
    const hasMatchingItem = sale.items.some(item => {
      const product = getProductById(item.productId);
      const productName = product?.name || item.name || 'منتج غير معروف';
      return (
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    const hasDeletedItems = sale.items.some(item => {
      const product = getProductById(item.productId);
      return !product?.name || product.name === 'منتج غير موجود';
    });
    
    return (showDeletedProducts || !hasDeletedItems) && (searchTerm === '' || hasMatchingItem);
  });

  const getProductNames = (sale) => {
    if (!sale.items) return 'لا توجد منتجات';
    return sale.items.map(item => {
      const product = getProductById(item.productId);
      const name = product?.name || item.name || 'منتج محذوف';
      return `${name} (${item.quantity})`;
    }).join('، ');
  };

  const getTotalItems = (sale) => {
    if (!sale.items) return 0;
    return sale.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const getTotalPrice = (sale) => {
    if (!sale.items) return 0;
    return sale.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  };

  const hasReturnableItems = (sale) => {
    if (!sale.items) return false;
    return sale.items.some(item => {
      const maxReturnable = item.quantity - (sale.returns?.reduce((sum, r) => 
        r.productId === item.productId ? sum + r.quantity : sum, 0) || 0);
      return maxReturnable > 0;
    });
  };

  // Helper to show tooltip at mouse position
  const handleTooltip = (e, text, id) => {
    const rect = e.target.getBoundingClientRect();
    // Tooltip will be shown below the button, centered horizontally
    const tooltipWidth = Math.min(window.innerWidth * 0.9, 320);
    let left = rect.right - tooltipWidth / 2 - rect.width / 2;
    // Clamp left to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));
    setTooltip({ text, id });
    setTooltipPos({
      top: rect.bottom + window.scrollY + 8,
      left: left + window.scrollX
    });
  };
  const clearTooltip = () => setTooltip(null);

  // Tooltip portal rendering
  const tooltipNode = tooltip ? ReactDOM.createPortal(
    <div
      style={{
        position: 'absolute',
        top: tooltipPos.top,
        left: tooltipPos.left,
        width: 'clamp(180px, 90vw, 320px)',
        background: '#fff',
        color: '#222',
        borderRadius: '12px',
        boxShadow: '0 2px 16px 2px #e5e7eb',
        padding: '12px',
        zIndex: 9999,
        wordBreak: 'break-word',
        fontSize: '0.95rem',
        pointerEvents: 'none',
        direction: 'rtl',
        lineHeight: 1.7,
        whiteSpace: 'pre-line',
      }}
      dir="rtl"
    >
      {tooltip.text}
    </div>,
    document.body
  ) : null;

  return (
    <div className="p-4 sm:p-6 w-full relative" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yellow-700">إدارة المبيعات</h1>
          <p className="text-sm text-gray-500">عرض وتعديل جميع عمليات البيع المسجلة</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={refreshData}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            <FiRefreshCw /> تحديث البيانات
          </button>
          <button
            onClick={() => setShowDeletedProducts(!showDeletedProducts)}
            className={`flex items-center justify-center gap-2 ${showDeletedProducts ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'} px-4 py-2 rounded-lg transition-colors`}
          >
            <FiArchive /> {showDeletedProducts ? 'إخفاء المحذوفة' : 'عرض المحذوفة'}
          </button>
          <button
            onClick={() => {
              setCurrentSale(null);
              setIsSaleModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus /> تسجيل بيع جديد
          </button>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ابحث باسم المنتج أو العميل..."
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-yellow-800 uppercase tracking-wider">رقم الفاتورة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-yellow-800 uppercase tracking-wider">المنتجات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-yellow-800 uppercase tracking-wider">عدد المنتجات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-yellow-800 uppercase tracking-wider">الإجمالي</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-yellow-800 uppercase tracking-wider">طريقة الدفع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-yellow-800 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-yellow-800 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => {
                    const hasDeletedItems = sale.items?.some(item => {
                      const product = getProductById(item.productId);
                      return !product?.name || product.name === 'منتج غير موجود';
                    });
                    
                    return (
                      <tr key={sale.id} className={`hover:bg-yellow-50 transition-colors ${hasDeletedItems ? 'bg-gray-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                          #{sale.invoiceNumber || sale.id.substring(0, 6)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {getProductNames(sale)}
                          {hasDeletedItems && (
                            <span className="mr-2 text-xs text-gray-500">(يحتوي على منتجات محذوفة)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getTotalItems(sale)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(getTotalPrice(sale))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(sale.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex justify-end space-x-2 relative">
                            <button
                              onMouseEnter={e => handleTooltip(e, 'عرض تفاصيل المبيعات لهذه العملية', sale.id)}
                              onMouseLeave={clearTooltip}
                              onClick={() => handleViewDetails(sale)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors"
                              title="عرض التفاصيل"
                            >
                              <FiEye size={18} />
                            </button>
                            
                            {hasReturnableItems(sale) && (
                              <button
                                onMouseEnter={e => handleTooltip(e, 'إعادة منتج من هذه العملية', sale.id)}
                                onMouseLeave={clearTooltip}
                                onClick={() => {
                                  setSelectedSaleItem(sale);
                                  setIsReturnModalOpen(true);
                                }}
                                className="text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-colors"
                                title="إعادة منتج"
                              >
                                <FiCornerUpLeft size={18} />
                              </button>
                            )}
                            
                            <button
                              onMouseEnter={e => handleTooltip(e, 'تعديل بيانات المبيعات لهذه العملية', sale.id)}
                              onMouseLeave={clearTooltip}
                              onClick={() => {
                                setCurrentSale(sale);
                                setIsSaleModalOpen(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-100 transition-colors"
                              title="تعديل"
                            >
                              <FiEdit size={18} />
                            </button>
                            
                            <button
                              onMouseEnter={e => handleTooltip(e, 'حذف هذه العملية من سجل المبيعات', sale.id)}
                              onMouseLeave={clearTooltip}
                              onClick={() => handleDeleteSale(sale.id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                              title="حذف"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد عمليات بيع مسجلة'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setCurrentSale(null);
        }}
        onSubmit={handleSubmitSale}
        sale={currentSale}
      />

      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedSaleItem(null);
        }}
        onSubmit={handleReturn}
        saleItem={selectedSaleItem}
      />

      <SaleDetailsModal
        isOpen={isDetailsModalOpen && currentSale !== null}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setCurrentSale(null);
        }}
        sale={currentSale}
        getProductById={getProductById}
      />
    {/* Tooltip rendered outside the table, under the hovered button, using portal */}
    {tooltipNode}
  </div>
  );
}