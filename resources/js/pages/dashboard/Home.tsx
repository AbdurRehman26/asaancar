import { useState, useEffect } from 'react';
import { MessageSquare, Users, Mail } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

export default function Home() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ messages: 0, users: 0, inquiries: 0 });
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            if (!user) return;
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
                    // ignore
                }

                if (user?.roles?.includes('admin')) {
                    try {
                        const usersRes = await fetch('/api/admin/users/stats', {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (usersRes.ok) {
                            usersData = await usersRes.json();
                        }
                    } catch {
                        // ignore
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
                    // ignore
                }

                setStats({
                    messages: Array.isArray(messagesData) ? messagesData.length : 0,
                    users: usersData.total_users || 0,
                    inquiries: inquiriesData.total_inquiries || 0,
                });
            } catch {
                setStatsError('Failed to load statistics. Please try again.');
            } finally {
                setStatsLoading(false);
            }
        }
        fetchStats();
    }, [user]);

    return (
        <div className="max-w-7xl px-4 sm:px-8 lg:px-12 py-6">
            {statsError ? (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">{statsError}</p>
                </div>
            ) : (
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${user?.roles?.includes('admin') ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 mb-8`}>
                    <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#7e246c]">
                                {statsLoading ? (
                                    <div className="w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    stats.messages
                                )}
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">Messages</div>
                        </div>
                    </div>
                    {user?.roles?.includes('admin') && (
                        <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[#7e246c]">
                                    {statsLoading ? (
                                        <div className="w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        stats.users
                                    )}
                                </div>
                                <div className="text-gray-700 dark:text-gray-300">Users</div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#7e246c]">
                                {statsLoading ? (
                                    <div className="w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    stats.inquiries
                                )}
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">Inquiries</div>
                        </div>
                    </div>
                </div>
            )}
            <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-neutral-800 shadow-lg p-10 text-center">
                <h2 className="text-3xl font-bold text-[#7e246c] dark:text-white mb-4">Welcome to your Dashboard</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300">Select an option from the sidebar to get started.</p>
            </div>
        </div>
    );
}
