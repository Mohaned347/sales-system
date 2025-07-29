"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import type { Product, Sale, AppContextType, Testimonial, SaleReturn } from '@/types';
import { toast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  writeBatch, 
  runTransaction,
  documentId,
  query,
  where,
  getDoc,
  increment,
  serverTimestamp,
  orderBy,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';

// إضافة الأنواع الجديدة
interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  purchaseCount: number;
  lastPurchase?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Invoice {
  id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    address?: string;
  };
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  notes?: string;
  status: 'paid' | 'pending';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AnalyticsReport {
  id: string;
  type: 'sales' | 'inventory' | 'customer';
  data: any;
  createdAt: Date;
}

interface CustomerServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'trial_user' | 'premium_user' | 'admin';
  trialEndDate?: Date;
  storeData?: {
    name: string;
    address: string;
    phone: string;
  };
}

// تحديث AppContextType
interface ExtendedAppContextType extends AppContextType {
  // إضافة الحالات الجديدة
  customers: Customer[];
  invoices: Invoice[];
  analyticsReports: AnalyticsReport[];
  customerServiceRequests: CustomerServiceRequest[];
  user: User | null;
  userData: any;
  selectedCustomer: Customer | null;
  
  // دوال إدارة العملاء
  addCustomer: (customerData: Omit<Customer, 'id' | 'totalSpent' | 'purchaseCount' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // دوال إدارة الفواتير
  addInvoice: (invoiceData: Omit<Invoice, 'id' | 'date' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  addInvoicesale: (invoiceData: any) => Promise<string>;
  
  // دوال التحليلات
  getSalesAnalytics: (period?: 'daily' | 'monthly' | 'yearly') => any;
  getInventoryReport: () => any;
  getCustomerAnalytics: () => any;
  
  // دوال إدارة العملاء المحسنة
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  
  // دوال إدارة الفواتير المحسنة
  updateInvoice: (id: string, invoiceData: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoiceById: (id: string) => Invoice | undefined;
  
  // دوال إدارة خدمة العملاء
  addCustomerServiceRequest: (requestData: Omit<CustomerServiceRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCustomerServiceRequest: (id: string, requestData: Partial<CustomerServiceRequest>) => Promise<void>;
  deleteCustomerServiceRequest: (id: string) => Promise<void>;
  
  // دوال إدارة المنتجات المحسنة
  restoreProduct: (id: string) => Promise<void>;
  
  // دوال إدارة المستخدم
  handleLogout: () => Promise<void>;
  fetchUserData: () => Promise<void>;
  
  // دوال مساعدة
  parseFirebaseDate: (timestamp: any) => Date | null;
  getUserCollection: (collectionName: string) => any;
  fetchTestimonials: () => Promise<void>;
  addTestimonial: (testimonialData: Omit<Testimonial, 'id' | 'avatar' | 'initials'>) => Promise<void>;
}

const AppContext = createContext<ExtendedAppContextType | undefined>(undefined);

const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}${month}${day}-${randomNum}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [analyticsReports, setAnalyticsReports] = useState<AnalyticsReport[]>([]);
  const [customerServiceRequests, setCustomerServiceRequests] = useState<CustomerServiceRequest[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  // دوال مساعدة
  const parseFirebaseDate = (timestamp: any) => {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    return new Date(timestamp);
  };

  const getUserCollection = useCallback((collectionName: string) => {
    if (!user?.uid) {
      console.error('User UID is not available');
      return null;
    }
    try {
      return collection(db, 'users', user.uid, collectionName);
    } catch (error) {
      console.error('Error creating collection reference:', error);
      return null;
    }
  }, [user?.uid]);

  // لم يعد هناك حاجة لإدارة المستخدم هنا، فقط إدارة بيانات إضافية إذا لزم الأمر
  useEffect(() => {
    if (user) {
      setUserData(user.storeData || null);
    } else {
      setUserData(null);
    }
  }, [user]);

  // جلب التقييمات عند تحميل التطبيق
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const seedDatabase = async () => {
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    const batch = writeBatch(db);

    if (productsSnapshot.empty) {
      const mockProducts = [
        { name: 'لابتوب ديل', price: 250000, stock: 15, category: 'إلكترونيات', barcode: '123456789' },
        { name: 'كيبورد ميكانيكي', price: 35000, stock: 30, category: 'إكسسوارات', barcode: '987654321' },
        { name: 'شاشة 24 بوصة', price: 85000, stock: 8, category: 'شاشات', barcode: '112233445' },
      ];
      mockProducts.forEach(product => {
        const newDocRef = doc(productsRef);
        batch.set(newDocRef, product);
      });
    }
    
    await fetchTestimonials();
    await batch.commit();
  };

  const fetchUserData = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [
        productsSnapshot, 
        salesSnapshot, 
        customersSnapshot,
        invoicesSnapshot,
        reportsSnapshot,
        serviceRequestsSnapshot
      ] = await Promise.all([
        getDocs(query(getUserCollection('products'), orderBy('name'))),
        getDocs(query(getUserCollection('sales'), orderBy('date', 'desc'))),
        getDocs(query(getUserCollection('customers'), orderBy('name'))),
        getDocs(collection(db, 'users', user.uid, 'invoices')),
        getDocs(query(getUserCollection('analyticsReports'), orderBy('createdAt', 'desc'))),
        getDocs(query(getUserCollection('customerServiceRequests'), orderBy('createdAt', 'desc')))
      ]);
      
      setProducts(productsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: parseFirebaseDate(doc.data().createdAt)
      })));
      
      setSales(salesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: parseFirebaseDate(doc.data().date)
      })));
      
      setCustomers(customersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        lastPurchase: parseFirebaseDate(doc.data().lastPurchase)
      })));
      
      setInvoices(invoicesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: parseFirebaseDate(doc.data().date)
      })));
      
      setAnalyticsReports(reportsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: parseFirebaseDate(doc.data().createdAt)
      })));
      
      setCustomerServiceRequests(serviceRequestsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: parseFirebaseDate(doc.data().createdAt)
      })));
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ variant: 'destructive', title: 'خطأ في جلب البيانات', description: 'حدث خطأ في جلب البيانات' });
    } finally {
      setLoading(false);
    }
  }, [user?.uid, getUserCollection]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.uid) {
        // لا تظهر رسالة الخطأ إذا كان لا يزال يتم تحميل بيانات المستخدم
        if (!loading) {
          toast({ variant: 'destructive', title: 'يجب تسجيل الدخول', description: 'يرجى تسجيل الدخول أولاً للوصول إلى بياناتك.' });
        }
        setLoading(false);
        return;
      }
      const [
        productsSnapshot,
        salesSnapshot,
        customersSnapshot,
        invoicesSnapshot,
        reportsSnapshot,
        serviceRequestsSnapshot
      ] = await Promise.all([
        getDocs(query(getUserCollection('products'), orderBy('name'))),
        getDocs(query(getUserCollection('sales'), orderBy('date', 'desc'))),
        getDocs(query(getUserCollection('customers'), orderBy('name'))),
        getDocs(getUserCollection('invoices')),
        getDocs(query(getUserCollection('analyticsReports'), orderBy('createdAt', 'desc'))),
        getDocs(query(getUserCollection('customerServiceRequests'), orderBy('createdAt', 'desc')))
      ]);
      setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setSales(salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)));
      setCustomers(customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
      setInvoices(invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
      setAnalyticsReports(reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnalyticsReport)));
      setCustomerServiceRequests(serviceRequestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerServiceRequest)));
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast({ variant: 'destructive', title: 'خطأ في تحميل البيانات', description: 'لم نتمكن من الاتصال بقاعدة البيانات. الرجاء المحاولة مرة أخرى.' });
    } finally {
      setLoading(false);
    }
  }, [user?.uid, getUserCollection]);

  useEffect(() => {
    // Check if firebase config is present before trying to connect
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        refreshData();
    } else {
        console.warn("Firebase config not found. Skipping Firestore initialization.");
        setLoading(false);
    }
  }, [refreshData]);

  // دوال إدارة المنتجات
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const productsCol = getUserCollection('products');
      if (!productsCol) throw new Error('Products collection not available');
      
      const docRef = await addDoc(productsCol, {
        ...productData,
        stock: productData.stock || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      toast({ title: 'تمت إضافة المنتج بنجاح' });
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء إضافة المنتج' });
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id'>>) => {
    try {
      const productDoc = doc(getUserCollection('products'), id);
      await updateDoc(productDoc, {
        ...productData,
        updatedAt: serverTimestamp()
      });
      
      toast({ title: 'تم تحديث المنتج بنجاح' });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء تحديث المنتج' });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const productRef = doc(getUserCollection('products'), id);
      const productData = (await getDoc(productRef)).data();
      
      // حفظ في المنتجات المحذوفة
      await setDoc(doc(getUserCollection('deletedProducts'), id), {
        ...productData,
        deletedAt: serverTimestamp()
      });
      
      // حذف من المنتجات الحالية
      await deleteDoc(productRef);
      
      toast({ title: 'تم نقل المنتج إلى الأرشيف' });
      await fetchUserData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء حذف المنتج' });
    }
  };

  const restoreProduct = async (id: string) => {
    try {
      const deletedRef = doc(getUserCollection('deletedProducts'), id);
      const productData = (await getDoc(deletedRef)).data();
      
      // استعادة إلى المنتجات الحالية
      await setDoc(doc(getUserCollection('products'), id), {
        ...productData,
        restoredAt: serverTimestamp()
      });
      
      // حذف من المحذوفات
      await deleteDoc(deletedRef);
      
      toast({ title: 'تم استعادة المنتج بنجاح' });
      await fetchUserData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء استعادة المنتج' });
    }
  };
  
  const getProductById = (id: string) => products.find(p => p.id === id);

  // دوال إدارة المبيعات
  const addSale = async (saleData: Omit<Sale, 'id' | 'invoiceNumber'> & { invoiceNumber?: string }) => {
    try {
      const batch = writeBatch(db);
      const productsCol = getUserCollection('products');
      const salesCol = getUserCollection('sales');
      const customersCol = getUserCollection('customers');
  
      // التحقق من توفر المجموعات
      if (!productsCol || !salesCol) {
        throw new Error('المجموعات المطلوبة غير متاحة');
      }
  
      // التحقق من صحة العناصر
      if (!saleData.items || saleData.items.length === 0) {
        throw new Error('لا توجد عناصر في الفاتورة');
      }
  
      // تحديث مخزون المنتجات
      for (const item of saleData.items) {
        const productRef = doc(productsCol, item.productId);
        const productDoc = await getDoc(productRef);
  
        if (!productDoc.exists()) {
          throw new Error(`المنتج ${item.productId} غير موجود`);
        }
  
        const currentStock = productDoc.data().stock || 0;
        if (currentStock < item.quantity) {
          throw new Error(
            `الكمية المطلوبة لـ ${productDoc.data().name} (${item.quantity}) تتجاوز المخزون (${currentStock})`
          );
        }
  
        batch.update(productRef, {
          stock: increment(-item.quantity),
          lastSold: serverTimestamp(),
          totalSold: increment(item.quantity)
        });
      }
  
      // إضافة عملية البيع
      const saleRef = doc(salesCol);
      const salePayload = {
        ...saleData,
        items: saleData.items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        date: serverTimestamp(),
        paymentMethod: saleData.paymentMethod || 'cash',
        createdAt: serverTimestamp(),
        status: 'completed'
      };
  
      batch.set(saleRef, salePayload);
  
      // تحديث إحصائيات العميل إذا وجد
      if (saleData.userId) {
        const customerRef = doc(customersCol, saleData.userId);
        const customerDoc = await getDoc(customerRef);
  
        if (customerDoc.exists()) {
          batch.update(customerRef, {
            totalSpent: increment(saleData.total),
            purchaseCount: increment(1),
            lastPurchase: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }
  
      // تنفيذ الدفعة
      await batch.commit();
  
      toast({ title: 'تمت عملية البيع بنجاح' });
      return {
        id: saleRef.id,
        ...salePayload,
        date: new Date().toISOString()
      };
  
    } catch (error) {
      console.error('تفاصيل الخطأ:', error);
      toast({ variant: 'destructive', title: 'فشل في عملية البيع', description: error.message });
      throw error;
    }
  };

  const addInvoicesale = async (invoiceData: any) => {
    try {
      const batch = writeBatch(db);
      
      // Update product stock
      invoiceData.items.forEach((item: any) => {
        const productRef = doc(getUserCollection('products'), item.productId);
        batch.update(productRef, {
          stock: increment(-item.quantity),
          lastSold: serverTimestamp()
        });
      });
  
      // Add invoice without customer requirements
      const invoiceRef = doc(getUserCollection('invoices'));
      batch.set(invoiceRef, {
        ...invoiceData,
        date: serverTimestamp(),
        paymentMethod: invoiceData.paymentMethod || 'cash',
        createdAt: serverTimestamp()
      });
  
      await batch.commit();
      toast({ title: 'تمت عملية البيع بنجاح' });
      return invoiceRef.id;
    } catch (error) {
      console.error('Error adding sale:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء عملية البيع' });
      throw error;
    }
  };

  const updateSale = async (id: string, saleData: Partial<Omit<Sale, 'id'>>) => {
    const docRef = doc(db, 'sales', id);
    await updateDoc(docRef, saleData as any);
    await refreshData();
  };
  
  const deleteSale = async (id: string) => {
    try {
      // أولاً: حذف جميع الإرجاعات المرتبطة بهذه الفاتورة
      const returnsQuery = query(
        getUserCollection('returns'),
        where('saleId', '==', id)
      );
      
      const returnsSnapshot = await getDocs(returnsQuery);
      const batch = writeBatch(db);
      
      returnsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // ثم حذف الفاتورة نفسها
      const saleRef = doc(getUserCollection('sales'), id);
      batch.delete(saleRef);
      
      await batch.commit();
      toast({ title: 'تم حذف عملية البيع وجميع الإرجاعات المرتبطة بها بنجاح' });
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء حذف البيع' });
      throw error;
    }
  };

  const returnProduct = async (returnData: { saleId: string; productId: string; quantity: number }) => {
      const { saleId, productId, quantity } = returnData;
      try {
        await runTransaction(db, async (transaction) => {
          const saleRef = doc(db, "sales", saleId);
          const productRef = doc(db, "products", productId);

          const saleDoc = await transaction.get(saleRef);
          const productDoc = await transaction.get(productRef);

          if (!saleDoc.exists()) throw new Error("Sale not found");
          if (!productDoc.exists()) throw new Error("Product not found");

          const saleToUpdate = saleDoc.data() as Sale;
          const newReturn: SaleReturn = {
              productId,
              quantity,
              date: new Date().toISOString(),
          };
      
          const updatedReturns = [...(saleToUpdate.returns || []), newReturn];
          transaction.update(saleRef, { returns: updatedReturns });

          const currentStock = productDoc.data().stock || 0;
          transaction.update(productRef, { stock: currentStock + quantity });
        });
        await refreshData();
      } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
      }
  };

  // دوال إدارة العملاء
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'totalSpent' | 'purchaseCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const customersCol = getUserCollection('customers');
      if (!customersCol) throw new Error('Customers collection not available');
      
      const docRef = await addDoc(customersCol, {
        ...customerData,
        totalSpent: 0,
        purchaseCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      toast({ title: 'تمت إضافة العميل بنجاح' });
      return docRef.id;
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء إضافة العميل' });
      throw error;
    }
  };

  // دوال إدارة الفواتير
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'date' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Validate user and customer ID
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      if (!invoiceData.customer?.id) {
        throw new Error('Customer ID is required');
      }
  
      // Prepare the invoice document
      const invoiceDoc = {
        customer: {
          id: invoiceData.customer.id,
          name: invoiceData.customer.name || '',
          phone: invoiceData.customer.phone || '',
          address: invoiceData.customer.address || ''
        },
        items: invoiceData.items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        subtotal: invoiceData.subtotal || 0,
        discount: invoiceData.discount || 0,
        tax: invoiceData.tax || 0,
        total: invoiceData.total,
        paymentMethod: invoiceData.paymentMethod || 'cash',
        notes: invoiceData.notes || '',
        status: invoiceData.status || 'paid',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
  
      // Get reference to the invoices subcollection
      const invoicesCol = collection(
        db,
        'users',
        user.uid,
        'customers',
        invoiceData.customer.id,
        'invoices'
      );
  
      // Add the invoice document (auto-generates ID)
      const docRef = await addDoc(invoicesCol, invoiceDoc);
  
      // Update customer's purchase stats
      const customerRef = doc(db, 'users', user.uid, 'customers', invoiceData.customer.id);
      await updateDoc(customerRef, {
        lastPurchase: serverTimestamp(),
        totalSpent: increment(invoiceData.total),
        purchaseCount: increment(1)
      });
  
      // Update product stock levels in a batch
      const batch = writeBatch(db);
      invoiceData.items.forEach(item => {
        const productRef = doc(db, 'users', user.uid, 'products', item.productId);
        batch.update(productRef, {
          stock: increment(-item.quantity),
          lastSold: serverTimestamp()
        });
      });
      await batch.commit();
  
      return docRef.id;
  
    } catch (error) {
      console.error('Error adding invoice:', error);
      throw error;
    }
  };

  // دوال التحليلات
  const getSalesAnalytics = useCallback((period = 'daily') => {
    const now = new Date();
    let filteredSales = [];
    
    // التصفية حسب الفترة الزمنية
    switch (period) {
      case 'daily':
        filteredSales = sales.filter(sale => {
          const saleDate = parseFirebaseDate(sale.date);
          return saleDate && saleDate.getDate() === now.getDate() && 
                 saleDate.getMonth() === now.getMonth() && 
                 saleDate.getFullYear() === now.getFullYear();
        });
        break;
      case 'monthly':
        filteredSales = sales.filter(sale => {
          const saleDate = parseFirebaseDate(sale.date);
          return saleDate && saleDate.getMonth() === now.getMonth() && 
                 saleDate.getFullYear() === now.getFullYear();
        });
        break;
      case 'yearly':
        filteredSales = sales.filter(sale => {
          const saleDate = parseFirebaseDate(sale.date);
          return saleDate && saleDate.getFullYear() === now.getFullYear();
        });
        break;
      default:
        filteredSales = sales;
    }

    // الحسابات الأساسية
    const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const salesCount = filteredSales.length;
    const avgSale = salesCount > 0 ? totalSales / salesCount : 0;

    return {
      totalSales,
      salesCount,
      avgSale,
      salesData: filteredSales.map(sale => ({
        ...sale,
        date: parseFirebaseDate(sale.date),
        items: sale.items || []
      }))
    };
  }, [sales]);

  const getInventoryReport = useCallback(() => {
    const criticalThreshold = 5;
    let outOfStock = 0;
    let lowStock = 0;
    
    const categorizedProducts = products.map(product => {
      let status = 'inStock';
      if (product.stock <= 0) {
        status = 'outOfStock';
        outOfStock++;
      } else if (product.stock <= criticalThreshold) {
        status = 'lowStock';
        lowStock++;
      }
      
      return {
        ...product,
        status,
        value: product.price * product.stock
      };
    });

    const totalStockValue = categorizedProducts.reduce((sum, product) => sum + product.value, 0);

    return {
      products: categorizedProducts,
      outOfStock,
      lowStock,
      inStock: products.length - outOfStock - lowStock,
      totalStockValue,
      criticalThreshold
    };
  }, [products]);

  const getCustomerAnalytics = useCallback(() => {
    const customerStats = customers.map(customer => {
      const customerSales = sales.filter(s => s.userId === customer.id);
      const totalSpent = customerSales.reduce((sum, sale) => sum + sale.total, 0);
      return {
        ...customer,
        totalSpent,
        purchaseCount: customerSales.length,
        lastPurchase: customerSales.length > 0 
          ? parseFirebaseDate(customerSales[0].date) 
          : null
      };
    });

    const topCustomers = [...customerStats]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    return {
      totalCustomers: customers.length,
      activeCustomers: customerStats.filter(c => c.purchaseCount > 0).length,
      topCustomers,
      customerStats
    };
  }, [customers, sales]);

  // دوال إدارة المستخدم
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear the token cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax';
      // Clear user data
      setUser(null);
      setUserData(null);
      
      // Show success message
      toast({ 
        title: 'تم تسجيل الخروج بنجاح',
        description: 'نتمنى لك يوماً سعيداً!'
      });
      
      // Redirect to login page after a short delay
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'حدث خطأ أثناء تسجيل الخروج',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    }
  };

  const fetchTestimonials = async () => {
    console.log('Fetching testimonials...');
    try {
        const testimonialsRef = collection(db, 'testimonials');
        const testimonialsSnapshot = await getDocs(query(testimonialsRef, where('status', '==', 'approved')));
        console.log('Testimonials query result:', testimonialsSnapshot.docs.length, 'documents');
        
        if(testimonialsSnapshot.empty) {
            // إضافة تقييمات افتراضية إذا لم توجد تقييمات معتمدة
            const defaultTestimonials = [
                {
                    id: '1',
                    name: 'أحمد محمد',
                    title: 'مدير متجر إلكتروني',
                    quote: 'مبيعاتي ساعدني في تنظيم عملياتي وزيادة مبيعاتي بنسبة 40% في الشهر الأول فقط!',
                    rating: 5,
                    avatar: '/api/placeholder/40/40',
                    initials: 'أم'
                },
                {
                    id: '2',
                    name: 'فاطمة علي',
                    title: 'صاحبة متجر ملابس',
                    quote: 'واجهة سهلة الاستخدام ودعم فني ممتاز. أنصح به بشدة لأي صاحب عمل.',
                    rating: 5,
                    avatar: '/api/placeholder/40/40',
                    initials: 'فع'
                },
                {
                    id: '3',
                    name: 'محمد حسن',
                    title: 'مدير سلسلة متاجر',
                    quote: 'التقارير التفصيلية والتحليلات ساعدتني في اتخاذ قرارات أفضل لعملي.',
                    rating: 4,
                    avatar: '/api/placeholder/40/40',
                    initials: 'مح'
                }
            ];
            setTestimonials(defaultTestimonials);
        } else {
            console.log('Found approved testimonials:', testimonialsSnapshot.docs.length);
            const testimonialsData = testimonialsSnapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Testimonial data:', data);
                
                const getInitials = (name: string) => {
                    const names = name.split(' ');
                    if (names.length > 1) {
                        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
                    }
                    return name.substring(0, 2).toUpperCase();
                };
                
                const testimonial = {
                    id: doc.id,
                    name: data.name || 'عميل',
                    title: data.title || 'عميل سعيد',
                    quote: data.quote || 'تقييم رائع',
                    rating: data.rating || 5,
                    avatar: '/api/placeholder/40/40',
                    initials: getInitials(data.name || 'عميل')
                };
                
                console.log('Processed testimonial:', testimonial);
                return testimonial;
            }) as Testimonial[];
            setTestimonials(testimonialsData);
        }
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        // في حالة الخطأ، استخدم التقييمات الافتراضية
        const defaultTestimonials = [
            {
                id: '1',
                name: 'أحمد محمد',
                title: 'مدير متجر إلكتروني',
                quote: 'مبيعاتي ساعدني في تنظيم عملياتي وزيادة مبيعاتي بنسبة 40% في الشهر الأول فقط!',
                rating: 5,
                avatar: '/api/placeholder/40/40',
                initials: 'أم'
            },
            {
                id: '2',
                name: 'فاطمة علي',
                title: 'صاحبة متجر ملابس',
                quote: 'واجهة سهلة الاستخدام ودعم فني ممتاز. أنصح به بشدة لأي صاحب عمل.',
                rating: 5,
                avatar: '/api/placeholder/40/40',
                initials: 'فع'
            },
            {
                id: '3',
                name: 'محمد حسن',
                title: 'مدير سلسلة متاجر',
                quote: 'التقارير التفصيلية والتحليلات ساعدتني في اتخاذ قرارات أفضل لعملي.',
                rating: 4,
                avatar: '/api/placeholder/40/40',
                initials: 'مح'
            }
        ];
        setTestimonials(defaultTestimonials);
    }
  };

  const addTestimonial = async (testimonialData: Omit<Testimonial, 'id' | 'avatar' | 'initials'>) => {
    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const newTestimonial = {
        ...testimonialData,
        initials: getInitials(testimonialData.name),
        avatar: `https://placehold.co/40x40.png`,
        status: 'pending',
        createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'testimonials'), newTestimonial);
    toast({ title: 'تم إرسال التقييم بنجاح', description: 'سيتم مراجعة تقييمك قريباً' });
  };

  // Real-time Listeners
  const setupRealtimeListeners = useCallback(() => {
    if (!user?.uid) return () => {};

    const unsubscribeFunctions = [];

    // Products Listener
    const productsCol = getUserCollection('products');
    if (productsCol) {
      const unsub = onSnapshot(
        query(productsCol, orderBy('name')),
        (snapshot) => {
          setProducts(snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: parseFirebaseDate(doc.data().createdAt)
          })));
        }
      );
      unsubscribeFunctions.push(unsub);
    }

    // Sales Listener
    const salesCol = getUserCollection('sales');
    if (salesCol) {
      const unsub = onSnapshot(
        query(salesCol, orderBy('date', 'desc')),
        (snapshot) => {
          setSales(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: parseFirebaseDate(doc.data().date)
          })));
        }
      );
      unsubscribeFunctions.push(unsub);
    }

    // Customers Listener
    const customersCol = getUserCollection('customers');
    if (customersCol) {
      const unsub = onSnapshot(
        query(customersCol, orderBy('name')),
        (snapshot) => {
          setCustomers(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            lastPurchase: parseFirebaseDate(doc.data().lastPurchase)
          })));
        }
      );
      unsubscribeFunctions.push(unsub);
    }

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub?.());
    };
  }, [user?.uid, getUserCollection]);

  useEffect(() => {
    if (!user?.uid) return;
  
    const loadData = async () => {
      try {
        await fetchUserData();
      } catch (error) {
        console.error('Initial data load failed:', error);
      }
    };
    loadData();
  
    const unsubscribeListeners = setupRealtimeListeners();
    return () => unsubscribeListeners?.();
  }, [user?.uid, fetchUserData, setupRealtimeListeners]);

  // دوال إدارة العملاء المحسنة
  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const customerRef = doc(db, 'users', user!.uid, 'customers', id);
      await updateDoc(customerRef, {
        ...customerData,
        updatedAt: serverTimestamp()
      });
      
      // تحديث الحالة المحلية
      setCustomers(prev => prev.map(c => 
        c.id === id ? { ...c, ...customerData } : c
      ));
      
      toast({ title: 'تم تحديث بيانات العميل بنجاح' });
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء تحديث العميل' });
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const customerRef = doc(db, 'users', user!.uid, 'customers', id);
      await deleteDoc(customerRef);
      
      // تحديث الحالة المحلية
      setCustomers(prev => prev.filter(c => c.id !== id));
      
      toast({ title: 'تم حذف العميل بنجاح' });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء حذف العميل' });
      throw error;
    }
  };

  const getCustomerById = (id: string) => {
    return customers.find(c => c.id === id);
  };

  // دوال إدارة الفواتير المحسنة
  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    try {
      // البحث عن الفاتورة في جميع العملاء
      for (const customer of customers) {
        const invoiceRef = doc(db, 'users', user!.uid, 'customers', customer.id, 'invoices', id);
        const invoiceDoc = await getDoc(invoiceRef);
        
        if (invoiceDoc.exists()) {
          await updateDoc(invoiceRef, {
            ...invoiceData,
            updatedAt: serverTimestamp()
          });
          
          // تحديث الحالة المحلية
          setInvoices(prev => prev.map(inv => 
            inv.id === id ? { ...inv, ...invoiceData } : inv
          ));
          
          toast({ title: 'تم تحديث الفاتورة بنجاح' });
          return;
        }
      }
      
      throw new Error('Invoice not found');
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء تحديث الفاتورة' });
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      // البحث عن الفاتورة في جميع العملاء
      for (const customer of customers) {
        const invoiceRef = doc(db, 'users', user!.uid, 'customers', customer.id, 'invoices', id);
        const invoiceDoc = await getDoc(invoiceRef);
        
        if (invoiceDoc.exists()) {
          await deleteDoc(invoiceRef);
          
          // تحديث الحالة المحلية
          setInvoices(prev => prev.filter(inv => inv.id !== id));
          
          toast({ title: 'تم حذف الفاتورة بنجاح' });
          return;
        }
      }
      
      throw new Error('Invoice not found');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء حذف الفاتورة' });
      throw error;
    }
  };

  const getInvoiceById = (id: string) => {
    return invoices.find(inv => inv.id === id);
  };

  // دوال إدارة خدمة العملاء
  const addCustomerServiceRequest = async (requestData: Omit<CustomerServiceRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const requestsCol = getUserCollection('customerServiceRequests');
      if (!requestsCol) throw new Error('Customer service requests collection not available');
      
      const docRef = await addDoc(requestsCol, {
        ...requestData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      toast({ title: 'تم إرسال طلب خدمة العملاء بنجاح' });
      return docRef.id;
    } catch (error) {
      console.error('Error adding customer service request:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء إرسال الطلب' });
      throw error;
    }
  };

  const updateCustomerServiceRequest = async (id: string, requestData: Partial<CustomerServiceRequest>) => {
    try {
      const requestRef = doc(db, 'users', user!.uid, 'customerServiceRequests', id);
      await updateDoc(requestRef, {
        ...requestData,
        updatedAt: serverTimestamp()
      });
      
      // تحديث الحالة المحلية
      setCustomerServiceRequests(prev => prev.map(req => 
        req.id === id ? { ...req, ...requestData } : req
      ));
      
      toast({ title: 'تم تحديث طلب خدمة العملاء بنجاح' });
    } catch (error) {
      console.error('Error updating customer service request:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء تحديث الطلب' });
      throw error;
    }
  };

  const deleteCustomerServiceRequest = async (id: string) => {
    try {
      const requestRef = doc(db, 'users', user!.uid, 'customerServiceRequests', id);
      await deleteDoc(requestRef);
      
      // تحديث الحالة المحلية
      setCustomerServiceRequests(prev => prev.filter(req => req.id !== id));
      
      toast({ title: 'تم حذف طلب خدمة العملاء بنجاح' });
    } catch (error) {
      console.error('Error deleting customer service request:', error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء حذف الطلب' });
      throw error;
    }
  };

  // Memoized values for better performance
  const memoizedValues = useMemo(() => ({
    // State
    products,
    sales,
    customers,
    invoices,
    analyticsReports,
    customerServiceRequests,
    testimonials,
    selectedCustomer,
    loading,
    user,
    userData,
    deleteSale,

    // Analytics
    getSalesAnalytics,
    getInventoryReport,
    getCustomerAnalytics,
    getProductById,

    // Product Management
    addProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,

    // Sales Management
    addSale,
    addInvoice,
    addInvoicesale,

    // Customer Management
    addCustomer,

    // Data Management
    refreshData,
    fetchUserData,
    // setUser لم تعد مطلوبة هنا

    // Authentication
    handleLogout,

    // Helper Functions
    parseFirebaseDate,
    getUserCollection,
    fetchTestimonials,
    addTestimonial
  }), [
    products, sales, customers, invoices, analyticsReports, 
    customerServiceRequests, testimonials, selectedCustomer, 
    loading, user, userData, getSalesAnalytics, getInventoryReport, 
    getCustomerAnalytics, addInvoice, fetchTestimonials, addTestimonial
  ]);

  return (
    <AppContext.Provider value={memoizedValues}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;

export const useAppContext = (): ExtendedAppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
};
