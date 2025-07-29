"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FiCreditCard } from "react-icons/fi";
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import PaymentInvoice from '@/components/payment-invoice';

function formatDate(ts) {
  if (!ts) return '-';
  if (typeof ts === 'string') return ts;
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString('ar-EG');
  return new Date(ts).toLocaleString('ar-EG');
}

function PaymentDetailsModal({ payment, onClose }) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  if (!payment) return null;
  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      // تحديث حالة الدفع
      await updateDoc(doc(db, 'payments', payment.id), { status: 'paid' });
      // تحديث حساب المستخدم المرتبط
      if (payment.userId) {
        await updateDoc(doc(db, 'users', payment.userId), {
          role: 'premium_user',
          subscriptionStatus: 'paid',
        });
      }
      toast({ title: 'تم تأكيد الدفع وتفعيل الحساب بنجاح', variant: 'success' });
      onClose();
    } catch (error) {
      toast({ title: 'حدث خطأ أثناء تأكيد الدفع', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-sm relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 left-2 text-gray-500 hover:text-red-600 font-bold text-2xl">×</button>
        <h2 className="text-lg font-bold mb-3 text-center border-b pb-2">تفاصيل الدفع</h2>
        <div className="space-y-2 text-sm">
          <div><b>الاسم:</b> {payment.name || '-'}</div>
          <div><b>البريد:</b> {payment.email || '-'}</div>
          <div><b>الهاتف:</b> {payment.phone || '-'}</div>
          <div><b>الخطة:</b> {payment.planName || '-'}</div>
          <div><b>المبلغ:</b> {payment.amount?.toLocaleString() || '-'} ج.س</div>
          <div><b>رقم حساب البنك:</b> {payment.bankAccount || '-'}</div>
          <div><b>رقم العملية:</b> {payment.transactionId || '-'}</div>
          <div><b>الحالة:</b> {payment.status === 'paid' ? 'مدفوع' : 'قيد المراجعة'}</div>
          <div><b>تاريخ الإرسال:</b> {formatDate(payment.createdAt)}</div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => {
              onClose();
              // عرض الفاتورة
              setTimeout(() => {
                const event = new CustomEvent('showInvoice', { detail: payment });
                window.dispatchEvent(event);
              }, 100);
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
          >
            عرض الفاتورة
          </button>
          {payment.status !== 'paid' && (
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
            >
              {isProcessing ? 'جاري التأكيد...' : 'تأكيد الدفع'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentsSection() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoicePayment, setInvoicePayment] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'payments'), (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // مستمع حدث عرض الفاتورة
  useEffect(() => {
    const handleShowInvoice = (event) => {
      setInvoicePayment(event.detail);
      setShowInvoice(true);
    };

    window.addEventListener('showInvoice', handleShowInvoice);
    return () => window.removeEventListener('showInvoice', handleShowInvoice);
  }, []);

  const handleDetails = useCallback((payment) => setSelectedPayment(payment), []);
  const handleCloseModal = useCallback(() => setSelectedPayment(null), []);
  const handleShowInvoice = useCallback((payment) => {
    setInvoicePayment(payment);
    setShowInvoice(true);
  }, []);
  const handleCloseInvoice = useCallback(() => {
    setShowInvoice(false);
    setInvoicePayment(null);
  }, []);

  const paymentsMemo = useMemo(() => payments, [payments]);
  const archivePayments = useMemo(() => payments.filter(p => p.status === 'paid'), [payments]);
  const pendingPayments = useMemo(() => payments.filter(p => p.status !== 'paid'), [payments]);

  // تصفية المدفوعات حسب البحث
  const filteredPayments = payments.filter(p =>
    p.userName?.toLowerCase().includes(search.toLowerCase()) ||
    p.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
    p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
    p.bankAccount?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-2 sm:px-4 md:px-8 py-2 md:py-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-primary">إدارة المدفوعات</h2>
        <input
          type="text"
          placeholder="بحث بالاسم أو البريد أو رقم العملية أو الحساب..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:w-64"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-bold border ${!showArchive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setShowArchive(false)}
        >
          المدفوعات قيد المراجعة
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-bold border ${showArchive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setShowArchive(true)}
        >
          الأرشيف (المدفوعات المؤكدة)
        </button>
      </div>
      {loading ? (
        <div className="text-center py-12 text-lg text-gray-500">جاري تحميل المدفوعات...</div>
      ) : showArchive ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {archivePayments.length === 0 && <div className="col-span-full text-center text-gray-400">لا يوجد مدفوعات مؤرشفة بعد.</div>}
          {archivePayments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <FiCreditCard className="text-green-600 text-2xl" />
                <span className="font-bold text-lg">{payment.name || '-'}</span>
                <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">مدفوع</span>
              </div>
              <div className="text-gray-600">الخطة: {payment.planName || '-'}</div>
              <div className="text-gray-600">المبلغ: {payment.amount?.toLocaleString() || '-'} ج.س</div>
              <div className="text-gray-500 text-sm">رقم حساب البنك: {payment.bankAccount || '-'}</div>
              <div className="text-gray-500 text-sm">رقم العملية: {payment.transactionId || '-'}</div>
              <div className="text-gray-500 text-sm">تاريخ الإرسال: {formatDate(payment.createdAt)}</div>
              <div className="flex gap-2 mt-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition" onClick={() => handleDetails(payment)}>
                  تفاصيل الدفع
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition" onClick={() => handleShowInvoice(payment)}>
                  عرض الفاتورة
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {pendingPayments.length === 0 && <div className="col-span-full text-center text-gray-400">لا يوجد مدفوعات قيد المراجعة حالياً.</div>}
          {pendingPayments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <FiCreditCard className="text-green-600 text-2xl" />
                <span className="font-bold text-lg">{payment.userName || payment.name || '-'}</span>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${payment.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{payment.status === "paid" ? "مدفوع" : "قيد المراجعة"}</span>
              </div>
              <div className="text-gray-600">الخطة: {payment.planName || '-'}</div>
              <div className="text-gray-600">المبلغ: {payment.amount?.toLocaleString() || '-'} ج.س</div>
              <div className="text-gray-500 text-sm">رقم حساب البنك: {payment.bankAccount || '-'}</div>
              <div className="text-gray-500 text-sm">رقم العملية: {payment.transactionId || '-'}</div>
              <div className="text-gray-500 text-sm">تاريخ الإرسال: {formatDate(payment.createdAt)}</div>
              <div className="flex gap-2 mt-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition" onClick={() => handleDetails(payment)}>
                  تفاصيل الدفع
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition" onClick={() => handleShowInvoice(payment)}>
                  عرض الفاتورة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <PaymentDetailsModal payment={selectedPayment} onClose={handleCloseModal} />
      {/* عرض الفاتورة */}
      {showInvoice && invoicePayment && (
        <PaymentInvoice 
          payment={invoicePayment} 
          onClose={handleCloseInvoice} 
        />
      )}
    </div>
  );
} 