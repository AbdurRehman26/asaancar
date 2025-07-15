import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import DarkModeToggle from '../components/ui/dark-mode-toggle';
import { useAuth } from '@/components/AuthContext';

type NavbarProps = {
  currentPage?: string;
  auth?: {
    user?: any;
  };
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ currentPage = '', onLoginClick, onRegisterClick }) => {
  const { user } = useAuth();
  const getInitials = useInitials();

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-white dark:bg-gray-800/80 border-b border-neutral-200 dark:border-neutral-800 py-[13px] px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xl font-bold text-[#7e246c]">
        <svg className="h-8 w-8 text-[#7e246c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
        </svg>
        <Link to="/" className="hover:text-[#6a1f5c] transition">
          AsaanCar
        </Link>
      </div>
      
      <div className="flex items-center space-x-6">
        <Link 
          to="/cars" 
          className={`flex items-center gap-2 text-sm font-semibold transition ${
            currentPage === 'cars' 
              ? 'text-[#7e246c] dark:text-white' 
              : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
          }`}
        >
          <Car className="h-4 w-4" />
          Car Listing
        </Link>
        {user && (
          <Link 
            to="/bookings" 
            className={`flex items-center gap-2 text-sm font-semibold transition ${
              currentPage === 'bookings' 
                ? 'text-[#7e246c] dark:text-white' 
                : 'text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white'
            }`}
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
          >
            <User className="h-4 w-4" />
            Dashboard
          </Link>
        )}
        {/* Dark Mode Toggle */}
        <DarkModeToggle />
        {/* Auth Buttons */}
        {!user ? (
          <div className="flex items-center space-x-4">
            <button 
              onClick={onLoginClick}
              className="text-sm font-semibold text-gray-600 dark:text-neutral-400 hover:text-[#7e246c] dark:hover:text-white transition"
            >
              Login
            </button>
            <Link 
              to="/signup"
              className="bg-[#7e246c] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#6a1f5c] transition"
            >
              Register Now
            </Link>
          </div>
        ) : (
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
        )}
      </div>
    </nav>
  );
};

export default Navbar; 