import { useAuth } from '@/components/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { LayoutGrid, Mail, MapPin, Menu, Route, User, X, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NotificationBell } from './notification-bell';
import DarkModeToggle from './ui/dark-mode-toggle';

type NavbarProps = {
    currentPage?: string;
    auth?: {
        user?: unknown;
    };
};

const Navbar: React.FC<NavbarProps> = ({ currentPage = '' }) => {
    const { user } = useAuth();
    const canViewInquiries = user?.id === 1;
    const getInitials = useInitials();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isDashboardTheme = location.pathname.startsWith('/dashboard');
    const userDropdownClassName = isDashboardTheme
        ? 'z-[80] w-56 border-[#eadfeb] bg-white text-[#2f2231] shadow-[0_18px_40px_-28px_rgba(126,36,108,0.22)] dark:border-white/10 dark:bg-[#17141f] dark:text-white'
        : 'z-[80] w-56 border-[#eadfeb] bg-white text-[#2f2231] shadow-[0_18px_40px_-28px_rgba(126,36,108,0.18)] dark:border-white/10 dark:bg-[#17141f] dark:text-white';
    const navLinkClassName = (page: string): string =>
        `flex items-center gap-2 text-sm font-semibold transition ${
            isDashboardTheme
                ? currentPage === page
                    ? 'text-[#2f2231] dark:text-white'
                    : 'text-[#6b5368] hover:text-[#2f2231] dark:text-white/75 dark:hover:text-white'
                : currentPage === page
                  ? 'text-[#2f2231] dark:text-white'
                  : 'text-[#6b5368] hover:text-[#2f2231] dark:text-white/75 dark:hover:text-white'
        }`;

    // Nav links as a component for reuse
    const NavLinks = (
        <>
            <Link to="/pick-and-drop" className={navLinkClassName('pick-and-drop')} onClick={() => setMobileMenuOpen(false)}>
                <MapPin className="h-4 w-4" />
                Find a Ride
            </Link>
            <Link to="/ride-requests" className={navLinkClassName('ride-requests')} onClick={() => setMobileMenuOpen(false)}>
                <Route className="h-4 w-4" />
                Ride Requests
            </Link>
            <Link to="/contact" className={navLinkClassName('contact')} onClick={() => setMobileMenuOpen(false)}>
                <Mail className="h-4 w-4" />
                Contact Us
            </Link>
            {user && user.roles && Array.isArray(user.roles) && user.roles.includes('admin') && (
                <Link to="/dashboard" className={navLinkClassName('dashboard')} onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4" />
                    Dashboard
                </Link>
            )}
            {/* Auth Buttons */}
            {!user ? (
                <>
                    <Link
                        to="/login"
                        className={
                            isDashboardTheme
                                ? 'rounded-xl border border-[#7e246c]/12 bg-white px-4 py-2 font-semibold text-[#6b2f61] transition hover:bg-[#fcf6fb] dark:border-white/10 dark:bg-white/6 dark:text-white dark:hover:bg-white/10'
                                : 'rounded-xl border border-[#7e246c]/12 bg-white px-4 py-2 font-semibold text-[#6b2f61] transition hover:bg-[#fcf6fb] dark:border-white/10 dark:bg-white/6 dark:text-white dark:hover:bg-white/10'
                        }
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className={
                            isDashboardTheme
                                ? 'rounded-xl bg-[#7e246c] px-4 py-2 font-semibold text-white transition hover:bg-[#67205a]'
                                : 'rounded-xl bg-[#7e246c] px-4 py-2 font-semibold text-white transition hover:bg-[#67205a]'
                        }
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Register Now
                    </Link>
                    <DarkModeToggle />
                </>
            ) : (
                <div className="flex items-center space-x-2">
                    <DarkModeToggle />
                    <NotificationBell />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-10 rounded-full p-1">
                                <Avatar className="size-8 overflow-hidden rounded-full">
                                    <AvatarImage src={user.profile_image || user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className={userDropdownClassName} align="end" side="bottom" sideOffset={10}>
                            <UserMenuContent user={user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </>
    );

    return (
        <nav className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-white/60 bg-white/75 px-6 py-[13px] text-[#2f2231] shadow-[0_18px_40px_-34px_rgba(126,36,108,0.18)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/75 dark:text-white dark:shadow-none">
            <div className="flex items-center gap-2 text-xl font-bold text-[#2f2231] dark:text-white">
                <Link to="/" className="flex items-center gap-2 transition hover:text-[#4b2b46] dark:hover:text-white/90">
                    <img src="/images/car-logo-nameless.png" alt="AsaanCar Logo" className="h-12 w-20" />
                    <span>AsaanCar</span>
                </Link>
            </div>
            {/* Desktop Nav */}
            <div className="hidden flex-1 items-center justify-between md:flex">
                {/* Centered nav links */}
                <div className="mx-auto flex items-center space-x-6">
                    <Link to="/pick-and-drop" className={navLinkClassName('pick-and-drop')} onClick={() => setMobileMenuOpen(false)}>
                        <MapPin className="h-4 w-4" />
                        Find a Ride
                    </Link>
                    <Link to="/ride-requests" className={navLinkClassName('ride-requests')} onClick={() => setMobileMenuOpen(false)}>
                        <Route className="h-4 w-4" />
                        Ride Requests
                    </Link>
                    <Link to="/contact" className={navLinkClassName('contact')} onClick={() => setMobileMenuOpen(false)}>
                        <Mail className="h-4 w-4" />
                        Contact Us
                    </Link>
                    {user && user.roles && Array.isArray(user.roles) && user.roles.includes('admin') && (
                        <Link to="/dashboard" className={navLinkClassName('dashboard')} onClick={() => setMobileMenuOpen(false)}>
                            <User className="h-4 w-4" />
                            Dashboard
                        </Link>
                    )}
                </div>
                {/* Right-aligned auth and toggle */}
                {!user ? (
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className={
                                isDashboardTheme
                                    ? 'text-sm font-semibold text-[#6b5368] transition hover:text-[#2f2231] dark:text-white/75 dark:hover:text-white'
                                    : 'text-sm font-semibold text-[#6b5368] transition hover:text-[#2f2231] dark:text-white/75 dark:hover:text-white'
                            }
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className={
                                isDashboardTheme
                                    ? 'rounded-xl bg-[#7e246c] px-4 py-2 font-semibold text-white transition hover:bg-[#67205a]'
                                    : 'rounded-xl bg-[#7e246c] px-4 py-2 font-semibold text-white transition hover:bg-[#67205a]'
                            }
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Register Now
                        </Link>
                        <DarkModeToggle />
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <DarkModeToggle />
                        <NotificationBell />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-10 rounded-full p-1">
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage src={user.profile_image || user.avatar} alt={user.name} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className={userDropdownClassName} align="end" side="bottom" sideOffset={10}>
                                <UserMenuContent user={user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
            {/* Mobile Burger */}
            <button
                className={`flex items-center justify-center rounded-md p-2 focus:outline-none md:hidden ${
                    isDashboardTheme
                        ? 'text-[#2f2231] focus:ring-2 focus:ring-[#7e246c]/30 dark:text-white dark:focus:ring-white/30'
                        : 'text-[#2f2231] focus:ring-2 focus:ring-[#7e246c]/30 dark:text-white dark:focus:ring-white/30'
                }`}
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label="Open menu"
            >
                {mobileMenuOpen ? <X className="h-7 w-7 md:hidden" /> : <Menu className="h-7 w-7 md:hidden" />}
            </button>
            {/* Mobile Menu Overlay and Drawer - only render when open */}
            {mobileMenuOpen && (
                <>
                    {/* Overlay */}
                    <div className="fixed inset-0 z-[90] bg-black/50" onClick={() => setMobileMenuOpen(false)} />
                    {/* Drawer */}
                    <div
                        className={`fixed top-0 right-0 z-[100] flex h-dvh min-h-screen w-64 flex-col border-l shadow-lg md:hidden ${
                            isDashboardTheme
                                ? 'border-[#eadfeb] bg-white text-[#2f2231] dark:border-white/10 dark:bg-[#17141f] dark:text-white'
                                : 'border-[#eadfeb] bg-white text-[#2f2231] dark:border-white/10 dark:bg-[#17141f] dark:text-white'
                        }`}
                        onClick={(e) => e.stopPropagation()} // Prevent overlay click from bubbling
                    >
                        <div
                            className={`flex shrink-0 items-center justify-between px-6 py-4 ${
                                isDashboardTheme ? 'border-b border-[#eadfeb] dark:border-white/10' : 'border-b border-[#eadfeb] dark:border-white/10'
                            }`}
                        >
                            <span className="text-xl font-bold text-[#2f2231] dark:text-white">Menu</span>
                            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                                <X className="h-6 w-6 text-[#2f2231] dark:text-white" />
                            </button>
                        </div>
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-inherit px-6 py-6">
                            {NavLinks}

                            {/* Dashboard Sidebar Section - Only show for store owners and admins */}
                            {user && user.roles && Array.isArray(user.roles) && user.roles.includes('admin') && (
                                <>
                                    <div className="my-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                                        <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Dashboard
                                        </h3>

                                        {/* Dashboard Home */}
                                        <Link
                                            to="/dashboard"
                                            className="flex items-center gap-3 py-2 text-sm font-medium text-gray-700 transition hover:text-[#7e246c] dark:text-neutral-300 dark:hover:text-white"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                            Dashboard Home
                                        </Link>

                                        {/* Pick & Drop Section */}
                                        <div className="mt-4">
                                            <h4 className="mb-2 px-1 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                                Pick & Drop
                                            </h4>
                                            <div className="flex flex-col gap-1">
                                                <Link
                                                    to="/dashboard/pick-and-drop"
                                                    className="flex items-center gap-3 px-1 py-2 text-sm font-medium text-gray-700 transition hover:text-[#7e246c] dark:text-neutral-300 dark:hover:text-white"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <MapPin className="h-4 w-4" />
                                                    Pick & Drop Services
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Other Section */}
                                        <div className="mt-4">
                                            <h4 className="mb-2 px-1 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                                Other
                                            </h4>
                                            <div className="flex flex-col gap-1">
                                                {canViewInquiries && (
                                                    <Link
                                                        to="/dashboard/inquiries"
                                                        className="flex items-center gap-3 px-1 py-2 text-sm font-medium text-gray-700 transition hover:text-[#7e246c] dark:text-neutral-300 dark:hover:text-white"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                        Inquiries
                                                    </Link>
                                                )}
                                                <Link
                                                    to="/dashboard/profile"
                                                    className="flex items-center gap-3 px-1 py-2 text-sm font-medium text-gray-700 transition hover:text-[#7e246c] dark:text-neutral-300 dark:hover:text-white"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <User className="h-4 w-4" />
                                                    Profile
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Admin Section */}
                                        {user.roles.includes('admin') && (
                                            <div className="mt-4">
                                                <h4 className="mb-2 px-1 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                                    Admin
                                                </h4>
                                                <div className="flex flex-col gap-1">
                                                    <Link
                                                        to="/admin-dashboard"
                                                        className="flex items-center gap-3 px-1 py-2 text-sm font-medium text-gray-700 transition hover:text-[#7e246c] dark:text-neutral-300 dark:hover:text-white"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        <Zap className="h-4 w-4" />
                                                        API Testing
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Navbar;
