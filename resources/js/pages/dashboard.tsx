import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Link } from 'react-router-dom';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 p-6">
                <div className="grid auto-rows-min gap-6 md:grid-cols-3 mb-6">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-gray-800/80">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-gray-800/80">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-gray-800/80">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-xl border border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-gray-800/80">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
