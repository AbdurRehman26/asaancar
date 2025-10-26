import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Outlet } from 'react-router-dom';
import CarListings from './dashboard/CarListings';
import Messages from './dashboard/Messages';
import Inquiries from './dashboard/Inquiries';
import Home from './dashboard/Home';
import StoreBookings from './dashboard/StoreBookings';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
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
Dashboard.CarListings = CarListings;
Dashboard.Messages = Messages;
Dashboard.Inquiries = Inquiries;
Dashboard.Home = Home;
Dashboard.StoreBookings = StoreBookings;