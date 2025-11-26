import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { LayoutGrid, Folder, MessageSquare, Store, BookOpen, Mail, MapPin } from 'lucide-react';
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
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Rental</SidebarGroupLabel>
                    <SidebarMenu>
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
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link to="/dashboard/rental-chat">
                                    <MessageSquare className="mr-2" />
                                    Rental Chat
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Pick & Drop</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link to="/dashboard/pick-and-drop">
                                    <MapPin className="mr-2" />
                                    Pick & Drop Services
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link to="/dashboard/pick-and-drop-chat">
                                    <MessageSquare className="mr-2" />
                                    Pick & Drop Chat
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Other</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link to="/dashboard/inquiries">
                                    <Mail className="mr-2" />
                                    Inquiries
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                {/* Removed NavFooter, NavUser, and auth buttons from sidebar */}
            </SidebarFooter>
        </Sidebar>
    );
}
