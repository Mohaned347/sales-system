"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, Sale, AppContextType, Testimonial, SaleReturn } from '@/types';
import { toast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
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
  getDoc
} from 'firebase/firestore';


const AppContext = createContext<AppContextType | undefined>(undefined);

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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

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
    
    const testimonialsRef = collection(db, 'testimonials');
    const testimonialsSnapshot = await getDocs(testimonialsRef);
    if(testimonialsSnapshot.empty) {
        const mockTestimonials = [
            { name: 'أحمد منصور', title: 'مدير مبيعات, شركة تكوين', quote: '"لقد غير مبيعاتي طريقة عملنا تمامًا. أصبح تتبع المبيعات وإدارة المخزون أسهل من أي وقت مضى. أوصي به بشدة!"', avatar: 'https://placehold.co/40x40.png', initials: 'أم', rating: 5 },
            { name: 'فاطمة الزهراء', title: 'صاحبة متجر إلكتروني', quote: '"كصاحبة عمل صغير، كنت أبحث عن أداة شاملة وبأسعار معقولة. مبيعاتي قدم لي كل ما أحتاجه وأكثر. خدمة العملاء ممتازة أيضًا."', avatar: 'https://placehold.co/40x40.png', initials: 'فز', rating: 5 },
            { name: 'خالد الغامدي', title: 'مؤسس, شركة ريادة', quote: '"التقارير التحليلية دقيقة جدًا وساعدتني على اتخاذ قرارات أفضل لنمو شركتي. منصة قوية وموثوقة."', avatar: 'https://placehold.co/40x40.png', initials: 'خغ', rating: 4 },
        ];
        mockTestimonials.forEach(testimonial => {
            const newDocRef = doc(testimonialsRef);
            batch.set(newDocRef, testimonial);
        });
    }

    await batch.commit();
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
        await seedDatabase();

        const productsRef = collection(db, 'products');
        const salesRef = collection(db, 'sales');
        const testimonialsRef = collection(db, 'testimonials');

        const [productsSnapshot, salesSnapshot, testimonialsSnapshot] = await Promise.all([
            getDocs(productsRef),
            getDocs(salesRef),
            getDocs(testimonialsRef),
        ]);

        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const salesData = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
        const testimonialsData = testimonialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));

        setProducts(productsData);
        setSales(salesData);
        setTestimonials(testimonialsData);
    } catch (error) {
      console.error("Error refreshing data from Firestore: ", error);
      toast({ variant: 'destructive', title: 'خطأ في تحميل البيانات', description: 'لم نتمكن من الاتصال بقاعدة البيانات. الرجاء المحاولة مرة أخرى.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if firebase config is present before trying to connect
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        refreshData();
    } else {
        console.warn("Firebase config not found. Skipping Firestore initialization.");
        setLoading(false);
    }
  }, [refreshData]);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const docRef = await addDoc(collection(db, 'products'), productData);
    await refreshData();
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id'>>) => {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, productData);
    await refreshData();
  };

  const deleteProduct = async (id: string) => {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
    await refreshData();
  };
  
  const getProductById = (id: string) => products.find(p => p.id === id);

  const addSale = async (saleData: Omit<Sale, 'id' | 'invoiceNumber'> & { invoiceNumber?: string }) => {
    try {
      await runTransaction(db, async (transaction) => {
        const productIds = saleData.items.map(item => item.productId);
        if (productIds.length === 0) {
          throw new Error("Cannot add a sale with no items.");
        }
        
        const productsRef = collection(db, "products");
        const q = query(productsRef, where(documentId(), "in", productIds));
        
        const productDocsSnapshot = await getDocs(q);
        const productDocsOnServer = productDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const stockMap = new Map(productDocsOnServer.map(d => [d.id, d.stock]));

        for (const item of saleData.items) {
          const productOnServer = productDocsOnServer.find(p => p.id === item.productId);
          if (!productOnServer) {
              throw new Error(`Product with ID ${item.productId} not found on server.`);
          }
          const availableStock = productOnServer.stock;
          if (availableStock < item.quantity) {
            throw new Error(`الكمية غير كافية للمنتج: ${productOnServer.name || 'غير معروف'}`);
          }
        }

        const batch = writeBatch(db);

        for (const item of saleData.items) {
          const productRef = doc(db, "products", item.productId);
          const availableStock = stockMap.get(item.productId);
          const newStock = availableStock! - item.quantity;
          batch.update(productRef, { stock: newStock });
        }

        const newSaleRef = doc(collection(db, "sales"));
        const newSalePayload: Omit<Sale, 'id'> = {
            ...saleData,
            invoiceNumber: saleData.invoiceNumber || generateInvoiceNumber(),
        };
        batch.set(newSaleRef, newSalePayload);

        await batch.commit();

      });
      await refreshData();
    } catch (e: any) {
        console.error("Transaction failed: ", e);
        throw e; // re-throw to be caught by the modal
    }
  };

  const updateSale = async (id: string, saleData: Partial<Omit<Sale, 'id'>>) => {
    const docRef = doc(db, 'sales', id);
    // Note: Stock is not adjusted on update in this simplified version.
    await updateDoc(docRef, saleData as any);
    await refreshData();
  };
  
  const deleteSale = async (id: string) => {
      try {
        await runTransaction(db, async (transaction) => {
          const saleRef = doc(db, "sales", id);
          const saleDoc = await transaction.get(saleRef);
          if (!saleDoc.exists()) {
            throw new Error("Sale does not exist!");
          }
          const saleData = saleDoc.data() as Sale;

          // Restore stock
          for (const item of saleData.items) {
            const productRef = doc(db, "products", item.productId);
            const productDoc = await transaction.get(productRef);
            if (productDoc.exists()) {
              const currentStock = productDoc.data().stock || 0;
              transaction.update(productRef, { stock: currentStock + item.quantity });
            }
          }
          transaction.delete(saleRef);
        });
        await refreshData();
      } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
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

  return (
    <AppContext.Provider value={{ products, sales, testimonials, loading, addProduct, updateProduct, deleteProduct, getProductById, addSale, updateSale, deleteSale, returnProduct, refreshData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
};
