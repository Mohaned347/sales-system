import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, getDocs, doc, updateDoc, deleteDoc, 
  addDoc, writeBatch, increment, serverTimestamp, 
  query, orderBy, setDoc, where, onSnapshot, getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';

const AppContext = createContext();

export function AppProvider({ children }) {
  // States
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [analyticsReports, setAnalyticsReports] = useState([]);
  const [customerServiceRequests, setCustomerServiceRequests] = useState([]);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [returns, setReturns] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // إضافة state جديد

useEffect(() => {
  const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      // جلب بيانات المستخدم الإضافية من Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        setUser({
          ...firebaseUser,
          ...userDoc.data() // بيانات Firestore (displayName, storeData, etc.)
        });
        setUserData(userDoc.data()); // تخزين بيانات المستخدم بشكل منفصل إذا لزم الأمر
      } else {
        setUser(firebaseUser); // بيانات المصادقة فقط إذا لم توجد بيانات إضافية
      }
    } else {
      setUser(null);
      setUserData(null);
    }
  });

  return () => unsubscribeAuth();
}, []);

  // Helper Functions
  const parseFirebaseDate = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    return new Date(timestamp);
  };

  const getUserCollection = useCallback((collectionName) => {
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

  // Enhanced Sales Analytics// تعديل وظيفة getSalesAnalytics
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

// تعديل وظيفة getInventoryReport
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
const deleteSale = async (id) => {
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
    toast.success('تم حذف عملية البيع وجميع الإرجاعات المرتبطة بها بنجاح');
  } catch (error) {
    console.error('Error deleting sale:', error);
    toast.error('حدث خطأ أثناء حذف البيع');
    throw error;
  }
};

  // Customer Analytics
  const getCustomerAnalytics = useCallback(() => {
    const customerStats = customers.map(customer => {
      const customerSales = sales.filter(s => s.customerId === customer.id);
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

  // Data Fetching
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
      toast.error('حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, getUserCollection]);

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

  // Data Management
  const refreshData = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      await fetchUserData();
      toast.success('تم تحديث البيانات بنجاح');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('حدث خطأ أثناء تحديث البيانات');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, fetchUserData]);

  // Product Management
  const addProduct = async (productData) => {
    try {
      const productsCol = getUserCollection('products');
      if (!productsCol) throw new Error('Products collection not available');
      
      const docRef = await addDoc(productsCol, {
        ...productData,
        stock: productData.stock || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      toast.success('تمت إضافة المنتج بنجاح');
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج');
      throw error;
    }
  };
  const addInvoicesale = async (invoiceData) => {
    try {
      const batch = writeBatch(db);
      
      // Update product stock
      invoiceData.items.forEach(item => {
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
      toast.success('تمت عملية البيع بنجاح');
      return invoiceRef.id;
    } catch (error) {
      console.error('Error adding sale:', error);
      toast.error('حدث خطأ أثناء عملية البيع');
      throw error;
    }
  };
  const updateProduct = async (id, productData) => {
    try {
      const productDoc = doc(getUserCollection('products'), id);
      await updateDoc(productDoc, {
        ...productData,
        updatedAt: serverTimestamp()
      });
      
      toast.success('تم تحديث المنتج بنجاح');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('حدث خطأ أثناء تحديث المنتج');
      throw error;
    }
  };

 // حذف منتج مع الاحتفاظ بنسخة
 const deleteProduct = async (id) => {
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
    
    toast.success('تم نقل المنتج إلى الأرشيف');
    await fetchData();
  } catch (error) {
    toast.error('حدث خطأ أثناء حذف المنتج');
  }
};

// استعادة منتج محذوف
const restoreProduct = async (id) => {
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
    
    toast.success('تم استعادة المنتج بنجاح');
    await fetchData();
  } catch (error) {
    toast.error('حدث خطأ أثناء استعادة المنتج');
  }
};
  // Sales Management
  const addSale = async (saleData) => {
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
      if (saleData.customerId) {
        const customerRef = doc(customersCol, saleData.customerId);
        const customerDoc = await getDoc(customerRef);
  
        if (customerDoc.exists()) {
          batch.update(customerRef, {
            totalSpent: increment(saleData.total),
            purchaseCount: increment(1),
            lastPurchase: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          console.warn('العميل غير موجود، سيتم تجاهل تحديث الإحصائيات');
        }
      }
  
      // تنفيذ الدفعة
      await batch.commit();
  
      // إرجاع بيانات البيع مع المعرف
      return {
        id: saleRef.id,
        ...salePayload,
        date: new Date().toISOString() // يمكن استبدالها ب timestamp حقيقي
      };
  
    } catch (error) {
      console.error('تفاصيل الخطأ:', {
        error,
        saleData,
        timestamp: new Date().toISOString()
      });
  
      const errorMessage = error.message.includes('تتجاوز المخزون')
        ? 'خطأ في المخزون: ' + error.message
        : error.message.includes('غير موجود')
        ? 'منتج غير موجود: ' + error.message
        : 'فشل في عملية البيع: ' + error.message;
  
      toast.error(errorMessage, {
        autoClose: 5000,
        icon: <FiAlertCircle className="text-red-500" />
      });
  
      throw new Error(errorMessage);
    }
  };

  // Customer Management
  const addCustomer = async (customerData) => {
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
      
      toast.success('تمت إضافة العميل بنجاح');
      return docRef.id;
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('حدث خطأ أثناء إضافة العميل');
      throw error;
    }
  };

  // Authentication
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  // Effect Hooks
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        // Reset all states on logout
        setProducts([]);
        setSales([]);
        setCustomers([]);
        setInvoices([]);
        setAnalyticsReports([]);
        setCustomerServiceRequests([]);
        setReturns([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
  
    const loadData = async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error('Initial data load failed:', error);
      }
    };
    loadData();
  
    const unsubscribeListeners = setupRealtimeListeners();
    return () => unsubscribeListeners?.();
  }, [user?.uid, refreshData, setupRealtimeListeners]);
  const addInvoice = async (invoiceData) => {
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
  function getProductById(productId) {
    return products.find(product => product.id === productId) || {
      name: 'منتج غير موجود',
      price: 0
    };
  }
  // Memoized values for better performance
  const memoizedValues = useMemo(() => ({
    // State
    products,
    sales,
    customers,
    invoices,
    analyticsReports,
    customerServiceRequests,
    customerInvoices,
    returns,
    selectedCustomer,
    loading,
    user,
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

    // Customer Management
    addCustomer,

    // Data Management
    refreshData,
    addInvoicesale,
    setUser,

    // Authentication
    handleLogout
  }), [
    products, sales, customers, invoices, analyticsReports, 
    customerServiceRequests, customerInvoices, returns,
    selectedCustomer, loading, user,userData, getSalesAnalytics,
    getInventoryReport, getCustomerAnalytics, addInvoice
  ]);

  return (
    <AppContext.Provider value={memoizedValues}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};