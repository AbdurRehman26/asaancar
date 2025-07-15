import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from 'react-router-dom';
import { BookOpen, Folder, LayoutGrid, MessageSquare } from 'lucide-react';
import AppLogo from './app-logo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LoginModal from '@/pages/auth/login-modal';
import { useAuth } from '@/components/AuthContext';
import { useState, useEffect, useRef } from 'react';

const mainNavItems: NavItem[] = [
    // Dashboard moved to profile dropdown
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/asaancar/platform',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://asaancar.com/docs',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { user } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
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
        <Sidebar collapsible="icon" variant="inset">
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
                            <Link to="/dashboard/messages">
                                <MessageSquare className="mr-2" />
                                Messages
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
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
