import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { FiStar, FiCheck, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { useToast } from '@/hooks/use-toast';

export default function ContactRequestsSection() {
  const [contactRequests, setContactRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const { toast } = useToast();

  // إعدادات معلومات التواصل
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  // جلب معلومات التواصل عند التحميل
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const contactDoc = await getDoc(doc(db, 'settings', 'contact'));
        if (contactDoc.exists()) {
          setStorePhone(contactDoc.data().storePhone || '');
          setStoreAddress(contactDoc.data().storeAddress || '');
          setStoreEmail(contactDoc.data().storeEmail || '');
        }
      } catch (e) {}
    };
    fetchContact();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'contactRequests'));
        // فلترة طلبات التواصل فقط (بدون التقييمات)
        const contactRequestsData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(request => !request.rating); // استبعاد التقييمات التي تحتوي على rating
        
        setContactRequests(contactRequestsData);
      } catch (e) {
        toast({
          title: 'خطأ في تحميل البيانات',
          description: 'حدث خطأ أثناء تحميل طلبات التواصل',
          variant: 'destructive',
        });
      }
      setLoading(false);
    };
    fetchRequests();
  }, [toast]);

  const handleMarkAsProcessed = async (requestId) => {
    setUpdating(prev => ({ ...prev, [requestId]: true }));
    try {
      await updateDoc(doc(db, 'contactRequests', requestId), {
        status: 'processed',
        updatedAt: new Date(),
      });
      
      setContactRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'processed', updatedAt: new Date() }
            : req
        )
      );

      toast({
        title: 'تم معالجة الطلب',
        description: 'تم تحديث حالة الطلب إلى معالج',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث حالة الطلب',
        variant: 'destructive',
      });
    } finally {
      setUpdating(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleDelete = async (requestId) => {
    try {
      await deleteDoc(doc(db, 'contactRequests', requestId));
      setContactRequests(prev => prev.filter(req => req.id !== requestId));
      toast({
        title: 'تم حذف الطلب',
        description: 'تم حذف طلب التواصل بنجاح',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'خطأ في الحذف',
        description: 'حدث خطأ أثناء حذف الطلب',
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-400">لا يوجد تقييم</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <FiStar 
            key={star} 
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
        <span className="text-sm text-gray-600 mr-2">({rating}/5)</span>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
          <FiCheck className="w-3 h-3 ml-1" /> تم المعالجة
        </span>;
      case 'approved':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
          <FiEye className="w-3 h-3 ml-1" /> منشور
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
          <FiX className="w-3 h-3 ml-1" /> مرفوض
        </span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
          <FiEyeOff className="w-3 h-3 ml-1" /> في الانتظار
        </span>;
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
      {/* إعدادات معلومات التواصل */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-blue-700">إعدادات معلومات التواصل</h2>
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
        <Button onClick={handleSaveContact} disabled={savingContact} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold">
          {savingContact ? 'جاري الحفظ...' : 'حفظ بيانات التواصل'}
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-green-700">طلبات التواصل من العملاء</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">جاري تحميل الطلبات...</div>
        ) : contactRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">لا توجد طلبات تواصل حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactRequests.map(req => (
              <div key={req.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{req.name || 'غير محدد'}</h3>
                    <p className="text-sm text-gray-600">{req.email || 'غير محدد'}</p>
                    <p className="text-sm text-gray-600">{req.phone || 'غير محدد'}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusBadge(req.status)}
                    <p className="text-xs text-gray-500 mt-1">
                      {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleString('ar-EG') : '-'}
                    </p>
                  </div>
                </div>
                
                {req.rating && (
                  <div className="mb-3">
                    {renderStars(req.rating)}
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {req.message || 'لا توجد رسالة'}
                  </p>
                </div>
                
                <div className="flex gap-2 justify-end">
                  {req.status !== 'processed' && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsProcessed(req.id)}
                      disabled={updating[req.id]}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <FiCheck className="w-4 h-4 ml-1" />
                      {updating[req.id] ? 'جاري...' : 'تم المعالجة'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(req.id)}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <FiX className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 