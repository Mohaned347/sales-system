// --- Products.jsx ---
import { useState,useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { useAppContext } from '../../context/app-context';
import ProductModal from './ProductModal';
import { toast } from 'react-toastify';
import { addLocalProduct, getAllLocalProducts } from '@/lib/local-db';

export default function Products() {
  // خطوات الجولة الإرشادية للمنتجات
  const productTourSteps = [
    {
      selector: '.bg-blue-600.text-white',
      text: 'زر إضافة منتج جديد: يمكنك من هنا إضافة منتج جديد للنظام.'
    },
    {
      selector: '.bg-gray-200.text-gray-800',
      text: 'زر تحديث المنتجات: يعيد تحميل المنتجات من قاعدة البيانات.'
    },
    {
      selector: '.text-blue-600',
      text: 'زر تعديل المنتج: يتيح لك تعديل بيانات المنتج الحالي.'
    },
    {
      selector: '.text-red-600',
      text: 'زر حذف المنتج: يتيح لك حذف المنتج من النظام بعد التأكيد.'
    }
  ];

  // منطق الجولة الإرشادية
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  // جلب حالة المستخدم من السياق
  const { products, loading, addProduct, updateProduct, deleteProduct, refreshData, user } = useAppContext();

  // تحقق من حالة العرض عند التحميل
  useEffect(() => {
    const dontShow = localStorage.getItem('dontShowProductTour');
    if (user?.role === 'trial_user' && !dontShow) {
      setShowTour(true);
    }
  }, [user]);

  // إخفاء الجولة وعدم العرض مرة أخرى
  const handleDontShowAgain = () => {
    localStorage.setItem('dontShowProductTour', 'true');
    setShowTour(false);
    setDontShowAgain(true);
  };

  // صندوق شرح الجولة الإرشادية مع هايلايت
  const TourGuideBox = ({ step, onNext, onPrev, onClose, onDontShowAgain }) => {
    if (!productTourSteps[step]) return null;
    // تحديد العنصر المستهدف
    const target = document.querySelector(productTourSteps[step].selector);
    // إضافة/إزالة الهايلايت
    useEffect(() => {
      if (target) {
        target.classList.add('tour-highlight');
      }
      return () => {
        if (target) {
          target.classList.remove('tour-highlight');
        }
      };
    }, [step, target]);

    let style = { position: 'fixed', top: '20%', left: '50%', zIndex: 9999, background: '#fff', border: '2px solid #2563eb', borderRadius: '12px', padding: '18px', minWidth: '260px', boxShadow: '0 2px 16px rgba(0,0,0,0.12)' };
    if (target) {
      const rect = target.getBoundingClientRect();
      style = { ...style, top: rect.top + window.scrollY + rect.height + 8, left: rect.left + window.scrollX, position: 'absolute' };
    }
    return (
      <div style={style} dir="rtl">
        <div style={{ fontWeight: 'bold', color: '#2563eb', marginBottom: 8 }}>شرح: </div>
        <div style={{ marginBottom: 12 }}>{productTourSteps[step].text}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onPrev} disabled={step === 0} style={{ padding: '4px 12px', borderRadius: 6, background: '#eee', border: 'none' }}>السابق</button>
          <button onClick={onNext} disabled={step === productTourSteps.length - 1} style={{ padding: '4px 12px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none' }}>التالي</button>
          <button onClick={onClose} style={{ padding: '4px 12px', borderRadius: 6, background: '#f87171', color: '#fff', border: 'none' }}>إغلاق</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <label style={{ fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={dontShowAgain} onChange={onDontShowAgain} /> لا تظهر الجولة مرة أخرى
          </label>
        </div>
      </div>
    );
  };
// إضافة ستايل الهايلايت للزر المستهدف
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `.tour-highlight {
    box-shadow: 0 0 0 4px #2563eb99, 0 0 16px 4px #2563eb55;
    transition: box-shadow 0.3s;
    position: relative;
    z-index: 10000;
  }`;
  if (!document.getElementById('tour-highlight-style')) {
    style.id = 'tour-highlight-style';
    document.head.appendChild(style);
  }
}
  // ...existing code...
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const handleSubmit = async (productData) => {
    try {
      if (currentProduct) {
        await updateProduct(currentProduct.id, productData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await addProduct(productData);
        // إضافة المنتج محلياً
        await addLocalProduct({
          id: productData.id,
          name: productData.name,
          price: productData.price,
          stock: productData.stock,
          category: productData.category,
          barcode: productData.barcode
        });
        toast.success('تم إضافة المنتج بنجاح');
      }
      setIsModalOpen(false);
      setCurrentProduct(null);
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ المنتج');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
      try {
        await deleteProduct(id);
        toast.success('تم حذف المنتج بنجاح');
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف المنتج');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  return (
    <div className="p-4 sm:p-6 w-full">
      {/* صندوق الجولة الإرشادية */}
      {showTour && (
        <TourGuideBox
          step={tourStep}
          onNext={() => setTourStep((s) => Math.min(s + 1, productTourSteps.length - 1))}
          onPrev={() => setTourStep((s) => Math.max(s - 1, 0))}
          onClose={() => setShowTour(false)}
          onDontShowAgain={handleDontShowAgain}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-blue-800">إدارة المنتجات</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={refreshData}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center justify-center"
          >
            <FiRefreshCw className="ml-2" /> تحديث
          </button>
          <button
            onClick={() => {
              setCurrentProduct(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
          >
            <FiPlus className="ml-2" /> إضافة منتج
          </button>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ابحث عن منتج بالاسم، التصنيف أو الباركود..."
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase">السعر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase">المخزون</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase">التصنيف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                      {product.barcode && <div className="text-xs text-gray-500">باركود: {product.barcode}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {product.price.toFixed(2)} ج.س
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category || '---'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setCurrentProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد منتجات متاحة'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        product={currentProduct}
      />
    </div>
  );
}