import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, User, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useAuth } from '@/components/AuthContext';
import DarkModeToggle from './ui/dark-mode-toggle';

type NavbarProps = {
  currentPage?: string;
  auth?: {
    user?: unknown;
  };
};

const Navbar: React.FC<NavbarProps> = ({ currentPage = '' }) => {
  const { user } = useAuth();
  const getInitials = useInitials();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Nav links as a component for reuse
  const NavLinks = (
    <>
      <Link
        to="/cars"
        className={`flex items-center gap-2 text-sm font-semibold transition ${
          currentPage === 'cars'
            ? 'text-[#7e246c] dark:text-white'
            : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <Car className="h-4 w-4" />
        Car Listing
      </Link>
      <Link
        to="/about"
        className={`flex items-center gap-2 text-sm font-semibold transition ${
          currentPage === 'about'
            ? 'text-[#7e246c] dark:text-white'
            : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        About Us
      </Link>
      <Link
        to="/contact"
        className={`flex items-center gap-2 text-sm font-semibold transition ${
          currentPage === 'contact'
            ? 'text-[#7e246c] dark:text-white'
            : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Contact Us
      </Link>
      {user && (
        <Link
          to="/bookings"
          className={`flex items-center gap-2 text-sm font-semibold transition ${
            currentPage === 'bookings'
              ? 'text-[#7e246c] dark:text-white'
              : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Calendar className="h-4 w-4" />
          My Bookings
        </Link>
      )}
      {user && Array.isArray(user.roles) && user.roles.includes('store_owner') && (
        <Link
          to="/dashboard"
          className={`flex items-center gap-2 text-sm font-semibold transition ${
            currentPage === 'dashboard'
              ? 'text-[#7e246c] dark:text-white'
              : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
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
          <DarkModeToggle />
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-[#7e246c] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#6a1f5c] transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Register Now
          </Link>
        </>
      ) : (
        <div className="flex items-center space-x-2">
          <DarkModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-10 rounded-full p-1">
                <Avatar className="size-8 overflow-hidden rounded-full">
                  <AvatarImage src={user.avatar} alt={user.name} />
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
    <nav className="fixed top-0 left-0 z-50 w-full bg-white dark:bg-gray-800/80 border-b border-neutral-200 dark:border-neutral-800 py-[13px] px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xl font-bold text-[#7e246c]">
        <Link to="/" className="hover:text-[#6a1f5c] transition flex items-center gap-2">
          <img src="/images/car-logo-nameless.png" alt="AsaanCar Logo" className="h-18 w-24" />
          <span>AsaanCar</span>
        </Link>
      </div>
      {/* Desktop Nav */}
      <div className="hidden md:flex flex-1 items-center justify-between">
        {/* Centered nav links */}
        <div className="flex items-center space-x-6 mx-auto">
          <Link
            to="/cars"
            className={`flex items-center gap-2 text-sm font-semibold transition ${
              currentPage === 'cars'
                ? 'text-[#7e246c] dark:text-white'
                : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Car className="h-4 w-4" />
            Car Listing
          </Link>
          <Link
            to="/about"
            className={`flex items-center gap-2 text-sm font-semibold transition ${
              currentPage === 'about'
                ? 'text-[#7e246c] dark:text-white'
                : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className={`flex items-center gap-2 text-sm font-semibold transition ${
              currentPage === 'contact'
                ? 'text-[#7e246c] dark:text-white'
                : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact Us
          </Link>
          {user && (
            <Link
              to="/bookings"
              className={`flex items-center gap-2 text-sm font-semibold transition ${
                currentPage === 'bookings'
                  ? 'text-[#7e246c] dark:text-white'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar className="h-4 w-4" />
              My Bookings
            </Link>
          )}
          {user && Array.isArray(user.roles) && user.roles.includes('store_owner') && (
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 text-sm font-semibold transition ${
                currentPage === 'dashboard'
                  ? 'text-[#7e246c] dark:text-white'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
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
            <DarkModeToggle />
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-[#7e246c] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#6a1f5c] transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Register Now
            </Link>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <DarkModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-10 rounded-full p-1">
                  <Avatar className="size-8 overflow-hidden rounded-full">
                    <AvatarImage src={user.avatar} alt={user.name} />
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
        className="flex md:hidden items-center justify-center p-2 rounded-md text-[#7e246c] focus:outline-none focus:ring-2 focus:ring-[#7e246c]"
        onClick={() => setMobileMenuOpen((open) => !open)}
        aria-label="Open menu"
      >
        {mobileMenuOpen ? <X className="md:hidden h-7 w-7" /> : <Menu className="md:hidden h-7 w-7" />}
      </button>
      {/* Mobile Menu Overlay and Drawer - only render when open */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div
            className="fixed top-0 right-0 z-50 h-full w-64 bg-white dark:bg-gray-900 shadow-lg md:hidden flex flex-col"
            onClick={e => e.stopPropagation()} // Prevent overlay click from bubbling
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-xl font-bold text-[#7e246c]">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6 text-[#7e246c]" />
              </button>
            </div>
            <div className="flex flex-col gap-4 px-6 py-6">
              {NavLinks}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
