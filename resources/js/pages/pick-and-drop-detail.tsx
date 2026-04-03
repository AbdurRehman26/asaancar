import { useAuth } from '@/components/AuthContext';
import Chat from '@/components/chat';
import Footer from '@/components/Footer';
import GoogleMap from '@/components/GoogleMap';
import Navbar from '@/components/navbar';
import SEO from '@/components/SEO';
import { useToast } from '@/contexts/ToastContext';
import { apiFetch } from '@/lib/utils';
import { ArrowRight, Car, ChevronDown, ChevronUp, Clock, MapPin, MessageSquare, Phone, User as UserIcon, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface PickAndDropStop {
    id: number;
    location?: string;
    place_id?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    city_id?: number;
    area_id?: number;
    city?: { id: number; name: string };
    area?: { id: number; name: string };
    stop_time: string;
    order: number;
    notes?: string;
}

interface PickAndDropService {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone_number?: string;
    };
    name?: string;
    contact?: string;
    car?: {
        id: number;
        name: string;
    };
    start_location: string;
    start_place_id?: string | null;
    start_latitude?: number | null;
    start_longitude?: number | null;
    end_location: string;
    end_place_id?: string | null;
    end_latitude?: number | null;
    end_longitude?: number | null;
    pickup_city_id?: number;
    dropoff_city_id?: number;
    pickup_area_id?: number;
    dropoff_area_id?: number;
    pickup_city?: { id: number; name: string };
    dropoff_city?: { id: number; name: string };
    pickup_area?: { id: number; name: string };
    dropoff_area?: { id: number; name: string };
    available_spaces: number;
    driver_gender: 'male' | 'female';
    car_brand?: string;
    car_model?: string;
    car_color?: string;
    car_seats?: number;
    car_transmission?: string;
    car_fuel_type?: string;
    departure_time: string;
    formatted_departure_time?: string;
    description?: string;
    price_per_person?: number;
    currency: string;
    is_active: boolean;
    is_everyday?: boolean;
    is_roundtrip?: boolean;
    return_time?: string;
    formatted_return_time?: string;
    stops?: PickAndDropStop[];
    schedule_type: 'once' | 'everyday' | 'custom' | 'weekend' | 'weekdays';
    selected_days?: string;
}

export default function PickAndDropDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { error: showError } = useToast();
    const [service, setService] = useState<PickAndDropService | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [chatError, setChatError] = useState<string | null>(null);
    const [showStops, setShowStops] = useState(false);

    useEffect(() => {
        fetchService();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchService = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch(`/api/pick-and-drop/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch service details');
            }
            const data = await response.json();
            setService(data.data || data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load service');
        } finally {
            setLoading(false);
        }
    };

    const handleMessageUser = async () => {
        if (!user || !service) return;

        const serviceId = service.id;
        try {
            // Check if conversation exists for this pick and drop service
            const res = await apiFetch('/api/chat/conversations');
            const data: Array<{ id: number; type: string; pick_and_drop_service_id?: number }> = await res.json();

            // Look for pick_and_drop conversation
            const conv = data.find((c) => c.type === 'pick_and_drop' && c.pick_and_drop_service_id === serviceId);

            if (conv) {
                setConversationId(conv.id);
                setShowChat(true);
                setChatError(null);
            } else {
                // Create new conversation for this pick and drop service
                const createRes = await apiFetch('/api/chat/conversations', {
                    method: 'POST',
                    body: JSON.stringify({
                        type: 'pick_and_drop',
                        pick_and_drop_service_id: serviceId,
                    }),
                });
                const newConv = await createRes.json();
                if (newConv && newConv.id) {
                    setConversationId(newConv.id);
                    setShowChat(true);
                    setChatError(null);
                } else {
                    setShowChat(true);
                    setConversationId(null);
                    setChatError('Could not start chat. Please try again later.');
                }
            }
        } catch (err) {
            console.error('Chat error:', err);
            setShowChat(true);
            setConversationId(null);
            setChatError('Could not start chat. Please try again later.');
        }
    };

    const handleCall = () => {
        const phoneNumber = service?.contact || service?.user?.phone_number;
        if (phoneNumber) {
            window.location.href = `tel:${phoneNumber}`;
        } else {
            showError('Phone Number', 'Phone number not available for this service provider.');
        }
    };

    const handleWhatsAppCall = () => {
        const phoneNumber = service?.contact || service?.user?.phone_number;
        if (phoneNumber) {
            // Remove any non-digit characters except + for WhatsApp
            const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
            window.open(`https://wa.me/${cleanPhoneNumber}`, '_blank');
        } else {
            showError('Phone Number', 'Phone number not available for this service provider.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
                <Navbar auth={{ user }} />
                <div className="flex min-h-screen items-center justify-center pt-20 pb-12">
                    <div className="text-center">
                        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#7e246c] border-t-transparent"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading service details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
                <Navbar auth={{ user }} />
                <div className="flex min-h-screen items-center justify-center pt-20 pb-12">
                    <div className="text-center">
                        <p className="mb-4 text-lg text-red-600 dark:text-red-400">{error || 'Service not found'}</p>
                        <button
                            onClick={() => navigate('/pick-and-drop')}
                            className="rounded-lg bg-[#7e246c] px-6 pt-4 text-white transition-colors hover:bg-[#6a1f5c]"
                        >
                            Back to Listing
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Get the base URL for Open Graph image
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const ogImage = `${baseUrl}/icon.png`;

    // Generate SEO content based on service data
    const seoTitle = service
        ? `${service.start_location} → ${service.end_location} - Pick & Drop Service | Asaancar`
        : 'Pick & Drop Service Details | Asaancar';

    const seoDescription = service
        ? `Book a ${service.driver_gender === 'female' ? 'female' : 'male'} driver pick & drop service from ${service.start_location} to ${service.end_location}. ${service.is_everyday ? 'Available everyday' : 'Scheduled service'} at ${service.formatted_departure_time || service.departure_time}. ${service.available_spaces} space${service.available_spaces !== 1 ? 's' : ''} available.${service.price_per_person ? ` Price: ${service.currency} ${Math.round(service.price_per_person).toLocaleString()} per person.` : ''}${service.stops && service.stops.length > 0 ? ` Includes ${service.stops.length} stop${service.stops.length !== 1 ? 's' : ''}.` : ''} Book your ride on Asaancar.`
        : 'View pick & drop service details on Asaancar. Find convenient rides with multiple stops.';

    const routeMarkers = [
        service.start_latitude != null && service.start_longitude != null
            ? {
                  id: 'start',
                  label: 'S',
                  title: service.start_location,
                  position: {
                      lat: Number(service.start_latitude),
                      lng: Number(service.start_longitude),
                  },
              }
            : null,
        ...(service.stops ?? [])
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((stop, index) =>
                stop.latitude != null && stop.longitude != null
                    ? {
                          id: `stop-${stop.id ?? index}`,
                          label: `${index + 1}`,
                          title: stop.location || `Stop ${index + 1}`,
                          position: {
                              lat: Number(stop.latitude),
                              lng: Number(stop.longitude),
                          },
                      }
                    : null,
            )
            .filter((marker): marker is NonNullable<typeof marker> => marker !== null),
        service.end_latitude != null && service.end_longitude != null
            ? {
                  id: 'end',
                  label: 'E',
                  title: service.end_location,
                  position: {
                      lat: Number(service.end_latitude),
                      lng: Number(service.end_longitude),
                  },
              }
            : null,
    ].filter((marker): marker is NonNullable<typeof marker> => marker !== null);

    const routePath = routeMarkers.map((marker) => marker.position);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
            <SEO
                title={seoTitle}
                description={seoDescription}
                image={ogImage}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                type="website"
                siteName="Asaancar"
            />
            <Navbar auth={{ user }} />

            <div className="px-4 pt-20 pb-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/pick-and-drop')}
                        className="mb-6 flex items-center gap-2 pt-4 text-gray-600 transition-all hover:text-[#7e246c] hover:underline dark:text-gray-400"
                    >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        Back to Listing
                    </button>

                    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        {/* Header Section */}
                        <div className="border-b border-gray-100 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-900/50">
                            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                                <div className="flex-1">
                                    <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">Route Details</h1>

                                    {/* Visual Route */}
                                    <div className="relative pl-2">
                                        {/* Start */}
                                        <div className="relative z-10 flex items-start gap-4">
                                            <div className="mt-1.5 flex flex-col items-center gap-1">
                                                <div className="h-4 w-4 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.15)] ring-2 ring-white dark:ring-gray-800"></div>
                                                <div className="absolute top-5 left-[7px] -z-10 h-full min-h-[40px] w-0.5 bg-gradient-to-b from-green-500/50 to-gray-200 dark:to-gray-700"></div>
                                            </div>
                                            <div className="pb-6">
                                                <h3 className="text-xl leading-tight font-bold text-gray-900 dark:text-white">
                                                    {service.start_location}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start Point</p>
                                            </div>
                                        </div>

                                        {/* Stops */}
                                        {service.stops && service.stops.length > 0 && (
                                            <div className="relative z-10">
                                                <div className="mb-6 flex items-center gap-4">
                                                    <div className="absolute top-0 bottom-0 left-[9px] -z-10 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                                    <div className="-mt-4 ml-[9px] w-full pl-8">
                                                        <button
                                                            onClick={() => setShowStops(!showStops)}
                                                            className="flex w-fit items-center gap-2 rounded-full bg-[#7e246c]/5 px-3 py-1.5 text-sm font-medium text-[#7e246c] transition-colors hover:bg-[#7e246c]/10"
                                                        >
                                                            {service.stops.length} Stop{service.stops.length !== 1 ? 's' : ''} in between
                                                            {showStops ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                        </button>

                                                        <div
                                                            className={`grid transition-all duration-300 ease-in-out ${showStops ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                                        >
                                                            <div className="overflow-hidden">
                                                                <div className="ml-2 space-y-4 border-l-2 border-dashed border-gray-200 py-1 pl-4 dark:border-gray-700">
                                                                    {service.stops
                                                                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                                                                        .map((stop, index) => (
                                                                            <div key={stop.id || index} className="relative">
                                                                                <div className="absolute top-2 -left-[21px] h-2.5 w-2.5 rounded-full bg-gray-300 ring-4 ring-white dark:bg-gray-600 dark:ring-gray-800"></div>
                                                                                <div className="font-medium text-gray-900 dark:text-white">
                                                                                    {stop.location ||
                                                                                        stop.area?.name ||
                                                                                        stop.city?.name ||
                                                                                        'Location not specified'}
                                                                                </div>
                                                                                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                                                                                    <Clock className="h-3 w-3" /> {stop.stop_time}
                                                                                </div>
                                                                                {stop.notes && (
                                                                                    <p className="mt-1 text-xs text-gray-500 italic">
                                                                                        "{stop.notes}"
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* End */}
                                        <div className="relative z-10 flex items-start gap-4">
                                            <div className="mt-1 flex flex-col items-center">
                                                <MapPin className="h-5 w-5 fill-[#7e246c]/10 text-[#7e246c]" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl leading-tight font-bold text-gray-900 dark:text-white">
                                                    {service.end_location}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Destination</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Price & Quick Stats */}
                                <div className="flex min-w-[200px] shrink-0 flex-col gap-4">
                                    {service.price_per_person && (
                                        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Per Person</p>
                                            <div className="mt-1 text-3xl font-bold text-[#7e246c] dark:text-[#9d4edd]">
                                                {service.currency} {Math.round(service.price_per_person).toLocaleString()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Key Info Chips */}
                                    <div className="flex flex-wrap gap-2">
                                        <div
                                            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                                                service.is_everyday
                                                    ? 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-300'
                                                    : 'border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                            }`}
                                        >
                                            <Clock className="h-4 w-4" />
                                            {service.schedule_type == 'once'
                                                ? 'On'
                                                : service.schedule_type == 'custom'
                                                  ? service.selected_days
                                                  : service.schedule_type.toUpperCase()}{' '}
                                            • {service.formatted_departure_time || service.departure_time}
                                        </div>

                                        <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-orange-100 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 dark:border-orange-800/30 dark:bg-orange-900/20 dark:text-orange-300">
                                            <Users className="h-4 w-4" />
                                            {service.available_spaces} Seat{service.available_spaces !== 1 ? 's' : ''} left
                                        </div>

                                        {service.driver_gender && (
                                            <div
                                                className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                                                    service.driver_gender === 'female'
                                                        ? 'border-pink-100 bg-pink-50 text-pink-700 dark:border-pink-800/30 dark:bg-pink-900/20 dark:text-pink-300'
                                                        : 'border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-800/30 dark:bg-indigo-900/20 dark:text-indigo-300'
                                                }`}
                                            >
                                                {service.driver_gender === 'female' ? '👩' : '👨'}{' '}
                                                {service.driver_gender === 'female' ? 'Female' : 'Male'} Driver
                                            </div>
                                        )}

                                        {service.is_roundtrip && (
                                            <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-green-100 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-300">
                                                🔄 Round Trip{' '}
                                                {(service.formatted_return_time || service.return_time) &&
                                                    `• Return: ${service.formatted_return_time || service.return_time}`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-3">
                            {/* Left Column: Car & Description */}
                            <div className="space-y-8 lg:col-span-2">
                                {routeMarkers.length > 0 && (
                                    <div>
                                        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Route Map</h2>
                                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                                            <GoogleMap
                                                center={routeMarkers[0].position}
                                                markers={routeMarkers}
                                                path={routePath}
                                                showFixedPin={false}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Car Information */}
                                {(service.car_brand || (service.car && service.car.name)) && (
                                    <div>
                                        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                            <Car className="h-5 w-5 text-[#7e246c]" />
                                            Vehicle Details
                                        </h2>
                                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
                                            <div className="mb-6 flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7e246c]/10 text-2xl">
                                                    🚗
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {service.car_brand
                                                            ? `${service.car_brand} ${service.car_model || ''}`
                                                            : service.car?.name || 'Standard Vehicle'}
                                                    </h3>
                                                    {service.car_color && <p className="text-sm text-gray-500 capitalize">{service.car_color}</p>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                                {service.car_seats && (
                                                    <div className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                                                        <div className="mb-1 text-xs text-gray-400">Seats</div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">{service.car_seats}</div>
                                                    </div>
                                                )}
                                                {service.car_transmission && (
                                                    <div className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                                                        <div className="mb-1 text-xs text-gray-400">Transmission</div>
                                                        <div className="font-semibold text-gray-900 capitalize dark:text-white">
                                                            {service.car_transmission}
                                                        </div>
                                                    </div>
                                                )}
                                                {service.car_fuel_type && (
                                                    <div className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                                                        <div className="mb-1 text-xs text-gray-400">Fuel Type</div>
                                                        <div className="font-semibold text-gray-900 capitalize dark:text-white">
                                                            {service.car_fuel_type}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {service.description && (
                                    <div>
                                        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Description</h2>
                                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 leading-relaxed whitespace-pre-wrap text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                                            {service.description}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Provider & Contacts */}
                            <div className="space-y-6">
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
                                    <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                        <UserIcon className="h-5 w-5 text-[#7e246c]" />
                                        Driver Info
                                    </h2>

                                    <div className="mb-6 flex flex-col items-center text-center">
                                        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gray-100 text-2xl font-bold text-gray-400 shadow-md dark:border-gray-800 dark:bg-gray-700 dark:text-gray-500">
                                            {(service.name || service.user.name).charAt(0).toUpperCase()}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{service.name || service.user.name}</h3>
                                        {user && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {service.contact || service.user.phone_number || service.user.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {user ? (
                                            <>
                                                {(service.contact || service.user.phone_number) && (
                                                    <>
                                                        <button
                                                            onClick={handleCall}
                                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700"
                                                        >
                                                            <Phone className="h-5 w-5" />
                                                            Call Driver
                                                        </button>
                                                        <button
                                                            onClick={handleWhatsAppCall}
                                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 font-semibold text-white shadow-lg shadow-[#25D366]/20 transition-colors hover:bg-[#20BA5A]"
                                                        >
                                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.239-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                            </svg>
                                                            WhatsApp
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={handleMessageUser}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#7e246c] bg-white px-6 py-3 font-semibold text-[#7e246c] transition-all hover:bg-[#7e246c] hover:text-white"
                                                >
                                                    <MessageSquare className="h-5 w-5" />
                                                    Chat in App
                                                </button>
                                            </>
                                        ) : (
                                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-900/20">
                                                <p className="mb-4 text-sm font-medium text-blue-800 dark:text-blue-300">
                                                    Login to view contact details and book your ride.
                                                </p>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => navigate('/login')}
                                                        className="w-full rounded-lg bg-[#7e246c] px-4 py-2 text-white transition-colors hover:bg-[#6a1f5c]"
                                                    >
                                                        Login Now
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('/signup')}
                                                        className="w-full px-4 py-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                                    >
                                                        Create Account
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Widget */}
            {showChat && user && (
                <div className="fixed right-6 bottom-6 z-50 flex h-[500px] w-96 max-w-full flex-col rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
                    <div className="flex items-center justify-between rounded-t-xl bg-[#7e246c] px-4 py-2">
                        <span className="font-semibold text-white">Chat with {service?.user.name}</span>
                        <button onClick={() => setShowChat(false)} className="text-xl font-bold text-white">
                            &times;
                        </button>
                    </div>
                    <div className="min-h-0 flex-1">
                        {chatError ? (
                            <div className="flex h-full items-center justify-center px-4 text-center text-red-400">{chatError}</div>
                        ) : typeof conversationId === 'number' ? (
                            <Chat conversationId={conversationId} currentUser={user} />
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-300">Starting conversation...</div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
