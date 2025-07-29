'use client';

import { Suspense, lazy } from 'react';
import dynamic from 'next/dynamic';
import TrialAlert from '@/components/trial-status/trial-alert';

// Dynamically import the Sales component with SSR disabled
const Sales = dynamic(
  () => import('@/components/the-mainsystem/Sales').then(mod => mod.default),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  )}
);

// Create a client-side only wrapper for the Sales component
function SalesClientWrapper() {
  const { useAppContext } = require('@/context/app-context');
  const context = useAppContext();
  
  if (!context) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading application context...</div>
      </div>
    );
  }

  const {
    sales = [],
    loading,
    addSale,
    updateSale,
    deleteSale,
    returnProduct,
    refreshData,
    getProductById,
    deletedProducts = []
  } = context;

  const safeRefreshData = refreshData || (() => console.log('refreshData not available'));

  return (
    <Sales 
      sales={sales}
      loading={loading}
      addSale={addSale}
      updateSale={updateSale}
      deleteSale={deleteSale}
      returnProduct={returnProduct}
      refreshData={safeRefreshData}
      getProductById={getProductById}
      deletedProducts={deletedProducts}
    />
  );
}

export default function SalesPage() {
  return (
    <div className="p-4 md:p-6">
      <TrialAlert />
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      }>
        <SalesClientWrapper />
      </Suspense>
    </div>
  );
}
