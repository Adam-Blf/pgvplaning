'use client';

import dynamic from 'next/dynamic';
import { BarChart3, PieChart, Table } from 'lucide-react';

// Skeleton component for loading state
function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Sidebar Skeleton */}
      <aside className="w-64 fixed h-full bg-slate-800/50 border-slate-700 border-r">
        <div className="h-16 flex items-center px-6 border-slate-700 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-700/30 rounded-xl animate-pulse" />
          ))}
        </nav>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 ml-64">
        <header className="h-16 bg-slate-800/50 border-slate-700 border-b px-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-64 bg-slate-700 rounded animate-pulse" />
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-800/50 border-slate-700 border p-6">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-700 animate-pulse" />
                  <div className="w-16 h-6 rounded-lg bg-slate-700 animate-pulse" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="mt-4 h-2 bg-slate-700 rounded-full animate-pulse" />
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 rounded-2xl bg-slate-800/50 border-slate-700 border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-64 bg-slate-700 rounded animate-pulse" />
                </div>
                <BarChart3 className="w-5 h-5 text-slate-600" />
              </div>
              <div className="h-72 bg-slate-700/30 rounded-xl animate-pulse flex items-center justify-center">
                <BarChart3 className="w-16 h-16 text-slate-600" />
              </div>
            </div>
            <div className="rounded-2xl bg-slate-800/50 border-slate-700 border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
                </div>
                <PieChart className="w-5 h-5 text-slate-600" />
              </div>
              <div className="h-64 bg-slate-700/30 rounded-xl animate-pulse flex items-center justify-center">
                <PieChart className="w-16 h-16 text-slate-600" />
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="rounded-2xl bg-slate-800/50 border-slate-700 border">
            <div className="p-6 flex items-center justify-between border-b border-slate-700">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-56 bg-slate-700 rounded animate-pulse" />
              </div>
              <Table className="w-5 h-5 text-slate-600" />
            </div>
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-700/30 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Lazy load the heavy analytics dashboard (saves ~128KB on initial load)
const AnalyticsDashboard = dynamic(
  () => import('@/components/features/analytics-dashboard'),
  {
    loading: () => <AnalyticsSkeleton />,
    ssr: false, // Disable SSR for charts (they need window)
  }
);

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
