import AreaLocationSelector from '@/components/AreaLocationSelector';
import { useAuth } from '@/components/AuthContext';
import Footer from '@/components/Footer';
import KarachiOnlyNotice from '@/components/KarachiOnlyNotice';
import Navbar from '@/components/navbar';
import RideRequestCard, { RideRequest } from '@/components/RideRequestCard';
import SEO from '@/components/SEO';
import { KARACHI_CITY_ID, useLocationOptions } from '@/hooks/use-location-options';
import { apiFetch } from '@/lib/utils';
import { ChevronDown, Filter, Plus, Users, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function RideRequestListing() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const { cities, areas } = useLocationOptions();
    const [requests, setRequests] = useState<RideRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const [filters, setFilters] = useState({
        start_location: searchParams.get('start_location') || '',
        start_city_id: searchParams.get('start_city_id') || '',
        start_area_id: searchParams.get('start_area_id') || '',
        end_location: searchParams.get('end_location') || '',
        end_city_id: searchParams.get('end_city_id') || '',
        end_area_id: searchParams.get('end_area_id') || '',
        city_id: searchParams.get('city_id') || KARACHI_CITY_ID.toString(),
        preferred_driver_gender: searchParams.get('preferred_driver_gender') || '',
        departure_date: searchParams.get('departure_date') || '',
        departure_time: searchParams.get('departure_time') || '',
    });

    useEffect(() => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            }
        });

        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    params.append(key, value);
                }
            });

            params.append('per_page', '12');

            const response = await apiFetch(`/api/ride-requests?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch ride requests');
            }

            const data = await response.json();
            setRequests(data.data || []);
        } catch (fetchError) {
            setError(fetchError instanceof Error ? fetchError.message : 'Failed to load ride requests');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        void fetchRequests();
    }, [fetchRequests]);

    const clearFilters = () => {
        setFilters({
            start_location: '',
            start_city_id: '',
            start_area_id: '',
            end_location: '',
            end_city_id: '',
            end_area_id: '',
            city_id: KARACHI_CITY_ID.toString(),
            preferred_driver_gender: '',
            departure_date: '',
            departure_time: '',
        });
    };

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
            <SEO
                title="Ride Requests | Asaancar"
                description="Browse ride requests from passengers looking for a driver. Review route, time, stops, seats needed, and preferred driver type."
                image={`${baseUrl}/pick-n-drop.png`}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                type="website"
                siteName="Asaancar"
            />
            <Navbar auth={{ user }} />

            <div className="px-4 pt-20 pb-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-white/60 bg-white/80 px-6 py-7 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.28)] backdrop-blur md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-[#17141f]/88 dark:[background-image:linear-gradient(90deg,_rgba(23,20,31,0.94)_0%,_rgba(23,20,31,0.94)_44%,_rgba(255,255,255,0.14)_100%)] dark:shadow-none">
                        <div>
                            <h1 className="mb-4 text-4xl font-bold text-[#2b1128] dark:text-white">Ride Requests</h1>
                            <p className="text-lg text-[#6f556c] dark:text-white/65">See where passengers want to go and when they need a ride.</p>
                        </div>
                        <div className="flex flex-col items-center gap-4 md:items-end">
                            <a
                                href="https://play.google.com/store/apps/details?id=com.asaancar.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
                            >
                                <img src="/google-play-icon.png" alt="Get it on Google Play" className="h-10 w-auto sm:h-12 md:h-14" />
                            </a>
                            <button
                                onClick={() => navigate(user ? '/dashboard/ride-requests/create' : '/login')}
                                className="flex items-center justify-center gap-2 rounded-lg bg-[#7e246c] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#6a1f5c]"
                            >
                                <Plus className="h-5 w-5" />
                                Add a Ride Request
                            </button>
                        </div>
                    </div>

                    <div className="relative z-20 mb-8 overflow-visible rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                        <KarachiOnlyNotice className="mb-4" />
                        <div className="mb-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen((value) => !value)}
                                className="flex items-center gap-2 text-lg font-semibold text-[#7e246c] dark:text-white"
                            >
                                <Filter className="h-5 w-5" />
                                Filter Requests
                                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {filters.start_location ||
                            filters.end_location ||
                            filters.start_city_id ||
                            filters.end_city_id ||
                            filters.preferred_driver_gender ||
                            filters.departure_date ||
                            filters.departure_time ? (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-1 text-sm text-[#7e246c] hover:underline"
                                >
                                    <X className="h-4 w-4" />
                                    Clear Filters
                                </button>
                            ) : null}
                        </div>

                        {isFilterOpen ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                                <AreaLocationSelector
                                    label="Start Location"
                                    cities={cities}
                                    areas={areas}
                                    cityId={filters.start_city_id}
                                    areaId={filters.start_area_id}
                                    onChange={({ cityId, areaId, location }) =>
                                        setFilters((current) => ({
                                            ...current,
                                            start_city_id: cityId,
                                            start_area_id: areaId,
                                            start_location: location,
                                        }))
                                    }
                                    fieldClassName="h-10 w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                    labelClassName="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75"
                                />
                                <AreaLocationSelector
                                    label="End Location"
                                    cities={cities}
                                    areas={areas}
                                    cityId={filters.end_city_id}
                                    areaId={filters.end_area_id}
                                    onChange={({ cityId, areaId, location }) =>
                                        setFilters((current) => ({
                                            ...current,
                                            end_city_id: cityId,
                                            end_area_id: areaId,
                                            end_location: location,
                                        }))
                                    }
                                    fieldClassName="h-10 w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                    labelClassName="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75"
                                />
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75">Driver Preference</label>
                                    <select
                                        value={filters.preferred_driver_gender}
                                        onChange={(event) => setFilters((current) => ({ ...current, preferred_driver_gender: event.target.value }))}
                                        className="h-10 w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                    >
                                        <option value="">Any driver</option>
                                        <option value="male">Male driver</option>
                                        <option value="female">Female driver</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75">Departure Date</label>
                                    <input
                                        type="date"
                                        value={filters.departure_date}
                                        onChange={(event) => setFilters((current) => ({ ...current, departure_date: event.target.value }))}
                                        className="h-10 w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75">Departure Time</label>
                                    <input
                                        type="time"
                                        value={filters.departure_time}
                                        onChange={(event) => setFilters((current) => ({ ...current, departure_time: event.target.value }))}
                                        className="h-10 w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {error ? (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    ) : null}

                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#7e246c] border-t-transparent"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-white/70 bg-white/90 py-12 text-center shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-gray-600 dark:text-gray-400">No ride requests match your filters right now.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {requests.map((request) => (
                                <RideRequestCard
                                    key={request.id}
                                    request={request}
                                    variant="dashboard"
                                    budgetPlacement="below-route"
                                    onClick={() => navigate(`/ride-requests/${request.id}`)}
                                    showRequesterInfo={Boolean(user)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
