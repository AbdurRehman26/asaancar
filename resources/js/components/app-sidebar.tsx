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
import { useChatUnreadSummary } from '@/hooks/use-chat-unread-summary';
import { LayoutGrid, Mail, MapPin, MessageSquare, Route, User, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function AppSidebar() {
    const { user } = useAuth();
    const { unreadConversations } = useChatUnreadSummary(Boolean(user));
    const canViewInquiries = user?.id === 1;
    const [loginOpen, setLoginOpen] = useState(false);
    const wasLoginOpen = useRef(false);
    const location = useLocation();

    useEffect(() => {
        if (user && loginOpen) {
            setLoginOpen(false);
        }
        wasLoginOpen.current = loginOpen;
    }, [user, loginOpen]);

    const isActive = (href: string): boolean => {
        return location.pathname === href || location.pathname.startsWith(`${href}/`);
    };

    const menuButtonClassName =
        'rounded-2xl px-3 text-[#5f4b5f] hover:bg-white/70 hover:text-[#2f2231] data-[active=true]:bg-white data-[active=true]:text-[#2f2231] data-[active=true]:shadow-[inset_0_0_0_1px_rgba(126,36,108,0.08),0_16px_30px_-24px_rgba(126,36,108,0.35)] dark:text-white/80 dark:hover:bg-white/8 dark:hover:text-white dark:data-[active=true]:bg-white/12 dark:data-[active=true]:text-white dark:data-[active=true]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]';

    return (
        <Sidebar collapsible="icon" className="mt-2">
            <SidebarHeader className="border-b border-[#eadfeb] px-4 pt-4 pb-5 dark:border-white/10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="rounded-[1.75rem] border border-[#eadfeb] bg-white/85 p-4 shadow-[0_24px_40px_-32px_rgba(126,36,108,0.2)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_20px_45px_-32px_rgba(0,0,0,0.9)]">
                            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#8a7187] uppercase dark:text-white/45">Workspace</p>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d88ac8] via-[#9d3d88] to-[#7e246c] text-base font-semibold text-white">
                                    A
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#2f2231] dark:text-white">AsaanCar</p>
                                    <p className="truncate text-xs text-[#8a7187] dark:text-white/55">Driver & rider workspace</p>
                                </div>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild isActive={isActive('/dashboard')} className={menuButtonClassName}>
                            <Link to="/dashboard">
                                <LayoutGrid className="mr-2" />
                                Dashboard Home
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-2">
                    <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-[0.24em] text-[#9b8399] uppercase dark:text-white/35">
                        Rides
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild isActive={isActive('/dashboard/pick-and-drop')} className={menuButtonClassName}>
                                <Link to="/dashboard/pick-and-drop">
                                    <MapPin className="mr-2" />
                                    Find a Ride
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild isActive={isActive('/dashboard/ride-requests')} className={menuButtonClassName}>
                                <Link to="/dashboard/ride-requests">
                                    <Route className="mr-2" />
                                    Ride Requests
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild isActive={isActive('/dashboard/chat')} className={menuButtonClassName}>
                                <Link to="/dashboard/chat">
                                    <MessageSquare className="mr-2" />
                                    Chat
                                    {unreadConversations > 0 && (
                                        <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-[#7e246c] px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-[#2b1128]">
                                            {unreadConversations}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup className="px-2">
                    <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-[0.24em] text-[#9b8399] uppercase dark:text-white/35">
                        Account
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {canViewInquiries && (
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild isActive={isActive('/dashboard/inquiries')} className={menuButtonClassName}>
                                    <Link to="/dashboard/inquiries">
                                        <Mail className="mr-2" />
                                        Inquiries
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild isActive={isActive('/dashboard/profile')} className={menuButtonClassName}>
                                <Link to="/dashboard/profile">
                                    <User className="mr-2" />
                                    Profile
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {user && Array.isArray(user.roles) && user.roles.includes('admin') && (
                    <SidebarGroup className="px-2">
                        <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-[0.24em] text-[#9b8399] uppercase dark:text-white/35">
                            Admin
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild isActive={isActive('/admin-dashboard')} className={menuButtonClassName}>
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
