'use client';
import dynamic from 'next/dynamic';

// Dynamically import the dashboard content with SSR disabled
const DashboardContent = dynamic(
  () => import('./DashboardContent'),
  { ssr: false }
);

export default function DashboardPage() {
  return <DashboardContent />;
}