import { createContext, useContext, useState, useCallback } from 'react';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, 
  serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/components/auth/auth-provider';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { user } = useAuth();
  const { getUserCollection, parseFirebaseDate, setLoading } = useAppContext();

  const fetchCustomers = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const customersCol = getUserCollection('customers');
      if (!customersCol) return;
      
      const customersSnapshot = await getDocs(query(customersCol, orderBy('name')));
      setCustomers(customersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        lastPurchase: parseFirebaseDate(doc.data().lastPurchase)
      })));
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('حدث خطأ في جلب العملاء');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, getUserCollection, parseFirebaseDate, setLoading]);

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

  const updateCustomer = async (id, customerData) => {
    try {
      const customerDoc = doc(getUserCollection('customers'), id);
      await updateDoc(customerDoc, {
        ...customerData,
        updatedAt: serverTimestamp()
      });
      
      toast.success('تم تحديث بيانات العميل بنجاح');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('حدث خطأ أثناء تحديث بيانات العميل');
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const customerDoc = doc(getUserCollection('customers'), id);
      await deleteDoc(customerDoc);
      
      toast.success('تم حذف العميل بنجاح');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('حدث خطأ أثناء حذف العميل');
      throw error;
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        selectedCustomer,
        setSelectedCustomer,
        fetchCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};