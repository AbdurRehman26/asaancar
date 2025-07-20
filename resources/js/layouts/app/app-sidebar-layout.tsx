import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import Navbar from '@/components/navbar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { useAuth } from '@/components/AuthContext';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen w-full flex-col pt-16">
            {/* Main Navbar */}
            <Navbar 
                auth={{ user }}
            />
            
            {/* Sidebar Layout */}
            <div className="flex flex-1 ml-64">
                <AppShell variant="sidebar">
                    <AppSidebar />
                    <AppContent variant="sidebar" className="overflow-x-hidden">
                        <AppSidebarHeader breadcrumbs={breadcrumbs} />
                        {children}
                    </AppContent>
                </AppShell>
            </div>
        </div>
    );
}
