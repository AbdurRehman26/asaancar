import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import Navbar from '@/components/navbar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { user } = useAuth();
    const isMobile = useIsMobile();

    return (
        <div>
            {/* Main Navbar */}
            <Navbar
                auth={{ user }}
            />
            {/* Sidebar Layout */}
            <div className={`flex flex-1 mt-2.5 ${isMobile ? 'ml-0' : 'ml-64'}`}>
                <AppShell variant="sidebar">
                    {!isMobile && <AppSidebar />}
                    <AppContent variant="sidebar" className={`overflow-x-hidden ${isMobile ? 'mx-auto max-w-7xl' : ''}`}>
                        <AppSidebarHeader breadcrumbs={breadcrumbs} />
                        {children}
                    </AppContent>
                </AppShell>
            </div>
        </div>
    );
}
