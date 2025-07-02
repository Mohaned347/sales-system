"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, Sale, AppContextType, SaleItem, SaleReturn } from '@/types';
import { toast } from '@/hooks/use-toast';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper functions to interact with localStorage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
  } catch (error) {
    console.warn(`Error writing to localStorage key “${key}”:`, error);
  }
};

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(() => {
    setLoading(true);
    // Simulate async loading
    setTimeout(() => {
      let storedProducts = getFromStorage<Product[]>('products', []);
      if (storedProducts.length === 0) {
        // Add some mock data if storage is empty
        storedProducts = [
          { id: generateId(), name: 'لابتوب ديل', price: 250000, stock: 15, category: 'إلكترونيات', barcode: '123456789' },
          { id: generateId(), name: 'كيبورد ميكانيكي', price: 35000, stock: 30, category: 'إكسسوارات', barcode: '987654321' },
          { id: generateId(), name: 'شاشة 24 بوصة', price: 85000, stock: 8, category: 'شاشات', barcode: '112233445' },
        ];
        saveToStorage('products', storedProducts);
      }
      setProducts(storedProducts);
      setSales(getFromStorage<Sale[]>('sales', []));
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = { id: generateId(), ...productData };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveToStorage('products', updatedProducts);
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id'>>) => {
    const updatedProducts = products.map(p => p.id === id ? { ...p, ...productData } : p);
    setProducts(updatedProducts);
    saveToStorage('products', updatedProducts);
  };

  const deleteProduct = async (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    saveToStorage('products', updatedProducts);
  };
  
  const getProductById = (id: string) => products.find(p => p.id === id);

  const addSale = async (saleData: Omit<Sale, 'id'>) => {
    const newSale: Sale = { id: generateId(), ...saleData };
    
    // Decrease stock for each item in the sale
    let stockSufficient = true;
    const updatedProducts = [...products];

    for (const item of newSale.items) {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
            if (updatedProducts[productIndex].stock >= item.quantity) {
                updatedProducts[productIndex].stock -= item.quantity;
            } else {
                stockSufficient = false;
                toast({
                  variant: "destructive",
                  title: "خطأ في المخزون",
                  description: `الكمية غير كافية للمنتج: ${updatedProducts[productIndex].name}`,
                });
                break;
            }
        } else {
             stockSufficient = false;
             toast({
                variant: "destructive",
                title: "خطأ",
                description: `المنتج بالمعرف ${item.productId} غير موجود.`,
             });
             break;
        }
    }

    if (stockSufficient) {
        const updatedSales = [...sales, newSale];
        setSales(updatedSales);
        saveToStorage('sales', updatedSales);
        setProducts(updatedProducts);
        saveToStorage('products', updatedProducts);
    } else {
        throw new Error("لا يمكن إتمام البيع بسبب عدم كفاية المخزون.");
    }
  };

  const updateSale = async (id: string, saleData: Partial<Omit<Sale, 'id'>>) => {
    // This is a simplified update. A real-world scenario would need complex logic 
    // to handle stock adjustments between the old and new sale items.
    const updatedSales = sales.map(s => s.id === id ? { ...s, ...saleData, id } : s);
    setSales(updatedSales);
    saveToStorage('sales', updatedSales);
    // Note: Stock is not adjusted on update in this simplified version.
  };
  
  const deleteSale = async (id: string) => {
    const saleToDelete = sales.find(s => s.id === id);
    if (!saleToDelete) return;

    // Restore stock
    const updatedProducts = [...products];
    for (const item of saleToDelete.items) {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex > -1) {
        updatedProducts[productIndex].stock += item.quantity;
      }
    }

    const updatedSales = sales.filter(s => s.id !== id);
    setSales(updatedSales);
    saveToStorage('sales', updatedSales);
    setProducts(updatedProducts);
    saveToStorage('products', updatedProducts);
  };

  const returnProduct = async (returnData: { saleId: string; productId: string; quantity: number }) => {
      const { saleId, productId, quantity } = returnData;

      const updatedSales = [...sales];
      const saleIndex = updatedSales.findIndex(s => s.id === saleId);
      if (saleIndex === -1) throw new Error("Sale not found");

      const saleToUpdate = { ...updatedSales[saleIndex] };
      const newReturn: SaleReturn = {
          productId,
          quantity,
          date: new Date().toISOString(),
      };
      
      saleToUpdate.returns = [...(saleToUpdate.returns || []), newReturn];
      updatedSales[saleIndex] = saleToUpdate;

      const updatedProducts = [...products];
      const productIndex = updatedProducts.findIndex(p => p.id === productId);
      if (productIndex > -1) {
          updatedProducts[productIndex].stock += quantity;
      }

      setSales(updatedSales);
      saveToStorage('sales', updatedSales);
      setProducts(updatedProducts);
      saveToStorage('products', updatedProducts);
  };

  return (
    <AppContext.Provider value={{ products, sales, loading, addProduct, updateProduct, deleteProduct, getProductById, addSale, updateSale, deleteSale, returnProduct, refreshData }}>
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
