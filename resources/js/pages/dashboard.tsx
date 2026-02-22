import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Outlet } from 'react-router-dom';
import Messages from './dashboard/Messages';
import Inquiries from './dashboard/Inquiries';
import Home from './dashboard/Home';
import ProfilePage from './profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Outlet />
        </AppLayout>
    );
}

// Attach as properties for router usage
Dashboard.Messages = Messages;
Dashboard.Inquiries = Inquiries;
Dashboard.Home = Home;
Dashboard.Profile = ProfilePage;
