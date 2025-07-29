import { createContext, useContext, useState, useCallback } from 'react';
import { 
  collection, doc, setDoc, getDocs, serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useSales } from './salesContext';
import { useProducts } from './productContext';
import { useAppContext } from '@/context/app-context';
import { useAuth } from './AuthContext';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const [analyticsReports, setAnalyticsReports] = useState([]);
  const { user } = useAuth();
  const { getUserCollection, parseFirebaseDate, setLoading } = useAppContext();
  const { sales } = useSales();
  const { products } = useProducts();

  const fetchAnalyticsReports = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const reportsCol = getUserCollection('analyticsReports');
      if (!reportsCol) return;
      
      const reportsSnapshot = await getDocs(query(reportsCol, orderBy('createdAt', 'desc')));
      setAnalyticsReports(reportsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: parseFirebaseDate(doc.data().createdAt)
      })));
    } catch (error) {
      console.error('Error fetching analytics reports:', error);
      toast.error('حدث خطأ في جلب التقارير التحليلية');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, getUserCollection, parseFirebaseDate, setLoading]);

  const saveAnalyticsReport = useCallback(async (reportData) => {
    try {
      const reportsCol = getUserCollection('analyticsReports');
      if (!reportsCol) throw new Error('Reports collection not available');
      
      const reportRef = doc(reportsCol);
      await setDoc(reportRef, {
        ...reportData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return reportRef.id;
    } catch (error) {
      console.error('Error saving analytics report:', error);
      throw error;
    }
  }, [getUserCollection]);

  const getSalesAnalytics = useCallback((period = 'daily') => {
    const now = new Date();
    
    const filteredSales = sales.filter(sale => {
      if (!sale?.date) return false;
      const saleDate = new Date(sale.date);
      
      switch(period.toLowerCase()) {
        case 'daily':
          return (
            saleDate.getDate() === now.getDate() &&
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear()
          );
        case 'monthly':
          return (
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear()
          );
        case 'yearly':
          return saleDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    const totalSales = filteredSales.reduce((sum, sale) => sum + (sale?.total || 0), 0);
    const salesCount = filteredSales.length;
    const averageSale = salesCount > 0 ? totalSales / salesCount : 0;

    return {
      totalSales,
      salesCount,
      averageSale,
      [period.toLowerCase() + 'Sales']: filteredSales
    };
  }, [sales]);

  const getInventoryReport = useCallback(() => {
    const outOfStock = products.filter(p => p.stock <= 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10);
    const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

    return {
      totalProducts: products.length,
      outOfStock: outOfStock.length,
      lowStock: lowStock.length,
      totalStockValue: totalValue,
      lowStockItems: lowStock,
      outOfStockItems: outOfStock,
      products: [...products]
    };
  }, [products]);

  const generateAndSaveReports = useCallback(async () => {
    try {
      // Daily Sales Report
      const dailyAnalytics = getSalesAnalytics('daily');
      await saveAnalyticsReport({
        type: 'daily',
        date: new Date().toISOString().split('T')[0],
        data: {
          totalSales: dailyAnalytics.totalSales,
          salesCount: dailyAnalytics.salesCount,
          averageSale: dailyAnalytics.averageSale
        }
      });

      // Monthly Sales Report
      const monthlyAnalytics = getSalesAnalytics('monthly');
      await saveAnalyticsReport({
        type: 'monthly',
        date: `${new Date().getFullYear()}-${new Date().getMonth()+1}`,
        data: {
          totalSales: monthlyAnalytics.totalSales,
          salesCount: monthlyAnalytics.salesCount,
          averageSale: monthlyAnalytics.averageSale
        }
      });

      // Inventory Report
      const inventoryReport = getInventoryReport();
      await saveAnalyticsReport({
        type: 'inventory',
        date: new Date().toISOString().split('T')[0],
        data: {
          totalProducts: inventoryReport.totalProducts,
          outOfStock: inventoryReport.outOfStock,
          lowStock: inventoryReport.lowStock,
          totalValue: inventoryReport.totalStockValue
        }
      });

      return true;
    } catch (error) {
      console.error('Error generating reports:', error);
      toast.error('حدث خطأ في إنشاء التقارير');
      throw error;
    }
  }, [getSalesAnalytics, getInventoryReport, saveAnalyticsReport]);

  return (
    <AnalyticsContext.Provider
      value={{
        analyticsReports,
        fetchAnalyticsReports,
        getSalesAnalytics,
        getInventoryReport,
        generateAndSaveReports,
        saveAnalyticsReport
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};