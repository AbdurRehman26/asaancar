import { useAuth } from '@/components/AuthContext';
import Footer from '@/components/Footer';
import GooglePlacesInput from '@/components/GooglePlacesInput';
import Navbar from '@/components/navbar';
import RideRequestCard, { RideRequest } from '@/components/RideRequestCard';
import SEO from '@/components/SEO';
import { apiFetch } from '@/lib/utils';
import { ChevronDown, Filter, Plus, Users, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function RideRequestListing() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [requests, setRequests] = useState<RideRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const [filters, setFilters] = useState({
        start_location: searchParams.get('start_location') || '',
        start_latitude: searchParams.get('start_latitude') || '',
        start_longitude: searchParams.get('start_longitude') || '',
        end_location: searchParams.get('end_location') || '',
        end_latitude: searchParams.get('end_latitude') || '',
        end_longitude: searchParams.get('end_longitude') || '',
        preferred_driver_gender: searchParams.get('preferred_driver_gender') || '',
        departure_date: searchParams.get('departure_date') || '',
        departure_time: searchParams.get('departure_time') || '',
    });
    const [locationInputs, setLocationInputs] = useState({
        start_location: searchParams.get('start_location') || '',
        end_location: searchParams.get('end_location') || '',
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
            start_latitude: '',
            start_longitude: '',
            end_location: '',
            end_latitude: '',
            end_longitude: '',
            preferred_driver_gender: '',
            departure_date: '',
            departure_time: '',
        });
        setLocationInputs({
            start_location: '',
            end_location: '',
        });
    };

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
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
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="mt-8 mb-4 text-4xl font-bold text-[#7e246c] dark:text-white">Ride Requests</h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300">See where passengers want to go and when they need a ride.</p>
                        </div>
                        <button
                            onClick={() => navigate(user ? '/dashboard/ride-requests/create' : '/login')}
                            className="flex items-center justify-center gap-2 rounded-lg bg-[#7e246c] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#6a1f5c]"
                        >
                            <Plus className="h-5 w-5" />
                            Add a Ride Request
                        </button>
                    </div>

                    <div className="mb-8 overflow-hidden rounded-3xl border border-[#7e246c]/15 bg-gradient-to-r from-[#7e246c] via-[#8d2b79] to-[#b14a9a] px-5 py-4 text-white shadow-xl shadow-[#7e246c]/20 sm:px-6">
                        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:justify-between md:text-left">
                            <div className="max-w-2xl">
                                <h2 className="text-xl font-bold sm:text-2xl">Book faster with the mobile app</h2>
                                <p className="mt-1 hidden text-sm text-white/85 md:block">
                                    Search routes, connect with drivers, and manage your rides on the go with the AsaanCar Android app.
                                </p>
                            </div>

                            <a
                                href="https://play.google.com/store/apps/details?id=com.asaancar.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                <img
                                    src="/google-play-download-android-app-logo.webp"
                                    alt="Get it on Google Play"
                                    className="h-16 w-auto sm:h-20 md:h-24"
                                />
                            </a>
                        </div>
                    </div>

                    <div className="mb-8 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
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

                            {Object.values(filters).some(Boolean) ? (
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Start Location</label>
                                    <GooglePlacesInput
                                        value={locationInputs.start_location}
                                        placeholder="From..."
                                        onChange={(value) => {
                                            setLocationInputs((current) => ({
                                                ...current,
                                                start_location: value,
                                            }));

                                            if (value === '') {
                                                setFilters((current) => ({
                                                    ...current,
                                                    start_location: '',
                                                    start_latitude: '',
                                                    start_longitude: '',
                                                }));
                                            }
                                        }}
                                        onPlaceSelected={(place) => {
                                            setLocationInputs((current) => ({
                                                ...current,
                                                start_location: place.address,
                                            }));

                                            setFilters((current) => ({
                                                ...current,
                                                start_location: place.address,
                                                start_latitude: place.latitude?.toString() ?? '',
                                                start_longitude: place.longitude?.toString() ?? '',
                                            }));
                                        }}
                                        className="h-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">End Location</label>
                                    <GooglePlacesInput
                                        value={locationInputs.end_location}
                                        placeholder="To..."
                                        onChange={(value) => {
                                            setLocationInputs((current) => ({
                                                ...current,
                                                end_location: value,
                                            }));

                                            if (value === '') {
                                                setFilters((current) => ({
                                                    ...current,
                                                    end_location: '',
                                                    end_latitude: '',
                                                    end_longitude: '',
                                                }));
                                            }
                                        }}
                                        onPlaceSelected={(place) => {
                                            setLocationInputs((current) => ({
                                                ...current,
                                                end_location: place.address,
                                            }));

                                            setFilters((current) => ({
                                                ...current,
                                                end_location: place.address,
                                                end_latitude: place.latitude?.toString() ?? '',
                                                end_longitude: place.longitude?.toString() ?? '',
                                            }));
                                        }}
                                        className="h-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Preference</label>
                                    <select
                                        value={filters.preferred_driver_gender}
                                        onChange={(event) => setFilters((current) => ({ ...current, preferred_driver_gender: event.target.value }))}
                                        className="h-10 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Any driver</option>
                                        <option value="male">Male driver</option>
                                        <option value="female">Female driver</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Departure Date</label>
                                    <input
                                        type="date"
                                        value={filters.departure_date}
                                        onChange={(event) => setFilters((current) => ({ ...current, departure_date: event.target.value }))}
                                        className="h-10 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Departure Time</label>
                                    <input
                                        type="time"
                                        value={filters.departure_time}
                                        onChange={(event) => setFilters((current) => ({ ...current, departure_time: event.target.value }))}
                                        className="h-10 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-gray-600 dark:text-gray-400">No ride requests match your filters right now.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {requests.map((request) => (
                                <RideRequestCard
                                    key={request.id}
                                    request={request}
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
