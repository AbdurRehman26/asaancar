import { useAuth } from '@/components/AuthContext';
import { DashboardEmptyState, DashboardPanel, DashboardPrimaryLink } from '@/components/dashboard-shell';
import Footer from '@/components/Footer';
import Navbar from '@/components/navbar';
import SEO from '@/components/SEO';
import { apiFetch } from '@/lib/utils';
import { ArrowRight, CarFront, MapPin, Phone, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DriverListingItem {
    id: number;
    name: string;
    phone_number?: string | null;
    city_name?: string | null;
    profile_image?: string | null;
    active_services_count: number;
    latest_service?: {
        id: number;
        start_location: string;
        end_location: string;
        formatted_departure_time: string;
        driver_gender?: 'male' | 'female';
        price_per_person?: number | null;
        currency?: string | null;
    } | null;
}

export default function DriversListing() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState<DriverListingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const response = await apiFetch('/api/drivers?per_page=12');

                if (!response.ok) {
                    throw new Error('Failed to fetch drivers');
                }

                const result = await response.json();
                setDrivers(Array.isArray(result.data) ? result.data : []);
            } catch (fetchError) {
                setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch drivers');
            } finally {
                setLoading(false);
            }
        };

        void fetchDrivers();
    }, []);

    const driverOnboardingPath = user ? '/driver-onboarding' : '/signup';

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
            <SEO
                title="Drivers - Asaancar"
                description="Browse drivers who currently have active rides on Asaancar and jump into their available routes."
                url={typeof window !== 'undefined' ? window.location.href : ''}
                type="website"
            />
            <Navbar auth={{ user }} />

            <div className="px-4 pt-24 pb-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <DashboardPanel
                        title="Drivers"
                        description="Browse active drivers and jump straight into the rides they are currently offering."
                        actions={
                            <div className="flex flex-wrap gap-3">
                                <DashboardPrimaryLink to={driverOnboardingPath}>Become a driver</DashboardPrimaryLink>
                                <DashboardPrimaryLink to="/pick-and-drop">Browse all rides</DashboardPrimaryLink>
                            </div>
                        }
                        className="mb-8"
                    >
                        <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-white/60 bg-white/80 px-6 py-7 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.28)] backdrop-blur md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-[#17141f]/88 dark:[background-image:linear-gradient(90deg,_rgba(23,20,31,0.94)_0%,_rgba(23,20,31,0.94)_44%,_rgba(255,255,255,0.14)_100%)] dark:shadow-none">
                            <div className="text-center md:text-left">
                                <p className="text-sm font-semibold text-[#7e246c] dark:text-white/70">Take AsaanCar with you</p>
                                <h2 className="mt-2 text-3xl font-bold text-[#2b1128] dark:text-white">Find drivers on the go</h2>
                                <p className="mt-2 text-sm text-[#6f556c] dark:text-white/65">
                                    Open the Android app to browse drivers, message quickly, and publish your own ride in fewer steps.
                                </p>
                            </div>
                            <a
                                href="https://play.google.com/store/apps/details?id=com.asaancar.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 self-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c] md:self-auto"
                            >
                                <img src="/google-play-icon.png" alt="Get it on Google Play" className="h-10 w-auto sm:h-12 md:h-14" />
                            </a>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-72 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/95 shadow-[0_20px_45px_-32px_rgba(126,36,108,0.32)] dark:border-white/10 dark:bg-[#191520]"
                                    />
                                ))}
                            </div>
                        ) : error ? (
                            <DashboardEmptyState
                                icon={<CarFront className="h-6 w-6" />}
                                title="Could not load drivers"
                                description={error}
                                action={
                                    <div className="flex flex-wrap justify-center gap-3">
                                        <DashboardPrimaryLink to={driverOnboardingPath}>Become a driver</DashboardPrimaryLink>
                                        <DashboardPrimaryLink to="/pick-and-drop">Browse all rides</DashboardPrimaryLink>
                                    </div>
                                }
                            />
                        ) : drivers.length === 0 ? (
                            <DashboardEmptyState
                                icon={<CarFront className="h-6 w-6" />}
                                title="No drivers available yet"
                                description="There are no active drivers to show right now, but you can still browse the ride listings."
                                action={
                                    <div className="flex flex-wrap justify-center gap-3">
                                        <DashboardPrimaryLink to={driverOnboardingPath}>Become a driver</DashboardPrimaryLink>
                                        <DashboardPrimaryLink to="/pick-and-drop">Browse all rides</DashboardPrimaryLink>
                                    </div>
                                }
                            />
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {drivers.map((driver) => (
                                    <div
                                        key={driver.id}
                                        onClick={() => navigate(`/drivers/${driver.id}`)}
                                        className="cursor-pointer rounded-[1.75rem] border border-white/70 bg-white/95 p-6 shadow-[0_20px_45px_-32px_rgba(126,36,108,0.32)] ring-1 ring-[#7e246c]/6 transition hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-34px_rgba(126,36,108,0.45)] dark:border-white/10 dark:bg-[#191520] dark:ring-white/5"
                                    >
                                        <div className="flex items-start gap-4">
                                            {driver.profile_image ? (
                                                <img src={driver.profile_image} alt={driver.name} className="h-14 w-14 rounded-2xl object-cover" />
                                            ) : (
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d88ac8] via-[#9d3d88] to-[#7e246c] text-lg font-semibold text-white">
                                                    {driver.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <h2 className="truncate text-xl font-semibold text-[#2b1128] dark:text-white">{driver.name}</h2>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 dark:border-orange-800/30 dark:bg-orange-900/20 dark:text-orange-300">
                                                        <Users className="h-3 w-3" />
                                                        {driver.active_services_count} active ride{driver.active_services_count !== 1 ? 's' : ''}
                                                    </span>
                                                    {driver.latest_service?.driver_gender ? (
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                                                                driver.latest_service.driver_gender === 'female'
                                                                    ? 'border-pink-100 bg-pink-50 text-pink-700 dark:border-pink-800/30 dark:bg-pink-900/20 dark:text-pink-300'
                                                                    : 'border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-800/30 dark:bg-indigo-900/20 dark:text-indigo-300'
                                                            }`}
                                                        >
                                                            {driver.latest_service.driver_gender === 'female' ? '👩' : '👨'}{' '}
                                                            {driver.latest_service.driver_gender === 'female' ? 'Female' : 'Male'}
                                                        </span>
                                                    ) : null}
                                                    {driver.city_name ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-300">
                                                            <MapPin className="h-3 w-3" />
                                                            {driver.city_name}
                                                        </span>
                                                    ) : null}
                                                    {driver.phone_number ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                                                            <Phone className="h-3 w-3" />
                                                            {driver.phone_number}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>

                                        {driver.latest_service ? (
                                            <div className="mt-5 rounded-[1.25rem] border border-[#7e246c]/10 bg-[#fcf7fb] p-4 dark:border-white/10 dark:bg-white/5">
                                                <div className="text-xs font-semibold tracking-[0.24em] text-[#8a7187] uppercase dark:text-white/45">
                                                    Latest active route
                                                </div>
                                                <div className="mt-3 space-y-2">
                                                    <div className="text-base font-semibold text-[#2b1128] dark:text-white">
                                                        {driver.latest_service.start_location}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[#8a7187] dark:text-white/45">
                                                        <ArrowRight className="h-4 w-4" />
                                                    </div>
                                                    <div className="text-base font-semibold text-[#5f4860] dark:text-white/78">
                                                        {driver.latest_service.end_location}
                                                    </div>
                                                    <div className="pt-2 text-sm text-[#7d6678] dark:text-white/65">
                                                        {driver.latest_service.formatted_departure_time}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}

                                        <div className="mt-5 flex items-center justify-between gap-3">
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    navigate(`/drivers/${driver.id}`);
                                                }}
                                                className="inline-flex items-center justify-center rounded-xl bg-[#7e246c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#67205a]"
                                            >
                                                View profile
                                            </button>
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    navigate(`/drivers/${driver.id}`);
                                                }}
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#7e246c] transition hover:text-[#67205a] dark:text-white"
                                            >
                                                View rides
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DashboardPanel>
                </div>
            </div>

            <Footer />
        </div>
    );
}
