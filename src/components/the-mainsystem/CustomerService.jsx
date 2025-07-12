import { useState } from 'react';
import { FiMessageSquare, FiPhone, FiUser, FiMail, FiPlus, FiX } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { db } from '../../backEnd/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAppContext } from '../../backEnd/context/AppContext';

export default function CustomerService() {
  const { user } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    additionalPhone: '',
    message: ''
  });
  const [showAdditionalPhone, setShowAdditionalPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'contactRequests'), {
        ...formData,
        userId: user?.uid || 'guest',
        createdAt: new Date(),
        status: 'new'
      });
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        additionalPhone: '',
        message: ''
      });
      setShowAdditionalPhone(false);
      
      // إخفاء رسالة النجاح بعد 5 ثواني
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting contact request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md relative" dir='rtl'>
      {/* زر الواتساب العائم */}
      <a 
        href="https://wa.me/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-20 right-74 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 flex items-center gap-2"
      >
        <FaWhatsapp size={28} />
      </a>

      {/* العنوان والنصوص الترويجية */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-yellow-600 mb-4">خدمة العملاء</h2>
        <p className="text-lg text-gray-700 mb-2">نحن هنا لمساعدتك على مدار الساعة</p>
        <p className="text-gray-600">يسعدنا تلقي استفساراتك واقتراحاتك، فريق الدعم لدينا جاهز للرد عليك</p>
      </div>

      {/* رسالة النجاح */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
          تم إرسال رسالتك بنجاح! سيتواصل معك فريق الدعم في أقرب وقت ممكن.
        </div>
      )}

      {/* نموذج الاتصال */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* حقل الاسم */}
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              الاسم الكامل
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <FiUser />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="أدخل اسمك"
              />
            </div>
          </div>

          {/* حقل البريد الإلكتروني */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <FiMail />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>
          </div>

          {/* حقل الهاتف الأساسي */}
          <div className="relative">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              رقم الهاتف
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <FiPhone />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="مثال: 966500000000"
              />
            </div>
          </div>

          {/* حقل الهاتف الإضافي */}
          {showAdditionalPhone ? (
            <div className="relative">
              <label htmlFor="additionalPhone" className="block text-sm font-medium text-gray-700 mb-1">
                رقم هاتف إضافي
              </label>
              <div className="flex">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <FiPhone />
                  </div>
                  <input
                    type="tel"
                    id="additionalPhone"
                    name="additionalPhone"
                    value={formData.additionalPhone}
                    onChange={handleChange}
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="اختياري"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdditionalPhone(false)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 transition-colors"
                >
                  <FiX />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setShowAdditionalPhone(true)}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <FiPlus className="ml-1" />
                إضافة رقم هاتف آخر
              </button>
            </div>
          )}
        </div>

        {/* حقل الرسالة */}
        <div className="relative">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            رسالتك
          </label>
          <div className="relative">
            <div className="absolute top-3 right-3 text-gray-400">
              <FiMessageSquare />
            </div>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="أدخل رسالتك هنا..."
            ></textarea>
          </div>
        </div>

        {/* زر الإرسال */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
          </button>
        </div>
      </form>

      {/* معلومات إضافية */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">طرق أخرى للتواصل</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-600 mb-2">البريد الإلكتروني</h4>
            <p className="text-gray-600">support@montygo.com</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-600 mb-2">الهاتف</h4>
            <p className="text-gray-600" dir='ltr'>+966 12 345 6789</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-600 mb-2">ساعات العمل</h4>
            <p className="text-gray-600">الأحد - الخميس: 8 صباحاً - 5 مساءً</p>
          </div>
        </div>
      </div>

      {/* نص ترويجي إضافي */}
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-100">
        <h3 className="text-xl font-bold text-yellow-700 text-center mb-3">لماذا تختارنا؟</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-yellow-500 mr-2">✓</span>
            <span>دعم فني على مدار الساعة</span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-500 mr-2">✓</span>
            <span>فريق متخصص لحل مشاكلك بسرعة</span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-500 mr-2">✓</span>
            <span>أدوات متطورة لخدمة أفضل</span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-500 mr-2">✓</span>
            <span>تعهد بالرد خلال 24 ساعة</span>
          </li>
        </ul>
      </div>
    </div>
  );
}