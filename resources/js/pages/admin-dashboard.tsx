import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import PostmanTester from '../components/PostmanTester';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
];

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && (!user || !Array.isArray(user.roles) || !user.roles.includes('admin'))) {
            navigate('/', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7e246c]"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="max-w-7xl px-4 py-6">
                <PostmanTester isVisible={true} />
            </div>
        </AppLayout>
    );
}
