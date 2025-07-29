"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FiUsers } from "react-icons/fi";
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const UserCard = React.memo(function UserCard({ user, onShowDetails, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-100">
      <div className="flex items-center gap-3 mb-2">
        <FiUsers className="text-blue-600 text-2xl" />
        <span className="font-bold text-lg">{user.name || user.displayName || user.email}</span>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${user.subscriptionStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{user.subscriptionStatus === "paid" ? "مدفوع" : "تجريبي"}</span>
      </div>
      <div className="text-gray-600">{user.email}</div>
      <div className="text-gray-500 text-sm">تاريخ التسجيل: {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : "-"}</div>
      <div className="text-gray-500 text-sm">الدور: {user.role || 'غير محدد'}</div>
      <div className="text-gray-500 text-sm">الحالة: {user.isActive ? 'مفعل' : 'غير مفعل'}</div>
      <div className="flex gap-2 mt-4">
        <button onClick={() => onShowDetails(user)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 transition">تفاصيل</button>
        <button onClick={() => onEdit(user)} className="bg-yellow-400 text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 transition">تعديل</button>
        <button onClick={() => onDelete(user)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition">حذف</button>
      </div>
    </div>
  );
});

function UserDetailsModal({ user, onClose }) {
  if (!user) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-sm relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 left-2 text-gray-500 hover:text-red-600 font-bold text-2xl">×</button>
        <h2 className="text-lg font-bold mb-3 text-center border-b pb-2">تفاصيل المستخدم</h2>
        <div className="space-y-2 text-sm">
          <div><b>الاسم:</b> {user.name || user.displayName || user.email}</div>
          <div><b>البريد:</b> {user.email}</div>
          <div><b>الدور:</b> {user.role}</div>
          <div><b>حالة الاشتراك:</b> {user.subscriptionStatus}</div>
          <div><b>تاريخ التسجيل:</b> {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : "-"}</div>
          <div><b>الحالة:</b> {user.isActive ? 'مفعل' : 'غير مفعل'}</div>
          <div><b>بيانات المتجر:</b> {user.storeData ? JSON.stringify(user.storeData) : '—'}</div>
        </div>
      </div>
    </div>
  );
}

function formatDate(ts) {
  if (!ts) return '-';
  if (typeof ts === 'string') return ts;
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString('ar-EG');
  return new Date(ts).toLocaleString('ar-EG');
}

function UserEditModal({ user, onClose, onSave }) {
  if (!user) return null;
  const [form, setForm] = React.useState(() => ({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'user',
    isActive: !!user.isActive,
    subscriptionStatus: user.subscriptionStatus || 'trial',
    storeData: user.storeData || {},
  }));
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleStoreDataChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, storeData: { ...f.storeData, [name]: value } }));
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-sm relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 left-2 text-gray-500 hover:text-red-600 font-bold text-2xl">×</button>
        <h2 className="text-lg font-bold mb-3 text-center border-b pb-2">تعديل المستخدم</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-2 text-sm">
          <div><label>الاسم: <input name="name" value={form.name} onChange={handleChange} className="border rounded p-1 w-full" /></label></div>
          <div><label>البريد: <input name="email" value={form.email} onChange={handleChange} className="border rounded p-1 w-full" /></label></div>
          <div><label>الهاتف: <input name="phone" value={form.phone} onChange={handleChange} className="border rounded p-1 w-full" /></label></div>
          <div><label>الدور: <select name="role" value={form.role} onChange={handleChange} className="border rounded p-1 w-full"><option value="admin">أدمن</option><option value="premium_user">مدفوع</option><option value="trial_user">تجريبي</option><option value="user">عادي</option></select></label></div>
          <div><label>مفعل: <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /></label></div>
          <div><label>حالة الاشتراك: <select name="subscriptionStatus" value={form.subscriptionStatus} onChange={handleChange} className="border rounded p-1 w-full"><option value="trial">تجريبي</option><option value="paid">مدفوع</option><option value="expired">منتهي</option></select></label></div>
          <div className="border-t pt-2 mt-2"><b>بيانات المتجر:</b></div>
          <div><label>اسم المتجر: <input name="storeName" value={form.storeData.storeName || ''} onChange={handleStoreDataChange} className="border rounded p-1 w-full" /></label></div>
          <div><label>هاتف المتجر: <input name="storePhone" value={form.storeData.storePhone || ''} onChange={handleStoreDataChange} className="border rounded p-1 w-full" /></label></div>
          <div><label>عنوان المتجر: <input name="storeAddress" value={form.storeData.storeAddress || ''} onChange={handleStoreDataChange} className="border rounded p-1 w-full" /></label></div>
          <div><label>موقع المتجر: <input name="storeWebsite" value={form.storeData.storeWebsite || ''} onChange={handleStoreDataChange} className="border rounded p-1 w-full" /></label></div>
          <div><label>العملة: <input name="currency" value={form.storeData.currency || ''} onChange={handleStoreDataChange} className="border rounded p-1 w-full" /></label></div>
          <div><label>اللغة: <input name="language" value={form.storeData.language || ''} onChange={handleStoreDataChange} className="border rounded p-1 w-full" /></label></div>
          <div className="flex gap-2 mt-4 justify-end"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">حفظ</button></div>
        </form>
      </div>
    </div>
  );
}

export default function AccountsSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleShowDetails = useCallback((user) => setSelectedUser(user), []);
  const handleCloseModal = useCallback(() => setSelectedUser(null), []);
  const handleEdit = useCallback((user) => setEditUser(user), []);
  const handleSaveEdit = useCallback(async (form) => {
    if (!editUser) return;
    // تحديث بيانات المستخدم في فايربيز
    const { id, ...rest } = editUser;
    await import('firebase/firestore').then(({ doc, updateDoc }) =>
      updateDoc(doc(db, 'users', id), {
        ...form,
        storeData: { ...form.storeData },
      })
    );
    setEditUser(null);
  }, [editUser]);
  const handleDelete = useCallback(async (user) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', user.id));
    }
  }, []);

  // تصفية المستخدمين حسب البحث
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const userCards = useMemo(() => filteredUsers.map(user => (
    <UserCard key={user.id} user={user} onShowDetails={handleShowDetails} onEdit={handleEdit} onDelete={handleDelete} />
  )), [filteredUsers, handleShowDetails, handleEdit, handleDelete]);

  return (
    <div className="px-2 sm:px-4 md:px-8 py-2 md:py-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-primary">إدارة الحسابات</h2>
        <input
          type="text"
          placeholder="بحث بالاسم أو البريد أو الهاتف..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:w-64"
        />
      </div>
      <h3 className="text-xl font-bold mb-6">كل الحسابات</h3>
      {loading ? (
        <div className="text-center py-12 text-lg text-gray-500">جاري تحميل الحسابات...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {userCards}
        </div>
      )}
      <UserDetailsModal user={selectedUser} onClose={handleCloseModal} />
      <UserEditModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSaveEdit} />
    </div>
  );
} 