"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FiLayers, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

function formatPrice(price) {
  if (!price) return '-';
  return Number(price).toLocaleString() + ' ج.س';
}

function PlanDetailsModal({ plan, onClose }) {
  if (!plan) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-sm relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 left-2 text-gray-500 hover:text-red-600 font-bold text-2xl">×</button>
        <h2 className="text-lg font-bold mb-3 text-center border-b pb-2">تفاصيل الخطة</h2>
        <div className="space-y-2 text-sm">
          <div><b>الاسم:</b> {plan.name}</div>
          <div><b>السعر:</b> {formatPrice(plan.price)}</div>
          <div><b>مميزات:</b> <ul className="list-disc ml-4">{plan.features?.map((f,i) => <li key={i}>{f}</li>)}</ul></div>
          <div><b>نشطة:</b> {plan.active ? 'نعم' : 'لا'}</div>
        </div>
      </div>
    </div>
  );
}

function PlanEditModal({ plan, onClose, onSave, show }) {
  if (show === false) return null;
  const [form, setForm] = useState(() => plan ? {
    name: plan.name || '',
    price: plan.price || '',
    priceBeforeDiscount: plan.priceBeforeDiscount || '',
    featureInput: '',
    features: Array.isArray(plan.features) ? plan.features : [],
    active: !!plan.active,
  } : {
    name: '', price: '', priceBeforeDiscount: '', featureInput: '', features: [], active: true
  });
  useEffect(() => {
    if (!plan) {
      setForm({ name: '', price: '', priceBeforeDiscount: '', featureInput: '', features: [], active: true });
    } else {
      setForm({
        name: plan.name || '',
        price: plan.price || '',
        priceBeforeDiscount: plan.priceBeforeDiscount || '',
        featureInput: '',
        features: Array.isArray(plan.features) ? plan.features : [],
        active: !!plan.active,
      });
    }
  }, [plan, show]);
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleAddFeature = e => {
    e.preventDefault();
    if (form.featureInput.trim()) {
      setForm(f => ({ ...f, features: [...f.features, f.featureInput.trim()], featureInput: '' }));
    }
  };
  const handleRemoveFeature = idx => {
    setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      name: form.name,
      price: Number(form.price),
      priceBeforeDiscount: form.priceBeforeDiscount ? Number(form.priceBeforeDiscount) : undefined,
      features: form.features,
      active: !!form.active,
    });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-sm relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 left-2 text-gray-500 hover:text-red-600 font-bold text-2xl">×</button>
        <h2 className="text-lg font-bold mb-3 text-center border-b pb-2">{plan ? 'تعديل الخطة' : 'إضافة خطة جديدة'}</h2>
        <form onSubmit={handleSubmit} className="space-y-2 text-sm">
          <div><label>الاسم: <input name="name" value={form.name} onChange={handleChange} className="border rounded p-1 w-full" required /></label></div>
          <div><label>السعر قبل الخصم: <input name="priceBeforeDiscount" type="number" value={form.priceBeforeDiscount} onChange={handleChange} className="border rounded p-1 w-full" /></label></div>
          <div><label>السعر: <input name="price" type="number" value={form.price} onChange={handleChange} className="border rounded p-1 w-full" required /></label></div>
          <div>
            <label>مميزات الاشتراك:</label>
            <div className="flex gap-2 mt-1">
              <input name="featureInput" value={form.featureInput} onChange={handleChange} className="border rounded p-1 flex-1" placeholder="أدخل ميزة جديدة" />
              <button onClick={handleAddFeature} className="bg-green-500 text-white px-2 py-1 rounded font-bold">إضافة</button>
            </div>
            <ul className="mt-2 flex flex-wrap gap-2">
              {form.features.map((f, idx) => (
                <li key={idx} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                  {f}
                  <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-red-500 text-xs font-bold">×</button>
                </li>
              ))}
            </ul>
          </div>
          <div><label>نشطة: <input type="checkbox" name="active" checked={form.active} onChange={handleChange} /></label></div>
          <div className="flex gap-2 mt-4 justify-end"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">حفظ</button></div>
        </form>
      </div>
    </div>
  );
}

export default function PlansSection() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editPlan, setEditPlan] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'plans'), (snapshot) => {
      setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleShowDetails = useCallback((plan) => setSelectedPlan(plan), []);
  const handleCloseDetails = useCallback(() => setSelectedPlan(null), []);
  const handleEdit = useCallback((plan) => setEditPlan(plan), []);
  const handleCloseEdit = useCallback(() => setEditPlan(null), []);
  const handleAdd = useCallback(() => setShowAddModal(true), []);
  const handleCloseAdd = useCallback(() => setShowAddModal(false), []);

  const handleSaveEdit = useCallback(async (form) => {
    if (!editPlan) return;
    await updateDoc(doc(db, 'plans', editPlan.id), form);
    setEditPlan(null);
  }, [editPlan]);

  const handleSaveAdd = useCallback(async (form) => {
    await addDoc(collection(db, 'plans'), form);
    setShowAddModal(false);
  }, []);

  const handleDelete = useCallback(async (plan) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخطة؟')) {
      await deleteDoc(doc(db, 'plans', plan.id));
    }
  }, []);

  const plansMemo = useMemo(() => plans, [plans]);

  // تصفية الخطط حسب البحث
  const filteredPlans = plans.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">إدارة الخطط</h2>
        <input
          type="text"
          placeholder="بحث باسم الخطة أو الوصف..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        />
      </div>
      <div className="flex justify-between items-center mb-6">
        <button onClick={handleAdd} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition"><FiPlus /> إضافة خطة جديدة</button>
      </div>
      {loading ? (
        <div className="text-center py-12 text-lg text-gray-500">جاري تحميل الخطط...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <FiLayers className="text-purple-600 text-2xl" />
                <span className="font-bold text-lg">{plan.name}</span>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${plan.active ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-500"}`}>{plan.active ? "نشطة" : "غير نشطة"}</span>
              </div>
              <div className="text-gray-600">السعر: {formatPrice(plan.price)}</div>
              <div className="text-gray-500 text-sm">مميزات: {plan.features?.slice(0,2).join('، ')}{plan.features?.length > 2 ? ' ...' : ''}</div>
              <div className="flex gap-2 mt-4">
                <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-bold hover:bg-gray-300 transition" onClick={() => handleShowDetails(plan)}>تفاصيل</button>
                <button className="bg-yellow-400 text-white px-3 py-1 rounded-lg font-bold hover:bg-yellow-500 transition flex items-center gap-1" onClick={() => handleEdit(plan)}><FiEdit2 />تعديل</button>
                <button className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-700 transition flex items-center gap-1" onClick={() => handleDelete(plan)}><FiTrash2 />حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <PlanDetailsModal plan={selectedPlan} onClose={handleCloseDetails} />
      <PlanEditModal plan={editPlan} onClose={handleCloseEdit} onSave={handleSaveEdit} show={!!editPlan} />
      <PlanEditModal plan={null} onClose={handleCloseAdd} onSave={handleSaveAdd} show={showAddModal} />
    </div>
  );
} 