import { useAuth } from '@/components/AuthContext';
import { DashboardEmptyState, DashboardPanel, DashboardPrimaryLink } from '@/components/dashboard-shell';
import Footer from '@/components/Footer';
import Navbar from '@/components/navbar';
import PickAndDropCard, { PickAndDropService } from '@/components/PickAndDropCard';
import SEO from '@/components/SEO';
import { apiFetch } from '@/lib/utils';
import { ArrowLeft, CarFront, Phone, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface DriverProfile {
    id: number;
    name: string;
    phone_number?: string | null;
    profile_image?: string | null;
    active_services_count: number;
}

export default function DriverDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [driver, setDriver] = useState<DriverProfile | null>(null);
    const [rides, setRides] = useState<PickAndDropService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDriverData = async () => {
            if (!id) {
                setError('Driver not found.');
                setLoading(false);

                return;
            }

            try {
                const [driverResponse, ridesResponse] = await Promise.all([
                    apiFetch(`/api/drivers/${id}`),
                    apiFetch(`/api/pick-and-drop?user_id=${id}&per_page=12`),
                ]);

                if (!driverResponse.ok) {
                    throw new Error('Driver not found.');
                }

                if (!ridesResponse.ok) {
                    throw new Error('Failed to fetch driver rides.');
                }

                const driverResult = await driverResponse.json();
                const ridesResult = await ridesResponse.json();

                setDriver(driverResult.data ?? null);
                setRides(Array.isArray(ridesResult.data) ? ridesResult.data : []);
            } catch (fetchError) {
                setError(fetchError instanceof Error ? fetchError.message : 'Failed to load driver.');
            } finally {
                setLoading(false);
            }
        };

        void fetchDriverData();
    }, [id]);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
            <SEO
                title={driver ? `${driver.name} - Driver Profile | Asaancar` : 'Driver Profile | Asaancar'}
                description={driver ? `Browse rides offered by ${driver.name} on Asaancar.` : 'Browse driver rides on Asaancar.'}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                type="website"
            />
            <Navbar auth={{ user }} />

            <div className="px-4 pt-24 pb-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    <button
                        onClick={() => navigate('/drivers')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7e246c] transition hover:text-[#67205a] dark:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to drivers
                    </button>

                    {loading ? (
                        <div className="h-80 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/95 shadow-[0_20px_45px_-32px_rgba(126,36,108,0.32)] dark:border-white/10 dark:bg-[#191520]" />
                    ) : error || !driver ? (
                        <DashboardEmptyState
                            icon={<CarFront className="h-6 w-6" />}
                            title="Driver not available"
                            description={error || 'This driver could not be found.'}
                            action={<DashboardPrimaryLink to="/drivers">Browse drivers</DashboardPrimaryLink>}
                        />
                    ) : (
                        <>
                            <DashboardPanel
                                title={driver.name}
                                description="A quick profile view with all currently active rides from this driver."
                                actions={
                                    <DashboardPrimaryLink to={`/pick-and-drop?user_id=${driver.id}`}>Open filtered listing</DashboardPrimaryLink>
                                }
                            >
                                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                                    <div className="flex items-center gap-4">
                                        {driver.profile_image ? (
                                            <img src={driver.profile_image} alt={driver.name} className="h-20 w-20 rounded-[1.5rem] object-cover" />
                                        ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[#d88ac8] via-[#9d3d88] to-[#7e246c] text-2xl font-semibold text-white">
                                                {driver.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h1 className="text-3xl font-bold text-[#2b1128] dark:text-white">{driver.name}</h1>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-1.5 rounded-md border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 dark:border-orange-800/30 dark:bg-orange-900/20 dark:text-orange-300">
                                                    <Users className="h-3 w-3" />
                                                    {driver.active_services_count} active ride{driver.active_services_count !== 1 ? 's' : ''}
                                                </span>
                                                {driver.phone_number ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                                                        <Phone className="h-3 w-3" />
                                                        {driver.phone_number}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                                                        <Phone className="h-3 w-3" />
                                                        Login to view contact
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DashboardPanel>

                            <DashboardPanel
                                title="Available rides"
                                description="These are the currently active rides this driver is offering."
                                actions={<DashboardPrimaryLink to={`/pick-and-drop?user_id=${driver.id}`}>View in listing</DashboardPrimaryLink>}
                            >
                                {rides.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {rides.map((ride) => (
                                            <PickAndDropCard
                                                key={ride.id}
                                                service={ride}
                                                showUserInfo={Boolean(user)}
                                                variant="dashboard"
                                                onClick={() => navigate(`/pick-and-drop/${ride.id}`)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <DashboardEmptyState
                                        icon={<CarFront className="h-6 w-6" />}
                                        title="No active rides"
                                        description="This driver does not have any active rides available right now."
                                        action={<DashboardPrimaryLink to="/pick-and-drop">Browse all rides</DashboardPrimaryLink>}
                                    />
                                )}
                            </DashboardPanel>
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
