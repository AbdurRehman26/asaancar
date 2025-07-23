import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { LayoutGrid, Folder, MessageSquare, Store, BookOpen } from 'lucide-react';
import AppLogo from './app-logo';
import { useAuth } from '@/components/AuthContext';
import { useState, useEffect, useRef } from 'react';

export function AppSidebar() {
    const { user } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const wasLoginOpen = useRef(false);

    useEffect(() => {
        console.log('Sidebar - Auth user changed:', user, 'Login open:', loginOpen);
        if (user && loginOpen) {
            console.log('Sidebar - Closing login modal');
            setLoginOpen(false);
        }
        wasLoginOpen.current = loginOpen;
    }, [user, loginOpen]);
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/dashboard">
                                <LayoutGrid className="mr-2" />
                                Dashboard Home
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/dashboard/cars">
                                <Folder className="mr-2" />
                                Car Listings
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/dashboard/stores">
                                <Store className="mr-2" />
                                Car Stores
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/dashboard/messages">
                                <MessageSquare className="mr-2" />
                                Messages
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {user && Array.isArray(user.roles) && user.roles.includes('store_owner') && (
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link to="/dashboard/store-bookings">
                                    <BookOpen className="mr-2" />
                                    Store Bookings
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main navigation removed since Dashboard is in profile dropdown */}
            </SidebarContent>

            <SidebarFooter>
                {/* Removed NavFooter, NavUser, and auth buttons from sidebar */}
            </SidebarFooter>
        </Sidebar>
    );
}
