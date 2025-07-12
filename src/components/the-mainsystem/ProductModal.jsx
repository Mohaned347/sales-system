// src/components/ProductModal.jsx
import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function ProductModal({ isOpen, onClose, onSubmit, product }) {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    category: '',
    barcode: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        stock: product.stock || 0,
        category: product.category || '',
        barcode: product.barcode || ''
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        stock: 0,
        category: '',
        barcode: ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-bold">
            {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ج.س)</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
              <input
                type="number"
                name="stock"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
            <input
              type="text"
              name="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">باركود</label>
            <input
              type="text"
              name="barcode"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.barcode}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {product ? 'حفظ التغييرات' : 'إضافة المنتج'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}