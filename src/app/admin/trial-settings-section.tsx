import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export default function TrialSettingsSection() {
  const [totalDays, setTotalDays] = useState(14);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'trial'));
        if (settingsDoc.exists()) {
          setTotalDays(settingsDoc.data().totalDays || 14);
        }
      } catch (e) {}
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
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

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-yellow-700">إعدادات الفترة التجريبية</h2>
      <div className="flex items-center gap-4 mb-4">
        <label className="font-medium text-gray-700">عدد أيام الفترة التجريبية:</label>
        <input type="number" min={1} max={60} value={totalDays} onChange={e => setTotalDays(Number(e.target.value))} className="border rounded p-2 w-24 text-center" />
      </div>
      <button onClick={handleSave} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded font-bold">
        {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </div>
  );
} 