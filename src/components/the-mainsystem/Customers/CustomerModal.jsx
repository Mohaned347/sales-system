import { useState, useEffect } from 'react'
import { FiX, FiUser, FiPhone, FiMail, FiBriefcase, FiMapPin, FiFileText } from 'react-icons/fi'
import { toast } from 'react-toastify'

export default function CustomerModal({ customer, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    notes: ''
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        company: customer.company || '',
        address: customer.address || '',
        notes: customer.notes || ''
      })
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        address: '',
        notes: ''
      })
    }
  }, [customer])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      toast.error('الاسم ورقم الهاتف حقول مطلوبة')
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-yellow-400 to-yellow-500 p-5 text-white">
          <h3 className="text-lg md:text-xl font-bold">
            {customer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
          </h3>
          <button onClick={onClose} className="hover:text-gray-200">
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50">
          <div className="flex flex-wrap gap-4">
            {/* Text Input Fields */}
            {[
              { name: 'name', label: 'الاسم الكامل *', icon: <FiUser />, type: 'text', placeholder: 'أدخل اسم العميل', required: true },
              { name: 'phone', label: 'رقم الهاتف *', icon: <FiPhone />, type: 'tel', placeholder: 'أدخل رقم الهاتف', required: true },
              { name: 'email', label: 'البريد الإلكتروني', icon: <FiMail />, type: 'email', placeholder: 'أدخل البريد الإلكتروني' },
              { name: 'company', label: 'الشركة', icon: <FiBriefcase />, type: 'text', placeholder: 'أدخل اسم الشركة' },
            ].map((field, idx) => (
              <div key={idx} className="w-full md:w-[48%] space-y-1">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  {field.icon}<span className="ml-2">{field.label}</span>
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                />
              </div>
            ))}

            {/* Address Field */}
            <div className="w-full space-y-1">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiMapPin /><span className="ml-2">العنوان</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="أدخل عنوان العميل"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              />
            </div>

            {/* Notes Field */}
            <div className="w-full space-y-1">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiFileText /><span className="ml-2">ملاحظات</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="أي ملاحظات إضافية عن العميل"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
            >
              {customer ? 'حفظ التغييرات' : 'إضافة العميل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
