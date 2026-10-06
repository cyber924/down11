
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { ReactNode } from 'react';

/**
 * @fileOverview 클라이언트 전용 레이아웃 래퍼
 * 경로에 따른 사이드바 노출 여부 및 Firebase 상태를 관리합니다.
 */
export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // 블로그나 웹진, 뉴스 포털 혹은 도메인 리라이트된 경로에서는 사이드바를 숨깁니다.
  const isPublicView = 
    pathname?.startsWith('/blog') || 
    pathname?.startsWith('/webzine') || 
    pathname?.startsWith('/news') ||
    pathname === '/'; 

  return (
    <FirebaseClientProvider>
      {isPublicView ? (
        <main className="min-h-screen">
          {children}
        </main>
      ) : (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <main className="min-h-screen p-6 md:p-10">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      )}
      <Toaster />
    </FirebaseClientProvider>
  );
}
