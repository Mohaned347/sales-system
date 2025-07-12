// --- Products.jsx ---
import { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { useAppContext } from '../../backEnd/context/AppContext';
import ProductModal from './ProductModal';
import { toast } from 'react-toastify';

export default function Products() {
  const { products, loading, addProduct, updateProduct, deleteProduct, refreshData } = useAppContext();
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
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
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