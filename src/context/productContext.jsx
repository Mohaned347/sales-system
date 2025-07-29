import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, 
  serverTimestamp, query, orderBy, getDocs 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { getUserCollection, parseFirebaseDate } from './hooks';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const { user, setLoading } = useAuth() || {};

  const fetchProducts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const productsCol = getUserCollection(user, 'products');
      if (!productsCol) return;
      
      const productsSnapshot = await getDocs(query(productsCol, orderBy('name')));
      setProducts(productsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: parseFirebaseDate(doc.data().createdAt)
      })));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('حدث خطأ في جلب المنتجات');
    } finally {
      setLoading(false);
    }
  }, [user, setLoading]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [user, fetchProducts]);

  const addProduct = useCallback(async (productData) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const productsCol = getUserCollection(user, 'products');
      if (!productsCol) throw new Error('Products collection not available');
      
      const docRef = await addDoc(productsCol, {
        ...productData,
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
  }, [user]);

  const updateProduct = useCallback(async (id, productData) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const productDoc = doc(getUserCollection(user, 'products'), id);
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
  }, [user]);

  const deleteProduct = useCallback(async (id) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const productDoc = doc(getUserCollection(user, 'products'), id);
      await deleteDoc(productDoc);
      
      toast.success('تم حذف المنتج بنجاح');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('حدث خطأ أثناء حذف المنتج');
      throw error;
    }
  }, [user]);

  return (
    <ProductContext.Provider
      value={{
        products,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};