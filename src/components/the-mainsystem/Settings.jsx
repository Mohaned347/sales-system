import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/app-context';
import { FiSave, FiUser, FiLock, FiMail, FiHome, FiPhone, FiGlobe } from 'react-icons/fi';
import { sendPasswordResetEmail, updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // تغيير من updateDoc إلى setDoc
import { auth, db } from '../../lib/firebase';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

// إعداد Modal لـ Next.js
if (typeof window !== 'undefined') {
  Modal.setAppElement(document.body);
}

// أنماط المودال
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '90%',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
};

export default function Settings() {
  const { user, setUser } = useAppContext();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    storeName: '',
    storeAddress: '',
    storePhone: '',
    storeWebsite: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.displayName || '',
        email: user.email || '',
        currentPassword: '',
        storeName: user.storeData?.storeName || '',
        storeAddress: user.storeData?.storeAddress || '',
        storePhone: user.storeData?.storePhone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestPasswordChange = async () => {
    if (!formData.currentPassword) {
      toast.error('الرجاء إدخال كلمة المرور الحالية');
      return;
    }

    setLoading(true);
    
    try {
      // إعادة المصادقة بالمستخدم الحالي
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // إرسال بريد تغيير كلمة المرور
      await sendPasswordResetEmail(auth, user.email);
      
      setShowPasswordModal(true);
      toast.success('تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني');
    } catch (error) {
      console.error('Error requesting password change:', error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // تحديث بيانات الملف الشخصي في Authentication
      if (formData.username !== user.displayName || formData.email !== user.email) {
        await updateProfile(auth.currentUser, {
          displayName: formData.username
        });
        
        if (formData.email !== user.email) {
          await updateEmail(auth.currentUser, formData.email);
          toast.success('تم تحديث البريد الإلكتروني بنجاح');
        }
      }

      // إنشاء أو تحديث بيانات المتجر في Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName: formData.username,
        email: formData.email,
        storeData: {
          storeName: formData.storeName,
          storeAddress: formData.storeAddress,
          storePhone: formData.storePhone
        }
      }, { merge: true }); // استخدام merge: true لدمج البيانات بدلاً من استبدالها

      // تحديث حالة المستخدم في السياق
      setUser({
        ...user,
        displayName: formData.username,
        email: formData.email,
        storeData: {
          storeName: formData.storeName,
          storeAddress: formData.storeAddress,
          storePhone: formData.storePhone
        }
      });

      setShowSuccessModal(true);
      toast.success('تم تحديث الإعدادات بنجاح');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">إعدادات المتجر</h1>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-4xl">
        <form onSubmit={handleSubmit}>
          {/* قسم معلومات الحساب */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiUser className="ml-2" />
              معلومات الحساب
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">اسم المستخدم</label>
                <input
                  type="text"
                  name="username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* قسم بيانات المتجر */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiHome className="ml-2" />
              بيانات المتجر
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">اسم المتجر</label>
                <input
                  type="text"
                  name="storeName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.storeName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">عنوان المتجر</label>
                <input
                  type="text"
                  name="storeAddress"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.storeAddress}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">هاتف المتجر</label>
                <input
                  type="tel"
                  name="storePhone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.storePhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* قسم تغيير كلمة المرور */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiLock className="ml-2" />
              تغيير كلمة المرور
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">كلمة المرور الحالية</label>
                <input
                  type="password"
                  name="currentPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور الحالية لتغيير كلمة السر"
                />
              </div>
              <button
                type="button"
                onClick={handleRequestPasswordChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading || !formData.currentPassword}
              >
                {loading ? 'جاري الإرسال...' : 'طلب تغيير كلمة المرور'}
              </button>
              <p className="text-sm text-gray-500">
                سيتم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني المسجل
              </p>
            </div>
          </div>

          {/* أزرار الحفظ */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  // إعادة تحميل الصفحة بدون window.location
                  if (typeof window !== 'undefined') {
                    const { useRouter } = require('next/navigation');
                    const router = useRouter();
                    router.replace(window.location.pathname);
                  }
                }
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <FiSave />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* مودال تأكيد إرسال رابط تغيير كلمة المرور */}
      <Modal
        isOpen={showPasswordModal}
        onRequestClose={() => setShowPasswordModal(false)}
        contentLabel="تأكيد إرسال رابط تغيير كلمة المرور"
        style={customStyles}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">تم إرسال رابط تغيير كلمة المرور</h2>
          <p className="mb-4 text-gray-600">
            تم إرسال رابط لتغيير كلمة المرور إلى بريدك الإلكتروني المسجل ({user?.email}).
            الرجاء التحقق من بريدك الوارد ومتابعة التعليمات لتغيير كلمة المرور.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              فهمت
            </button>
          </div>
        </div>
      </Modal>

      {/* مودال نجاح التحديث */}
      <Modal
        isOpen={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
        contentLabel="تم تحديث الإعدادات بنجاح"
        style={customStyles}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">تم التحديث بنجاح!</h2>
          <p className="mb-4 text-gray-600">
            تم تحديث جميع إعداداتك بنجاح. التغييرات سارية الآن.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              تم
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}