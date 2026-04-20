import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { useAuth } from '@/components/AuthContext';
import Navbar from '@/components/navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { user } = useAuth();
    const isMobile = useIsMobile();

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
            {/* Main Navbar */}
            <Navbar auth={{ user }} />
            {/* Sidebar Layout */}
            <div className={`mt-2.5 flex flex-1 ${isMobile ? 'ml-0' : 'ml-64'}`}>
                <AppShell variant="sidebar">
                    {!isMobile && <AppSidebar />}
                    <AppContent variant="sidebar" className={`overflow-x-hidden pb-8 ${isMobile ? 'mx-auto max-w-7xl' : ''}`}>
                        <AppSidebarHeader breadcrumbs={breadcrumbs} />
                        {children}
                    </AppContent>
                </AppShell>
            </div>
        </div>
    );
}
