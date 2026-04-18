import { useAuth } from '@/components/AuthContext';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { LayoutGrid, Mail, MapPin, MessageSquare, Route, User, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export function AppSidebar() {
    const { user } = useAuth();
    const canViewInquiries = user?.id === 1;
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
                        <SidebarMenuButton size="lg" asChild></SidebarMenuButton>
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
                    <SidebarGroupLabel>Rides</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link to="/dashboard/pick-and-drop">
                                    <MapPin className="mr-2" />
                                    Find a Ride
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link to="/dashboard/ride-requests">
                                    <Route className="mr-2" />
                                    Ride Requests
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link to="/dashboard/pick-and-drop-chat">
                                    <MessageSquare className="mr-2" />
                                    Ride Chat
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Other</SidebarGroupLabel>
                    <SidebarMenu>
                        {canViewInquiries && (
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild>
                                    <Link to="/dashboard/inquiries">
                                        <Mail className="mr-2" />
                                        Inquiries
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link to="/dashboard/profile">
                                    <User className="mr-2" />
                                    Profile
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {user && Array.isArray(user.roles) && user.roles.includes('admin') && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Admin</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild>
                                    <Link to="/admin-dashboard">
                                        <Zap className="mr-2" />
                                        API Testing
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>{/* Removed NavFooter, NavUser, and auth buttons from sidebar */}</SidebarFooter>
        </Sidebar>
    );
}
