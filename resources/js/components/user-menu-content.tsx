import { useAuth } from '@/components/AuthContext';
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import type { UserMenuContentProps } from '@/types/user-menu-content';
import { LayoutGrid, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { logout } = useAuth();
    const handleLogout = () => {
        cleanup();
        logout();
    };

    return (
        <>
            {/* User name and email at the top */}
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex flex-col items-start gap-1 px-1 py-2 text-left">
                    <span className="text-base leading-tight font-semibold">{user.name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                {/* Dashboard link */}
                {user.roles && Array.isArray(user.roles) && user.roles.includes('admin') && (
                    <DropdownMenuItem asChild>
                        <Link className="block w-full" to="/dashboard" onClick={cleanup}>
                            <LayoutGrid className="mr-2" />
                            Dashboard
                        </Link>
                    </DropdownMenuItem>
                )}
                {/* Profile link */}
                <DropdownMenuItem asChild>
                    <Link className="block w-full" to="/profile" onClick={cleanup}>
                        <Settings className="mr-2" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Logout */}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="mr-2" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </>
    );
}
