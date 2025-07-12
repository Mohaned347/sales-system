import { useState, useEffect } from 'react';
import { FiX, FiShoppingCart, FiDollarSign, FiFileText,FiUser,FiSearch, FiPercent, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useAppContext } from '../../../backEnd/context/AppContext';
import { toast } from 'react-toastify';

export default function NewInvoiceModal({ customer, onClose, onSave }) {
  const { products, addInvoice } = useAppContext();
  const [invoiceData, setInvoiceData] = useState({
    customer: {
      id: customer?.id || '',
      name: customer?.name || '',
      phone: customer?.phone || '',
      address: customer?.address || ''
    },
    items: [],
    discount: 0,
    tax: 0,
    subtotal: 0,
    total: 0,
    paymentMethod: 'cash',
    notes: '',
    status: 'paid'
  });

  const [showProductSelector, setShowProductSelector] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal - invoiceData.discount + (subtotal * (invoiceData.tax / 100));
    setInvoiceData(prev => ({ ...prev, subtotal, total }));
  }, [invoiceData.items, invoiceData.discount, invoiceData.tax]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) &&
    product.stock > 0
  );

  const handleAddProduct = (product) => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock
        }
      ]
    }));
    setShowProductSelector(false);
    setProductSearch('');
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    
    if (field === 'quantity') {
      const qty = Math.max(1, Math.min(Number(value), newItems[index].stock));
      newItems[index].quantity = qty;
    } else if (field === 'price') {
      newItems[index].price = Math.max(0, Number(value));
    }

    setInvoiceData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index) => {
    const newItems = [...invoiceData.items];
    newItems.splice(index, 1);
    setInvoiceData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (invoiceData.items.length === 0) {
      toast.error('يجب إضافة منتج واحد على الأقل للفاتورة');
      return;
    }
  
    try {
      await addInvoice({
        ...invoiceData,
        items: invoiceData.items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        total: invoiceData.total,
        subtotal: invoiceData.subtotal,
        discount: invoiceData.discount,
        tax: invoiceData.tax
      });
      
      toast.success('تم حفظ الفاتورة بنجاح');
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(`حدث خطأ أثناء حفظ الفاتورة: ${error.message}`);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b p-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-xl">
          <div>
            <h3 className="text-xl font-bold">فاتورة جديدة</h3>
            <p className="text-sm text-blue-100">
              {invoiceData.customer.name ? `للعميل: ${invoiceData.customer.name}` : 'فاتورة جديدة'}
            </p>
          </div>
          <button onClick={onClose} className="text-blue-100 hover:text-white p-1">
            <FiX size={24} />
          </button>
        </div>
        
        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <FiUser /> معلومات العميل
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">اسم العميل:</p>
                  <p className="font-medium">{invoiceData.customer.name || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">الهاتف:</p>
                  <p className="font-medium">{invoiceData.customer.phone || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">العنوان:</p>
                  <p className="font-medium">{invoiceData.customer.address || 'غير محدد'}</p>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <FiShoppingCart /> عناصر الفاتورة
                </h4>
                <button
                  type="button"
                  onClick={() => setShowProductSelector(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                >
                  <FiPlus size={16} />
                  إضافة منتج
                </button>
              </div>

              {/* Invoice Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المخزون</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجمالي</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoiceData.items.length > 0 ? (
                      invoiceData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">{item.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => handleItemChange(index, 'quantity', item.quantity - 1)}
                                className="px-2 bg-gray-200 border border-gray-300 rounded-r-md"
                                disabled={item.quantity <= 1}
                              >
                                <FiMinus size={14} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={item.stock}
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-16 px-2 py-1 border-t border-b border-gray-300 text-center"
                              />
                              <button
                                type="button"
                                onClick={() => handleItemChange(index, 'quantity', item.quantity + 1)}
                                className="px-2 bg-gray-200 border border-gray-300 rounded-l-md"
                                disabled={item.quantity >= item.stock}
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{item.stock}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium">
                            {(item.price * item.quantity).toLocaleString()} ج.س
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                          لا توجد منتجات مضافة للفاتورة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <FiFileText /> ملاحظات
                </h4>
                <textarea
                  rows={3}
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="ملاحظات إضافية..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <FiPercent /> الخصومات والضرائب
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">الخصم (ج.س)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoiceData.discount}
                      onChange={(e) => setInvoiceData({...invoiceData, discount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">الضريبة (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={invoiceData.tax}
                      onChange={(e) => setInvoiceData({...invoiceData, tax: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">طريقة الدفع</label>
                    <select
                      value={invoiceData.paymentMethod}
                      onChange={(e) => setInvoiceData({...invoiceData, paymentMethod: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="cash">نقدي</option>
                      <option value="credit">آجل</option>
                      <option value="bank">تحويل بنكي</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <FiDollarSign /> ملخص الفاتورة
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>إجمالي المنتجات:</span>
                    <span className="font-medium">
                      {invoiceData.subtotal.toLocaleString()} ج.س
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>الخصم:</span>
                    <span className="font-medium text-red-600">
                      - {invoiceData.discount.toLocaleString()} ج.س
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة ({invoiceData.tax}%):</span>
                    <span className="font-medium text-green-600">
                      + {(invoiceData.subtotal * (invoiceData.tax / 100)).toLocaleString()} ج.س
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>الإجمالي النهائي:</span>
                    <span className="text-blue-600">
                      {invoiceData.total.toLocaleString()} ج.س
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
        
        {/* Modal Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-between items-center rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            إلغاء
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              عدد المنتجات: {invoiceData.items.length}
            </span>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={invoiceData.items.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors shadow-md disabled:opacity-50"
            >
              حفظ الفاتورة
            </button>
          </div>
        </div>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-lg">إضافة منتج للفاتورة</h3>
              <button 
                onClick={() => {
                  setShowProductSelector(false);
                  setProductSearch('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <FiSearch />
                  </div>
                  <input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-lg">
                {filteredProducts.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredProducts.map(product => (
                      <li 
                        key={product.id} 
                        className="p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleAddProduct(product)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-gray-500">
                              السعر: {product.price.toLocaleString()} ج.س | 
                              المتوفر: {product.stock}
                            </p>
                          </div>
                          <FiPlus className="text-blue-500" />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    لا توجد منتجات متطابقة مع البحث
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}