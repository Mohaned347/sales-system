import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export default function SettingsSection() {
  // إعدادات الفترة التجريبية
  const [totalDays, setTotalDays] = useState(14);
  const [loading, setLoading] = useState(false);

  // إعدادات التواصل
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  // طلبات التواصل
  const [contactRequests, setContactRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    // جلب إعدادات الفترة التجريبية
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'trial'));
        if (settingsDoc.exists()) {
          setTotalDays(settingsDoc.data().totalDays || 14);
        }
        // جلب إعدادات التواصل
        const contactDoc = await getDoc(doc(db, 'settings', 'contact'));
        if (contactDoc.exists()) {
          setStorePhone(contactDoc.data().storePhone || '');
          setStoreAddress(contactDoc.data().storeAddress || '');
          setStoreEmail(contactDoc.data().storeEmail || '');
        }
      } catch (e) {}
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // جلب طلبات التواصل
    const fetchRequests = async () => {
      setLoadingRequests(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'contactRequests'));
        setContactRequests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {}
      setLoadingRequests(false);
    };
    fetchRequests();
  }, []);

  const handleSaveTrial = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'trial'), { totalDays });
      toast({ title: 'تم حفظ إعدادات الفترة التجريبية بنجاح' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async () => {
    setSavingContact(true);
    try {
      await setDoc(doc(db, 'settings', 'contact'), {
        storePhone,
        storeAddress,
        storeEmail
      });
      toast({ title: 'تم حفظ بيانات التواصل بنجاح' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setSavingContact(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* إعدادات الفترة التجريبية */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-yellow-700">إعدادات الفترة التجريبية</h2>
        <div className="flex items-center gap-4 mb-4">
          <label className="font-medium text-gray-700">عدد أيام الفترة التجريبية:</label>
          <input type="number" min={1} max={60} value={totalDays} onChange={e => setTotalDays(Number(e.target.value))} className="border rounded p-2 w-24 text-center" />
        </div>
        <button onClick={handleSaveTrial} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded font-bold">
          {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* إعدادات التواصل */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-blue-700">إعدادات التواصل</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="font-medium text-gray-700">رقم الهاتف:</label>
            <input type="text" value={storePhone} onChange={e => setStorePhone(e.target.value)} className="border rounded p-2 w-full mt-1" />
          </div>
          <div className="flex-1">
            <label className="font-medium text-gray-700">العنوان:</label>
            <input type="text" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} className="border rounded p-2 w-full mt-1" />
          </div>
          <div className="flex-1">
            <label className="font-medium text-gray-700">البريد الإلكتروني:</label>
            <input type="email" value={storeEmail} onChange={e => setStoreEmail(e.target.value)} className="border rounded p-2 w-full mt-1" />
          </div>
        </div>
        <button onClick={handleSaveContact} disabled={savingContact} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold">
          {savingContact ? 'جاري الحفظ...' : 'حفظ بيانات التواصل'}
        </button>
      </div>

      {/* طلبات التواصل */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-green-700">طلبات التواصل من العملاء</h2>
        {loadingRequests ? (
          <div className="text-center py-8 text-gray-500">جاري تحميل الطلبات...</div>
        ) : contactRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">لا توجد طلبات تواصل حالياً</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-right border">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-4 py-2 border">الاسم</th>
                  <th className="px-4 py-2 border">البريد</th>
                  <th className="px-4 py-2 border">الهاتف</th>
                  <th className="px-4 py-2 border">الرسالة</th>
                  <th className="px-4 py-2 border">تاريخ الإرسال</th>
                </tr>
              </thead>
              <tbody>
                {contactRequests.map(req => (
                  <tr key={req.id} className="hover:bg-green-50">
                    <td className="px-4 py-2 border">{req.name || '-'}</td>
                    <td className="px-4 py-2 border">{req.email || '-'}</td>
                    <td className="px-4 py-2 border">{req.phone || '-'}</td>
                    <td className="px-4 py-2 border">{req.message || '-'}</td>
                    <td className="px-4 py-2 border">{req.createdAt?.toDate ? req.createdAt.toDate().toLocaleString('ar-EG') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 