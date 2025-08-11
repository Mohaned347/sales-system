import type { Metadata } from 'next';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#2563eb',
};

export default function Head() {
  return (
    <>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#2563eb" />
      <link rel="icon" href="/icons/icon-192.svg" sizes="192x192" type="image/svg+xml" />
      <link rel="icon" href="/icons/icon-512.svg" sizes="512x512" type="image/svg+xml" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
    </>
  );
}
