import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { LayoutGrid, Folder, MessageSquare, Store, BookOpen, Mail } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useState, useEffect, useRef } from 'react';

export function AppSidebar() {
    const { user } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const wasLoginOpen = useRef(false);

    useEffect(() => {
        if (user && loginOpen) {
            setLoginOpen(false);
        }
        wasLoginOpen.current = loginOpen;
    }, [user, loginOpen]);
    return (
        <Sidebar collapsible="icon" className="mt-2">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
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
                                Chat
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/dashboard/inquiries">
                                <Mail className="mr-2" />
                                Inquiries
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
