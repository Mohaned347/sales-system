import { useState } from 'react';
import { FiX, FiCornerUpLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function ReturnModal({ isOpen, onClose, onSubmit, saleItem }) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (quantity <= 0 || quantity > saleItem.maxReturnable) {
      toast.error('الكمية المدخلة غير صالحة');
      return;
    }

    onSubmit({
      saleId: saleItem.saleId,
      productId: saleItem.productId,
      quantity: Number(quantity),
      reason,
      price: saleItem.price,
      date: new Date().toISOString()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">إعادة منتج</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">اسم المنتج</label>
            <input
              type="text"
              value={saleItem.productName}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">الكمية القابلة للإعادة</label>
            <input
              type="text"
              value={saleItem.maxReturnable}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">كمية الإعادة</label>
            <input
              type="number"
              min="1"
              max={saleItem.maxReturnable}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">سبب الإعادة (اختياري)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <FiCornerUpLeft className="ml-2" />
              تأكيد الإعادة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}