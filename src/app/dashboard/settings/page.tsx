"use client";

import dynamic from 'next/dynamic';

const Settings = dynamic(() => import('@/components/the-mainsystem/Settings.jsx'), { ssr: false });

export default function SettingsPage() {
  return <Settings />;
}