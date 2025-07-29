"use client"

import { Suspense, lazy } from 'react';
import TrialAlert from '@/components/trial-status/trial-alert';

const Products = lazy(() => import('@/components/the-mainsystem/Products'));

export default function ProductsPage() {
  return (
    <div className="p-4 md:p-6">
      <TrialAlert />
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      }>
        <Products />
      </Suspense>
    </div>
  );
}
