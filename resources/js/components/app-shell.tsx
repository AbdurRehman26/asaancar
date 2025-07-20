import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppShellProps } from '@/types/app-shell';

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = true;

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
