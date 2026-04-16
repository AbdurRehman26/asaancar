import { useAuth } from '@/components/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { LayoutGrid, Mail, MapPin, Menu, User, X, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

    // Nav links as a component for reuse
    const NavLinks = (
        <>
            <Link
                to="/pick-and-drop"
                className={`flex items-center gap-2 text-sm font-semibold transition ${
                    currentPage === 'pick-and-drop'
                        ? 'text-[#7e246c] dark:text-white'
                        : 'text-gray-600 hover:text-[#7e246c] dark:text-neutral-400 dark:hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
            >
                <MapPin className="h-4 w-4" />
                Pick & Drop
            </Link>
            <Link
                to="/contact"
                className={`flex items-center gap-2 text-sm font-semibold transition ${
                    currentPage === 'contact'
                        ? 'text-[#7e246c] dark:text-white'
                        : 'text-gray-600 hover:text-[#7e246c] dark:text-neutral-400 dark:hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
            >
                <Mail className="h-4 w-4" />
                Contact Us
            </Link>
            {user && user.roles && Array.isArray(user.roles) && user.roles.includes('admin') && (
                <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 text-sm font-semibold transition ${
                        currentPage === 'dashboard'
                            ? 'text-[#7e246c] dark:text-white'
                            : 'text-gray-600 hover:text-[#7e246c] dark:text-neutral-400 dark:hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <User className="h-4 w-4" />
                    Dashboard
                </Link>
            )}
            {/* Auth Buttons */}
            {!user ? (
                <>
                    <Link
                        to="/login"
                        className="rounded-md bg-[#7e246c] px-4 py-2 font-semibold text-white transition hover:bg-[#6a1f5c]"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="rounded-md bg-[#7e246c] px-4 py-2 font-semibold text-white transition hover:bg-[#6a1f5c]"
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
                        <DropdownMenuContent className="w-56" align="end">
                            <UserMenuContent user={user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </>
    );

    return (
        <nav className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-neutral-200 bg-white px-6 py-[13px] dark:border-neutral-800 dark:bg-gray-800/80">
            <div className="flex items-center gap-2 text-xl font-bold text-[#7e246c]">
                <Link to="/" className="flex items-center gap-2 transition hover:text-[#6a1f5c]">
                    <img src="/images/car-logo-nameless.png" alt="AsaanCar Logo" className="h-12 w-20" />
                    <span>AsaanCar</span>
                </Link>
            </div>
            {/* Desktop Nav */}
            <div className="hidden flex-1 items-center justify-between md:flex">
                {/* Centered nav links */}
                <div className="mx-auto flex items-center space-x-6">
                    <Link
                        to="/pick-and-drop"
                        className={`flex items-center gap-2 text-sm font-semibold transition ${
                            currentPage === 'pick-and-drop'
                                ? 'text-[#7e246c] dark:text-white'
                                : 'text-gray-600 hover:text-[#7e246c] dark:text-neutral-400 dark:hover:text-white'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <MapPin className="h-4 w-4" />
                        Pick & Drop
                    </Link>
                    <Link
                        to="/contact"
                        className={`flex items-center gap-2 text-sm font-semibold transition ${
                            currentPage === 'contact'
                                ? 'text-[#7e246c] dark:text-white'
                                : 'text-gray-600 hover:text-[#7e246c] dark:text-neutral-400 dark:hover:text-white'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Mail className="h-4 w-4" />
                        Contact Us
                    </Link>
                    {user && user.roles && Array.isArray(user.roles) && user.roles.includes('admin') && (
                        <Link
                            to="/dashboard"
                            className={`flex items-center gap-2 text-sm font-semibold transition ${
                                currentPage === 'dashboard'
                                    ? 'text-[#7e246c] dark:text-white'
                                    : 'text-gray-600 hover:text-[#7e246c] dark:text-neutral-400 dark:hover:text-white'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
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
                            className="text-sm font-semibold text-gray-600 transition hover:text-[#7e246c] dark:text-neutral-400 dark:hover:text-white"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="rounded-md bg-[#7e246c] px-4 py-2 font-semibold text-white transition hover:bg-[#6a1f5c]"
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
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
            {/* Mobile Burger */}
            <button
                className="flex items-center justify-center rounded-md p-2 text-[#7e246c] focus:ring-2 focus:ring-[#7e246c] focus:outline-none md:hidden"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label="Open menu"
            >
                {mobileMenuOpen ? <X className="h-7 w-7 md:hidden" /> : <Menu className="h-7 w-7 md:hidden" />}
            </button>
            {/* Mobile Menu Overlay and Drawer - only render when open */}
            {mobileMenuOpen && (
                <>
                    {/* Overlay */}
                    <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
                    {/* Drawer */}
                    <div
                        className="fixed top-0 right-0 z-50 flex h-full w-64 flex-col bg-white shadow-lg md:hidden dark:bg-gray-900"
                        onClick={(e) => e.stopPropagation()} // Prevent overlay click from bubbling
                    >
                        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
                            <span className="text-xl font-bold text-[#7e246c]">Menu</span>
                            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                                <X className="h-6 w-6 text-[#7e246c]" />
                            </button>
                        </div>
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
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
