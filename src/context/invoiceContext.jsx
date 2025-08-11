import { createContext, useContext, useState, useCallback } from 'react';
import { 
  collection, doc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/components/auth/auth-provider';

const InvoiceContext = createContext();

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const { user } = useAuth();
  const { getUserCollection, parseFirebaseDate, setLoading } = useAppContext();

  const fetchInvoices = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const invoicesCol = collection(db, 'users', user.uid, 'invoices');
      const invoicesSnapshot = await getDocs(invoicesCol);
      setInvoices(invoicesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: parseFirebaseDate(doc.data().date)
      })));
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('حدث خطأ في جلب الفواتير');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, parseFirebaseDate, setLoading]);

  // Firestore functions are already imported at the top
  const addInvoice = async (invoiceData) => {
    try {
      const invoicesCol = getUserCollection('invoices');
      if (!invoicesCol) throw new Error('Invoices collection not available');
      
      const docRef = await addDoc(invoicesCol, {
        ...invoiceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      toast.success('تمت إضافة الفاتورة بنجاح');
      return docRef.id;
    } catch (error) {
      console.error('Error adding invoice:', error);
      toast.error('حدث خطأ أثناء إضافة الفاتورة');
      throw error;
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        fetchInvoices,
        addInvoice
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};