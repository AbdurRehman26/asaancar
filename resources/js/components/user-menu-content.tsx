import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { LogOut, Settings, LayoutGrid } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    console.log('UserMenuContent user:', user);
    const cleanup = useMobileNavigation();
    const { logout } = useAuth();
    const handleLogout = () => {
        cleanup();
        logout();
    };
    // Log the name directly before rendering
    console.log('user.name:', user.name, typeof user.name, user);

    return (
        <>
            {/* User name and email at the top */}
            <DropdownMenuLabel className="p-0 font-normal dark:bg-gray-800/80 dark:text-white">
                <div className="flex flex-col items-start gap-1 px-1 py-2 text-left">
                    <span className="font-semibold text-base leading-tight">TEST NAME</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="dark:bg-gray-800/80 dark:text-white">
                {/* Dashboard link */}
                {Array.isArray(user.roles) && user.roles.includes('store_owner') && (
                  <DropdownMenuItem asChild>
                      <Link className="block w-full dark:text-white" to="/dashboard" onClick={cleanup}>
                          <LayoutGrid className="mr-2" />
                          Dashboard
                      </Link>
                  </DropdownMenuItem>
                )}
                {/* Profile link */}
                <DropdownMenuItem asChild className="dark:bg-gray-800/80 dark:text-white">
                    <Link className="block w-full dark:text-white" to="/profile" onClick={cleanup}>
                        <Settings className="mr-2" />
                        Profile
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {/* Logout button */}
            <DropdownMenuItem asChild className="dark:bg-gray-800/80 dark:text-white">
                <button className="block w-full dark:text-white" onClick={handleLogout}>
                    <LogOut className="mr-2" />
                    Log out
                </button>
            </DropdownMenuItem>
        </>
    );
}
