// App Layout (Protected Routes)
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const { user, loading, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, initialized, router]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-techno text-muted-foreground">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className={cn('pt-16 md:ml-64 min-h-screen')}>
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}