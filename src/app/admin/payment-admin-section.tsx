import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { FiCreditCard, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const getFallbackImage = (text = 'Bank') => {
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' fill='%23f0f0f0'/><text x='50%' y='50%' fill='%23000' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle'>${encodeURIComponent(text)}</text></svg>`;
};

export default function PaymentAdminSection() {
  const [config, setConfig] = useState({
    defaultInstructions: "يرجى التحويل إلى أحد الحسابات التالية مع كتابة رقم الطلب في وصف التحويل",
    banks: []
  });
  const [newBank, setNewBank] = useState({
    name: '',
    accountNumber: '',
    accountName: 'متجر مونتي جو',
    instructions: '',
    logo: '',
    active: true
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const initializePaymentConfig = async () => {
      try {
        const docRef = doc(db, 'paymentConfig', 'activeConfig');
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          const defaultConfig = {
            defaultInstructions: "يرجى التحويل إلى أحد الحسابات التالية مع كتابة رقم الطلب في وصف التحويل",
            banks: []
          };
          await setDoc(docRef, defaultConfig);
          setConfig(defaultConfig);
        } else {
          setConfig(docSnap.data());
        }
      } catch (error) {
        showNotification('حدث خطأ في تحميل إعدادات الدفع', 'error');
      } finally {
        setLoading(false);
      }
    };
    initializePaymentConfig();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddBank = async () => {
    if (!newBank.name || !newBank.accountNumber) {
      showNotification('الرجاء إدخال اسم البنك ورقم الحساب', 'warning');
      return;
    }
    try {
      const bankId = Date.now().toString();
      const updatedBanks = [...config.banks, {
        id: bankId,
        ...newBank,
        logo: newBank.logo || getFallbackImage(newBank.name)
      }];
      const docRef = doc(db, 'paymentConfig', 'activeConfig');
      await updateDoc(docRef, { banks: updatedBanks });
      setConfig(prev => ({ ...prev, banks: updatedBanks }));
      setNewBank({ name: '', accountNumber: '', accountName: 'متجر مونتي جو', instructions: '', logo: '', active: true });
      showNotification('تمت إضافة البنك بنجاح', 'success');
    } catch (error) {
      showNotification('حدث خطأ أثناء إضافة البنك', 'error');
    }
  };

  const toggleBankStatus = async (bankId) => {
    try {
      const updatedBanks = config.banks.map(bank =>
        bank.id === bankId ? { ...bank, active: !bank.active } : bank
      );
      const docRef = doc(db, 'paymentConfig', 'activeConfig');
      await updateDoc(docRef, { banks: updatedBanks });
      setConfig(prev => ({ ...prev, banks: updatedBanks }));
      showNotification('تم تحديث حالة البنك', 'success');
    } catch (error) {
      showNotification('حدث خطأ أثناء تحديث حالة البنك', 'error');
    }
  };

  const deleteBank = async (bankId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البنك؟')) return;
    try {
      const docRef = doc(db, 'paymentConfig', 'activeConfig');
      await updateDoc(docRef, {
        banks: config.banks.filter(b => b.id !== bankId)
      });
      setConfig(prev => ({ ...prev, banks: prev.banks.filter(b => b.id !== bankId) }));
      showNotification('تم حذف البنك بنجاح', 'success');
    } catch (error) {
      showNotification('حدث خطأ أثناء حذف البنك', 'error');
    }
  };

  const saveChanges = async () => {
    try {
      const docRef = doc(db, 'paymentConfig', 'activeConfig');
      await updateDoc(docRef, {
        defaultInstructions: config.defaultInstructions,
        banks: config.banks
      });
      showNotification('تم حفظ التغييرات بنجاح', 'success');
    } catch (error) {
      showNotification('حدث خطأ أثناء حفظ التغييرات', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* إشعارات */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 left-4 px-6 py-3 rounded-lg shadow-md text-white z-50 ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </motion.div>
      )}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-8 flex items-center gap-2"><FiCreditCard className="text-yellow-500" /> إعدادات الدفع والبنوك</h1>
        {/* تعليمات الدفع */}
        <div className="bg-white p-6 rounded-lg mb-8 border border-yellow-100">
          <h2 className="text-lg font-bold mb-2 text-yellow-700">تعليمات الدفع الافتراضية</h2>
          <textarea
            value={config.defaultInstructions}
            onChange={(e) => setConfig(prev => ({ ...prev, defaultInstructions: e.target.value }))}
            className="w-full bg-yellow-50 text-gray-800 p-4 rounded-lg border border-yellow-200"
            rows={3}
            placeholder="أدخل التعليمات العامة للدفع..."
          />
        </div>
        {/* إضافة بنك جديد */}
        <div className="bg-white p-6 rounded-lg mb-8 border border-blue-100">
          <h2 className="text-lg font-bold mb-4 text-blue-700">إضافة بنك جديد</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-700 block mb-1">اسم البنك</label>
              <input
                type="text"
                value={newBank.name}
                onChange={(e) => setNewBank({...newBank, name: e.target.value})}
                className="w-full bg-blue-50 text-gray-900 p-2 rounded border border-blue-200"
                placeholder="اسم البنك"
                required
              />
            </div>
            <div>
              <label className="text-gray-700 block mb-1">رقم الحساب</label>
              <input
                type="text"
                value={newBank.accountNumber}
                onChange={(e) => setNewBank({...newBank, accountNumber: e.target.value})}
                className="w-full bg-blue-50 text-gray-900 p-2 rounded border border-blue-200"
                placeholder="رقم الحساب"
                required
              />
            </div>
            <div>
              <label className="text-gray-700 block mb-1">اسم صاحب الحساب</label>
              <input
                type="text"
                value={newBank.accountName}
                onChange={(e) => setNewBank({...newBank, accountName: e.target.value})}
                className="w-full bg-blue-50 text-gray-900 p-2 rounded border border-blue-200"
                placeholder="اسم صاحب الحساب"
              />
            </div>
            <div>
              <label className="text-gray-700 block mb-1">رابط شعار البنك</label>
              <input
                type="url"
                value={newBank.logo}
                onChange={(e) => setNewBank({...newBank, logo: e.target.value})}
                className="w-full bg-blue-50 text-gray-900 p-2 rounded border border-blue-200"
                placeholder="https://example.com/logo.png"
                pattern="https?://.+"
              />
              <p className="text-gray-400 text-xs mt-1">(يجب أن يبدأ الرابط بـ http:// أو https://)</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-700 block mb-1">تعليمات خاصة</label>
              <textarea
                value={newBank.instructions}
                onChange={(e) => setNewBank({...newBank, instructions: e.target.value})}
                className="w-full bg-blue-50 text-gray-900 p-2 rounded border border-blue-200"
                rows={2}
                placeholder="تعليمات خاصة بهذا البنك..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newBank.active}
                onChange={(e) => setNewBank({...newBank, active: e.target.checked})}
                className="bg-blue-200"
              />
              <label className="text-gray-700">حالة نشطة</label>
            </div>
            <button
              onClick={handleAddBank}
              className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors font-bold"
            >
              إضافة بنك
            </button>
          </div>
          {newBank.logo && (
            <div className="mt-4">
              <h3 className="text-gray-700 mb-2">معاينة الشعار:</h3>
              <div className="relative w-32 h-32 bg-white rounded p-1 border border-blue-100">
                <img 
                  src={newBank.logo} 
                  alt="شعار البنك" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = getFallbackImage('Invalid URL');
                  }}
                />
              </div>
            </div>
          )}
        </div>
        {/* قائمة البنوك */}
        <div className="bg-white p-6 rounded-lg mb-8 border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-primary">البنوك المضافة</h2>
          {config.banks.length === 0 ? (
            <p className="text-gray-400 text-center py-4">لا توجد بنوك مضافة حالياً</p>
          ) : (
            <div className="space-y-4">
              {config.banks.map((bank) => (
                <motion.div 
                  key={bank.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`bg-yellow-50 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-yellow-100 ${!bank.active && 'opacity-60'}`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <img 
                        src={bank.logo || getFallbackImage(bank.name)}
                        alt={bank.name} 
                        className="w-full h-full object-contain bg-white p-1 rounded border border-yellow-200"
                        onError={(e) => {
                          e.target.src = getFallbackImage(bank.name);
                        }}
                      />
                      {!bank.active && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 rounded"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-yellow-800">{bank.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <p className="text-gray-700 text-sm">
                          <span className="font-medium">رقم الحساب: <span dir='ltr'>{bank.accountNumber}</span> </span>
                        </p>
                        <p className="text-gray-700 text-sm">
                          <span className="font-medium">اسم الحساب:</span> {bank.accountName}
                        </p>
                        {bank.instructions && (
                          <p className="text-gray-600 text-sm md:col-span-2">
                            <span className="font-medium">تعليمات:</span> {bank.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => toggleBankStatus(bank.id)}
                      className={`px-3 py-1 rounded text-sm font-bold ${
                        bank.active 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {bank.active ? <><FiCheckCircle className="inline mr-1" /> نشط</> : <><FiXCircle className="inline mr-1" /> غير نشط</>}
                    </button>
                    <button
                      onClick={() => deleteBank(bank.id)}
                      className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm text-white font-bold flex items-center gap-1"
                    >
                      <FiTrash2 /> حذف
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={saveChanges}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors font-bold"
          >
            حفظ جميع التغييرات
          </button>
        </div>
      </div>
    </div>
  );
} 