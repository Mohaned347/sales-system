import { useState, useEffect, useRef, useCallback } from 'react';
import { FiX, FiPlus, FiMinus, FiTrash2, FiSearch, FiPercent, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAppContext } from '../../backEnd/context/AppContext';
import { toast } from 'react-toastify';


export default function InvoiceModal({ isOpen, onClose }) {
  const { products, addSale, user } = useAppContext(); // إضافة user من السياق
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    discount: 0,
    discountType: 'fixed',
    tax: 0,
    total: 0,
    paymentMethod: 'cash',
    userId: user?.uid || '' // إضافة الحقل هنا
  });
  useEffect(() => {
    if (user?.uid) {
      setInvoiceData(prev => ({
        ...prev,
        userId: user.uid
      }));
    }
  }, [user]);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchInputRef = useRef(null);

  // دالة إنشاء رقم فاتورة
  function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}${month}${day}-${randomNum}`;
  }

  // دالة حساب الإجمالي الفرعي (تم إضافتها هنا)
  const calculateSubtotal = useCallback((items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 0));
    }, 0);
  }, []);

  useEffect(() => {
    const subtotal = calculateSubtotal(invoiceData.items);
    const discountAmount = invoiceData.discountType === 'percentage' 
      ? subtotal * (invoiceData.discount / 100)
      : invoiceData.discount;
    
    const taxAmount = subtotal * (invoiceData.tax / 100);
    const total = subtotal - discountAmount + taxAmount;

    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      total
    }));
  }, [invoiceData.items, invoiceData.discount, invoiceData.discountType, invoiceData.tax, calculateSubtotal]);

  // تصفية المنتجات مع التحقق من وجودها
  const filteredProducts = (products || []).filter(p => {
    if (!p) return false;
    return p.stock > 0 && (
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm))
    );
  });

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error('يجب اختيار منتج أولاً', {
        icon: <FiAlertCircle className="text-red-500" />
      });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (quantity > product.stock) {
      toast.error(
        <div>
          <p className="font-bold">الكمية المطلوبة غير متوفرة!</p>
          <p>الكمية المطلوبة: {quantity} | المخزون المتاح: {product.stock}</p>
        </div>,
        {
          icon: <FiAlertCircle className="text-red-500" />,
          autoClose: 5000
        }
      );
      return;
    }

    if (quantity <= 0) {
      toast.error('الكمية يجب أن تكون أكبر من الصفر', {
        icon: <FiAlertCircle className="text-red-500" />
      });
      return;
    }

    const existingItemIndex = invoiceData.items.findIndex(
      item => item.productId === selectedProduct
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...invoiceData.items];
      updatedItems[existingItemIndex].quantity += quantity;
      
      setInvoiceData(prev => ({
        ...prev,
        items: updatedItems
      }));

      toast.success(
        <div>
          <p>تم تحديث كمية المنتج</p>
          <p className="text-sm">{product.name} - الكمية الجديدة: {updatedItems[existingItemIndex].quantity}</p>
        </div>,
        {
          icon: <FiCheckCircle className="text-green-500" />
        }
      );
    } else {
      const newItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        total: product.price * quantity
      };
      
      const updatedItems = [...invoiceData.items, newItem];
      setInvoiceData(prev => ({
        ...prev,
        items: updatedItems
      }));

      toast.success(
        <div>
          <p>تمت إضافة المنتج بنجاح</p>
          <p className="text-sm">{product.name} - كمية: {quantity}</p>
          <p className="text-xs text-gray-500 mt-1">المخزون المتبقي: {product.stock - quantity}</p>
        </div>,
        {
          icon: <FiCheckCircle className="text-green-500" />
        }
      );
    }

    setSelectedProduct('');
    setQuantity(1);
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleRemoveItem = (productId) => {
    const itemToRemove = invoiceData.items.find(item => item.productId === productId);
    if (!itemToRemove) return;

    const confirmRemove = window.confirm(
      `هل أنت متأكد من إزالة المنتج "${itemToRemove.name}" من الفاتورة؟`
    );
    
    if (confirmRemove) {
      const updatedItems = invoiceData.items.filter(item => item.productId !== productId);
      setInvoiceData(prev => ({ ...prev, items: updatedItems }));
      
      toast.info(
        <div>
          <p>تم إزالة المنتج</p>
          <p className="text-sm">{itemToRemove.name}</p>
        </div>,
        {
          icon: <FiTrash2 className="text-gray-500" />,
          autoClose: 3000
        }
      );
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast.error(
        <div>
          <p className="font-bold">لا يمكن تعديل الكمية!</p>
          <p>الكمية المطلوبة: {newQuantity} | المخزون المتاح: {product.stock}</p>
        </div>,
        {
          icon: <FiAlertCircle className="text-red-500" />
        }
      );
      return;
    }

    const updatedItems = invoiceData.items.map(item => 
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));

    const updatedItem = updatedItems.find(item => item.productId === productId);
    if (updatedItem) {
      toast.success(
        <div>
          <p>تم تعديل الكمية بنجاح</p>
          <p className="text-sm">{updatedItem.name} - الكمية الجديدة: {updatedItem.quantity}</p>
        </div>,
        {
          icon: <FiCheckCircle className="text-green-500" />,
          autoClose: 3000
        }
      );
    }
  };

  const handleDiscountTypeChange = (type) => {
    setInvoiceData(prev => ({
      ...prev,
      discountType: type,
      discount: 0
    }));
  };

  const handleClose = () => {
    if (invoiceData.items.length > 0) {
      const confirmClose = window.confirm(
        'لديك فاتورة غير محفوظة، هل تريد حقًا الخروج؟ سيتم فقدان جميع التغييرات.'
      );
      if (confirmClose) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (invoiceData.items.length === 0) {
      toast.error(
        <div>
          <p className="font-bold">لا يمكن حفظ الفاتورة بدون منتجات</p>
          <p className="text-sm">الرجاء إضافة منتجات أولاً</p>
        </div>,
        {
          icon: <FiAlertCircle className="text-red-500" />,
          autoClose: 5000
        }
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await addSale(invoiceData);
      toast.success(
        <div>
          <p className="font-bold">تم حفظ الفاتورة بنجاح!</p>
          <p>رقم الفاتورة: {invoiceData.invoiceNumber}</p>
          <p>المبلغ الإجمالي: {invoiceData.total.toFixed(2)} ج.س</p>
        </div>,
        {
          icon: <FiCheckCircle className="text-green-500" />,
          autoClose: 5000
        }
      );
      onClose();
    } catch (error) {
      toast.error(
        <div>
          <p className="font-bold">حدث خطأ أثناء حفظ الفاتورة</p>
          <p className="text-sm">الرجاء المحاولة مرة أخرى</p>
        </div>,
        {
          icon: <FiAlertCircle className="text-red-500" />,
          autoClose: 5000
        }
      );
      console.error('Error submitting invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-bold">فاتورة بيع</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الفاتورة</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                value={invoiceData.invoiceNumber}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={invoiceData.date}
                onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-md p-4 mb-4">
            <h3 className="text-lg font-medium mb-3">إضافة منتجات</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                بحث عن منتج (بالاسم أو الباركود)
              </label>
              <div className="relative">
                <input
                  type="text"
                  ref={searchInputRef}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md"
                  placeholder="ابحث عن منتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المنتج</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={selectedProduct}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value);
                    if (product && quantity > product.stock) {
                      toast.warning(
                        `الكمية الحالية (${quantity}) أكبر من المخزون (${product.stock})`,
                        { autoClose: 3000 }
                      );
                    }
                    setSelectedProduct(e.target.value);
                  }}
                >
                  <option value="">اختر منتج</option>
                  {filteredProducts.map(product => (
                    <option 
                      key={product.id} 
                      value={product.id}
                      className={product.stock <= 0 ? 'text-red-500' : ''}
                      disabled={product.stock <= 0}
                    >
                      {product.name} - {product.price} ج.س (المخزون: {product.stock})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-2 bg-gray-200 rounded-r-md"
                    disabled={!selectedProduct}
                  >
                    <FiMinus />
                  </button>
                  <input
                    type="text"
                    min="1"
                    className={`w-full px-3 py-2 border-t border-b border-gray-300 text-center ${
                      selectedProduct && products.find(p => p.id === selectedProduct)?.stock < quantity 
                        ? 'bg-red-100 border-red-500' 
                        : ''
                    }`}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={!selectedProduct}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-3 py-2 bg-gray-200 rounded-l-md"
                    disabled={!selectedProduct}
                  >
                    <FiPlus />
                  </button>
                </div>
                {selectedProduct && (
                  <p className={`text-xs mt-1 ${
                    products.find(p => p.id === selectedProduct)?.stock < quantity 
                      ? 'text-red-600 font-bold' 
                      : 'text-gray-500'
                  }`}>
                    المخزون المتاح: {products.find(p => p.id === selectedProduct)?.stock || 0}
                  </p>
                )}
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  disabled={!selectedProduct}
                >
                  إضافة
                </button>
              </div>
            </div>

            {invoiceData.items.length > 0 ? (
              <div className="border-t border-gray-200 mt-4 pt-4">
                <h4 className="text-md font-medium mb-2">المنتجات المضافة</h4>
                <div className="space-y-2">
                  {invoiceData.items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const isLowStock = product?.stock < item.quantity * 2;
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex justify-between items-center p-2 rounded-md ${
                          isLowStock ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.price} ج.س × {item.quantity} = {item.price * item.quantity} ج.س
                          </p>
                          {isLowStock && (
                            <p className="text-xs text-yellow-600 mt-1">
                              <FiAlertCircle className="inline mr-1" />
                              المخزون منخفض ({product.stock} وحدة متبقية)
                            </p>
                          )}
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center mr-4">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                              className="px-2 py-1 bg-gray-200 rounded-r-md"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="px-3 py-1 border-t border-b border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                              className="px-2 py-1 bg-gray-200 rounded-l-md"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">لا توجد منتجات مضافة</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الإجمالي</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-lg"
                value={`${invoiceData.subtotal.toFixed(2)} ج.س`}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">الخصم</label>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => handleDiscountTypeChange('fixed')}
                  className={`px-3 py-2 rounded-r-md ${
                    invoiceData.discountType === 'fixed' ? 'bg-yellow-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  مبلغ ثابت
                </button>
                <button
                  type="button"
                  onClick={() => handleDiscountTypeChange('percentage')}
                  className={`px-3 py-2 rounded-l-md ${
                    invoiceData.discountType === 'percentage' ? 'bg-yellow-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  نسبة مئوية
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={invoiceData.discount}
                  onChange={(e) => setInvoiceData({...invoiceData, discount: parseFloat(e.target.value) || 0})}
                />
                {invoiceData.discountType === 'percentage' && (
                  <div className="absolute left-3 top-2.5 text-gray-500">
                    <FiPercent size={18} />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الضريبة</label>
              <div className="relative">
                <input
                  type="text"
                  
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md"
                  value={invoiceData.tax}
                  onChange={(e) => setInvoiceData({...invoiceData, tax: parseFloat(e.target.value) || 0})}
                />
                <div className="absolute left-3 top-2.5 text-gray-500">
                  <FiPercent size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">الإجمالي:</span>
                <span>{invoiceData.subtotal.toFixed(2)} ج.س</span>
              </div>
              
              <div className="flex justify-between text-red-600">
                <span className="font-medium">الخصم:</span>
                <span>
                  {invoiceData.discountType === 'percentage' 
                    ? `${invoiceData.discount}% (-${(invoiceData.subtotal * (invoiceData.discount / 100)).toFixed(2)} ج.س)`
                    : `-${invoiceData.discount.toFixed(2)} ج.س`}
                </span>
              </div>
              
              <div className="flex justify-between text-green-600">
                <span className="font-medium">الضريبة:</span>
                <span>
                  {invoiceData.tax}% (+{(invoiceData.subtotal * (invoiceData.tax / 100)).toFixed(2)} ج.س)
                </span>
              </div>
              
              <div className="flex justify-between border-t pt-2 mt-2 font-bold text-lg">
                <span>الصافي:</span>
                <span className="text-blue-600">{invoiceData.total.toFixed(2)} ج.س</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={invoiceData.paymentMethod}
                onChange={(e) => setInvoiceData({...invoiceData, paymentMethod: e.target.value})}
              >
                <option value="cash">نقدي</option>
                <option value="card">بطاقة ائتمان</option>
                <option value="bank">تحويل بنكي</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={invoiceData.items.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </>
              ) : (
                'حفظ الفاتورة'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}