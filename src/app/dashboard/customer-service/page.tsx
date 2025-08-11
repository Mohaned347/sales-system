"use client";

import dynamic from 'next/dynamic';

const CustomerService = dynamic(() => import('@/components/the-mainsystem/CustomerService.jsx'), { ssr: false });

export default function CustomerServicePage() {
  return <CustomerService />;
}