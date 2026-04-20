import { useAuth } from '@/components/AuthContext';
import {
    DashboardEmptyState,
    DashboardHero,
    DashboardPage,
    DashboardPanel,
    DashboardPrimaryLink,
    DashboardSecondaryButton,
    DashboardStatCard,
} from '@/components/dashboard-shell';
import { Mail, MessageSquare, Plus, Route, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ messages: 0, users: 0, inquiries: 0 });
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState<string | null>(null);
    const isAdmin = Boolean(user?.roles?.includes('admin'));

    useEffect(() => {
        async function fetchStats() {
            if (!user) {
                return;
            }

            setStatsLoading(true);
            setStatsError(null);

            try {
                const token = localStorage.getItem('token');
                let messagesData: unknown[] = [];
                let usersData = { total_users: 0 };
                let inquiriesData = { total_inquiries: 0 };

                try {
                    const messagesRes = await fetch('/api/chat/conversations', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (messagesRes.ok) {
                        messagesData = await messagesRes.json();
                    }
                } catch {
                    // ignore individual widget failures
                }

                if (isAdmin) {
                    try {
                        const usersRes = await fetch('/api/admin/users/stats', {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (usersRes.ok) {
                            usersData = await usersRes.json();
                        }
                    } catch {
                        // ignore individual widget failures
                    }
                }

                try {
                    const inquiriesRes = await fetch('/api/admin/contact-messages/stats', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (inquiriesRes.ok) {
                        inquiriesData = await inquiriesRes.json();
                    }
                } catch {
                    // ignore individual widget failures
                }

                setStats({
                    messages: Array.isArray(messagesData) ? messagesData.length : 0,
                    users: usersData.total_users || 0,
                    inquiries: inquiriesData.total_inquiries || 0,
                });
            } catch {
                setStatsError('Failed to load dashboard statistics. Please try again in a moment.');
            } finally {
                setStatsLoading(false);
            }
        }

        void fetchStats();
    }, [isAdmin, user]);

    return (
        <DashboardPage>
            <DashboardHero
                eyebrow="Workspace overview"
                title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
                description="Everything you need to manage rides, ride requests, conversations, and account settings now lives in one calmer, more focused workspace."
                actions={
                    <>
                        <DashboardPrimaryLink to="/dashboard/pick-and-drop/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add a ride
                        </DashboardPrimaryLink>
                        <DashboardSecondaryButton onClick={() => (window.location.href = '/dashboard/ride-requests/create')}>
                            <Route className="mr-2 h-4 w-4" />
                            Request a ride
                        </DashboardSecondaryButton>
                    </>
                }
            />

            {statsError ? (
                <DashboardPanel title="Dashboard status">
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                        {statsError}
                    </p>
                </DashboardPanel>
            ) : null}

            <section className={`grid grid-cols-1 gap-4 ${isAdmin ? 'xl:grid-cols-3' : 'md:grid-cols-2'}`}>
                <DashboardStatCard
                    icon={
                        statsLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <MessageSquare className="h-5 w-5" />
                        )
                    }
                    label="Active conversations"
                    value={statsLoading ? '...' : stats.messages}
                    hint="Pick & drop and ride request chats"
                />
                {isAdmin ? (
                    <DashboardStatCard
                        icon={
                            statsLoading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                                <Users className="h-5 w-5" />
                            )
                        }
                        label="Users"
                        value={statsLoading ? '...' : stats.users}
                        hint="Registered members on the platform"
                    />
                ) : null}
                <DashboardStatCard
                    icon={
                        statsLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Mail className="h-5 w-5" />
                        )
                    }
                    label="Inquiries"
                    value={statsLoading ? '...' : stats.inquiries}
                    hint="Customer messages and contact requests"
                />
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.95fr]">
                <DashboardPanel
                    title="Quick actions"
                    description="Jump straight into the tasks people do most often in the dashboard."
                    contentClassName="grid gap-4 md:grid-cols-2"
                >
                    <Link
                        to="/dashboard/pick-and-drop"
                        className="rounded-[1.5rem] border border-[#7e246c]/10 bg-[#fcf7fb] p-5 transition hover:border-[#7e246c]/25 hover:bg-[#faf1f8] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                    >
                        <p className="text-sm font-semibold text-[#2b1128] dark:text-white">Manage your rides</p>
                        <p className="mt-2 text-sm leading-6 text-[#7d6678] dark:text-white/65">
                            Review listings, refine availability, and keep your routes up to date.
                        </p>
                    </Link>
                    <Link
                        to="/dashboard/ride-requests"
                        className="rounded-[1.5rem] border border-[#7e246c]/10 bg-[#fcf7fb] p-5 transition hover:border-[#7e246c]/25 hover:bg-[#faf1f8] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                    >
                        <p className="text-sm font-semibold text-[#2b1128] dark:text-white">Monitor ride requests</p>
                        <p className="mt-2 text-sm leading-6 text-[#7d6678] dark:text-white/65">
                            See what riders need right now and keep your demand view organized.
                        </p>
                    </Link>
                    <Link
                        to="/dashboard/pick-and-drop-chat"
                        className="rounded-[1.5rem] border border-[#7e246c]/10 bg-[#fcf7fb] p-5 transition hover:border-[#7e246c]/25 hover:bg-[#faf1f8] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                    >
                        <p className="text-sm font-semibold text-[#2b1128] dark:text-white">Continue conversations</p>
                        <p className="mt-2 text-sm leading-6 text-[#7d6678] dark:text-white/65">
                            Pick up where you left off with riders and drivers in one place.
                        </p>
                    </Link>
                    <Link
                        to="/dashboard/profile"
                        className="rounded-[1.5rem] border border-[#7e246c]/10 bg-[#fcf7fb] p-5 transition hover:border-[#7e246c]/25 hover:bg-[#faf1f8] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                    >
                        <p className="text-sm font-semibold text-[#2b1128] dark:text-white">Update your profile</p>
                        <p className="mt-2 text-sm leading-6 text-[#7d6678] dark:text-white/65">
                            Keep your personal details, avatar, and password current.
                        </p>
                    </Link>
                </DashboardPanel>

                <DashboardPanel title="Workspace guidance" description="A quick reminder of what each section is for.">
                    <DashboardEmptyState
                        icon={<Route className="h-6 w-6" />}
                        title="Use the sidebar as your command center"
                        description="Create rides, browse ride requests, respond to inquiries, and manage your profile from the left navigation. The redesigned sections keep the most important actions closer to the top."
                    />
                </DashboardPanel>
            </div>
        </DashboardPage>
    );
}
