import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Rocket } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import PaymentInvoice from '@/components/payment-invoice';

interface Plan {
  id: string;
  name: string;
  price: number;
  description?: string;
  features?: string[];
  trial?: string;
  active?: boolean;
}

const features = [
  'إدارة شاملة للمبيعات والفواتير',
  'نظام متكامل لتتبع المخزون والمنتجات',
  'لوحة تحكم وتقارير تحليلية ذكية',
  'إدارة علاقات العملاء (CRM) مبسطة',
  'دعم فني متكامل عبر البريد الإلكتروني والهاتف',
  'تحديثات مستمرة وميزات جديدة بانتظام',
  'عدد غير محدود من المستخدمين والمنتجات',
  'لا توجد أي رسوم خفية أو اشتراكات شهرية',
];

function formatPrice(price: number | undefined) {
  if (!price) return '-';
  return Number(price).toLocaleString() + ' ج.س';
}

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  plan: Plan | null;
};

function PaymentModal({ open, onClose, plan }: PaymentModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [banks, setBanks] = useState<any[]>([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [form, setForm] = useState({
    planId: plan?.id || '',
    planName: plan?.name || '',
    selectedBank: '',
    transactionId: '',
    amount: plan?.price ? String(plan.price) : '',
  });

  // جلب بيانات البنوك
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const banksSnapshot = await getDocs(collection(db, 'banks'));
        let banksData = banksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // إذا لم توجد بنوك نشطة، أضف بنك افتراضي
        if (!banksData.some(bank => bank.active)) {
          banksData = [
            {
              id: 'default',
              name: 'بنك الخرطوم',
              accountNumber: '22345343',
              accountName: 'متجر مونتي جو',
              instructions: 'يرجى التحويل إلى أحد الحسابات التالية مع كتابة رقم الطلب في وصف التحويل',
              active: true,
            }
          ];
        }
        setBanks(banksData);
      } catch (error) {
        console.error('Error fetching banks:', error);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    setForm(f => ({
      ...f,
      planId: plan?.id || '',
      planName: plan?.name || '',
      amount: plan?.price ? String(plan.price) : '',
    }));
  }, [plan, user]);
  if (!open) return null;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!form.selectedBank) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى اختيار البنك',
        variant: 'destructive',
      });
      return;
    }

    // تحقق من تكرار رقم العملية وبيانات العميل
    const { getDocs } = await import('firebase/firestore');
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      where('transactionId', '==', form.transactionId),
      where('userEmail', '==', user?.email || ''),
    );
    const q2 = query(
      paymentsRef,
      where('transactionId', '==', form.transactionId),
      where('userPhone', '==', user?.storeData?.storePhone || ''),
    );
    const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)]);
    if (!snap1.empty || !snap2.empty) {
      toast({
        title: 'رقم العملية مستخدم مسبقاً',
        description: 'تم استخدام رقم العملية هذا مسبقاً لنفس البريد أو الهاتف. يرجى التأكد من صحة البيانات.',
        variant: 'destructive',
      });
      return;
    }

    const selectedBankData = banks.find(bank => bank.id === form.selectedBank);
    
    // أضف بيانات الدفع إلى فايربيز
    const { addDoc, serverTimestamp } = await import('firebase/firestore');
    const paymentRef = await addDoc(collection(db, 'payments'), {
      planId: form.planId,
      planName: form.planName,
      bankId: form.selectedBank,
      bankName: selectedBankData?.name || '',
      bankAccount: selectedBankData?.accountNumber || '',
      transactionId: form.transactionId,
      amount: Number(form.amount),
      userId: user?.uid || null,
      userName: user?.displayName || user?.storeData?.storeName || '',
      userEmail: user?.email || '',
      userPhone: user?.storeData?.storePhone || '',
      createdAt: serverTimestamp(),
      status: 'pending',
    });

    // إعداد بيانات الفاتورة
    const invoiceData = {
      id: paymentRef.id,
      planName: form.planName,
      amount: Number(form.amount),
      bankName: selectedBankData?.name || '',
      bankAccount: selectedBankData?.accountNumber || '',
      transactionId: form.transactionId,
      userName: user?.displayName || user?.storeData?.storeName || '',
      userEmail: user?.email || '',
      userPhone: user?.storeData?.storePhone || '',
      createdAt: new Date(),
    };

    setPaymentData(invoiceData);
    setShowInvoice(true);
    
    toast({
      title: 'تم إرسال طلب الدفع',
      description: 'تم استلام طلبك وهو قيد المعالجة. سيتم تفعيل حسابك بعد التأكد من الدفع.',
      variant: 'default',
    });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-0 w-full max-w-lg relative max-h-[90vh] overflow-y-auto border-2 border-primary/20 animate-fade-in">
        <div className="bg-gradient-to-r from-primary to-yellow-400 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="w-8 h-8 text-white drop-shadow" />
            <h2 className="text-2xl font-bold text-white">طلب الاشتراك في {plan?.name}</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-200 font-bold text-3xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 text-base px-8 py-8">
          {/* عرض بيانات العميل */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg text-gray-800 mb-3">بيانات العميل</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">الاسم:</span> {user?.displayName || user?.storeData?.storeName || 'غير محدد'}</div>
              <div><span className="font-semibold">البريد الإلكتروني:</span> {user?.email || 'غير محدد'}</div>
              <div><span className="font-semibold">الهاتف:</span> {user?.storeData?.storePhone || 'غير محدد'}</div>
            </div>
          </div>

          {/* عرض بيانات الخطة */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg text-blue-800 mb-3">تفاصيل الخطة</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">الخطة:</span> {plan?.name || ''}</div>
              <div><span className="font-semibold">السعر:</span> {plan?.price ? `${plan.price} جنيه سوداني` : ''}</div>
            </div>
          </div>

          {/* عرض بيانات البنوك */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg text-green-800 mb-3">حسابات البنوك المتاحة</h3>
            <div className="space-y-3">
              {banks.filter(bank => bank.active).length > 0 ? (
                banks.filter(bank => bank.active).map(bank => (
                  <div key={bank.id} className="border border-green-200 rounded-lg p-3 bg-white">
                    <div className="font-semibold text-green-800">{bank.name}</div>
                    <div className="text-sm text-gray-600">رقم الحساب: <span dir="ltr" className="font-mono">{bank.accountNumber}</span></div>
                    <div className="text-sm text-gray-600">اسم الحساب: {bank.accountName}</div>
                    {bank.instructions && (
                      <div className="text-sm text-gray-600 mt-2">تعليمات: {bank.instructions}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-600">
                  لا توجد حسابات بنوك متاحة حالياً. يرجى التواصل مع الإدارة.
                </div>
              )}
            </div>
          </div>

          {/* نموذج الدفع */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">اختر البنك:
                <select 
                  name="selectedBank" 
                  value={form.selectedBank} 
                  onChange={handleChange}
                  className="border-2 border-primary/30 rounded-lg p-3 w-full focus:ring-2 focus:ring-primary/30 transition" 
                  required
                  disabled={banks.filter(bank => bank.active).length === 0}
                >
                  <option value="">اختر البنك</option>
                  {banks.filter(bank => bank.active).map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} - {bank.accountNumber}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">رقم العملية:
                <input 
                  name="transactionId" 
                  value={form.transactionId} 
                  onChange={handleChange} 
                  className="border-2 border-primary/30 rounded-lg p-3 w-full focus:ring-2 focus:ring-primary/30 transition" 
                  placeholder="أدخل رقم العملية من البنك"
                  required 
                  disabled={banks.filter(bank => bank.active).length === 0}
                />
              </label>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">المبلغ المحول:
                <input 
                  name="amount" 
                  type="number" 
                  value={form.amount} 
                  onChange={handleChange} 
                  className="border-2 border-primary/30 rounded-lg p-3 w-full focus:ring-2 focus:ring-primary/30 transition" 
                  placeholder="أدخل المبلغ المحول"
                  required 
                  disabled={banks.filter(bank => bank.active).length === 0}
                />
              </label>
            </div>
          </div>
                      <div className="flex gap-4 mt-8 justify-end">
              <button 
                type="submit" 
                className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all w-full ${
                  banks.filter(bank => bank.active).length === 0
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-yellow-400 text-white hover:from-yellow-500 hover:to-primary'
                }`}
                disabled={banks.filter(bank => bank.active).length === 0}
              >
                {banks.filter(bank => bank.active).length === 0 ? 'لا توجد بنوك متاحة' : 'إرسال الطلب'}
              </button>
            </div>
        </form>
      </div>

      {/* عرض الفاتورة */}
      {showInvoice && paymentData && (
        <PaymentInvoice 
          payment={paymentData} 
          onClose={() => {
            setShowInvoice(false);
            setPaymentData(null);
            onClose();
          }} 
        />
      )}
    </div>
  );
}

interface PricingProps {
  openModal?: boolean;
  onCloseModal?: () => void;
}

export default function Pricing({ openModal = false, onCloseModal }: PricingProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPayment, setShowPayment] = useState<boolean>(openModal);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'plans'), (snapshot) => {
      setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (openModal) setShowPayment(true);
  }, [openModal]);

  const handleSubscribe = useCallback((plan: Plan) => {
    if (user) {
      if (user.role === 'trial_user') {
        setSelectedPlan(plan);
        setShowPayment(true);
      } else {
        router.push('/dashboard/sales');
      }
    } else {
      router.push('/login');
    }
  }, [user, router]);
  const handleClosePayment = useCallback(() => {
    setShowPayment(false);
    setSelectedPlan(null);
    if (onCloseModal) onCloseModal();
  }, [onCloseModal]);

  return (
    <section id="pricing" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">
            استثمار واحد لنمو لا محدود
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            نؤمن بالبساطة والشفافية. احصل على جميع ميزات "مبيعاتي" القوية بسعر ثابت وواضح، بدون أي تعقيدات أو تكاليف إضافية.
          </p>
        </div>
        {loading ? (
          <div className="text-center py-16 text-lg text-gray-500">جاري تحميل الخطط...</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {plans.filter(p => p.active).map((plan) => (
              <Card key={plan.id} className="w-full max-w-md shadow-2xl shadow-primary/20 border-primary ring-2 ring-primary/50 flex flex-col transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-secondary/30">
                <CardHeader className="text-center p-8 rounded-t-lg">
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 border-4 border-primary/20">
                    <Rocket className="w-12 h-12 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {plan.description || 'كل ما تحتاجه لإدارة أعمالك بكفاءة وفعالية، في باقة واحدة متكاملة.'}
                  </CardDescription>
                  <div className="flex flex-col items-center justify-center gap-1 pt-6">
                    {plan.priceBeforeDiscount && plan.priceBeforeDiscount > plan.price && (
                      <span className="text-lg font-bold text-gray-400 line-through mb-1 animate-fade-in-slow">
                        {formatPrice(plan.priceBeforeDiscount)}
                      </span>
                    )}
                    <span className="text-5xl font-extrabold text-primary drop-shadow-sm bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent animate-fade-in">
                      {formatPrice(plan.price)}
                    </span>
                  </div>
            
                </CardHeader>
                <CardContent className="p-8">
                  <ul className="space-y-4">
                    {(plan.features || features).map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-8 pt-0 mt-auto">
                  <Button className="w-full text-lg py-6 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow" onClick={() => handleSubscribe(plan)}>
                    اشترك الآن
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
                <PaymentModal open={showPayment} onClose={handleClosePayment} plan={selectedPlan} />
      </div>
    </section>
  );
}
