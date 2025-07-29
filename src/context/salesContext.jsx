import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, 
  serverTimestamp, query, orderBy, writeBatch, increment, getDocs
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../lib/firebase';

const SalesContext = createContext();

export const SalesProvider = ({ 
  children,
  getUserCollection,   // Passed as prop
  parseFirebaseDate,   // Passed as prop
  setLoading,         // Passed as prop
  user                // Passed as prop
}) => {
  const [sales, setSales] = useState([]);

  const fetchSales = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const salesCol = getUserCollection('sales');
      if (!salesCol) return;

      const salesSnapshot = await getDocs(query(salesCol, orderBy('date', 'desc')));
      setSales(salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: parseFirebaseDate(doc.data().date)
      })));
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('حدث خطأ في جلب المبيعات');
    } finally {
      setLoading(false);
    }
  }, [user, getUserCollection, parseFirebaseDate, setLoading]);

  useEffect(() => {
    if (user) {
      fetchSales();
    } else {
      setSales([]);
    }
  }, [user, fetchSales]);

  const addSale = useCallback(async (saleData) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const batch = writeBatch(db);

      // Update product stock
      saleData.items.forEach(item => {
        const productRef = doc(getUserCollection('products'), item.productId);
        batch.update(productRef, {
          stock: increment(-item.quantity),
          lastSold: serverTimestamp()
        });
      });

      // Add sale
      const salesCol = getUserCollection('sales');
      if (!salesCol) throw new Error('Sales collection not available');

      const saleRef = doc(salesCol);
      batch.set(saleRef, {
        ...saleData,
        date: serverTimestamp(),
        paymentMethod: saleData.paymentMethod || 'cash',
        createdAt: serverTimestamp()
      });

      await batch.commit();

      toast.success('تمت عملية البيع بنجاح');
      return saleRef.id;
    } catch (error) {
      console.error('Error adding sale:', error);
      toast.error('حدث خطأ أثناء عملية البيع');
      throw error;
    }
  }, [user, getUserCollection]);

  const updateSale = useCallback(async (id, saleData) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const saleDoc = doc(getUserCollection('sales'), id);
      await updateDoc(saleDoc, {
        ...saleData,
        updatedAt: serverTimestamp()
      });

      toast.success('تم تحديث عملية البيع بنجاح');
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error('حدث خطأ أثناء تحديث عملية البيع');
      throw error;
    }
  }, [user, getUserCollection]);

  const deleteSale = useCallback(async (id) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const saleDoc = doc(getUserCollection('sales'), id);
      await deleteDoc(saleDoc);

      toast.success('تم حذف عملية البيع بنجاح');
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('حدث خطأ أثناء حذف عملية البيع');
      throw error;
    }
  }, [user, getUserCollection]);

  return (
    <SalesContext.Provider
      value={{
        sales,
        fetchSales,
        addSale,
        updateSale,
        deleteSale
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};