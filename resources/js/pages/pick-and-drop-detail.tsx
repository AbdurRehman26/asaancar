import { useAuth } from '@/components/AuthContext';
import Chat from '@/components/chat';
import Footer from '@/components/Footer';
import GoogleMap from '@/components/GoogleMap';
import Navbar from '@/components/navbar';
import SEO from '@/components/SEO';
import { useToast } from '@/contexts/ToastContext';
import { recordContactingStat } from '@/lib/contacting-stats';
import { apiFetch } from '@/lib/utils';
import { ArrowRight, Car, ChevronDown, ChevronUp, Clock, MapPin, MessageSquare, Phone, User as UserIcon, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
    const sortedStops = useMemo(() => [...(service?.stops ?? [])].sort((a, b) => (a.order || 0) - (b.order || 0)), [service?.stops]);

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

        recordContactingStat({
            recipientUserId: service.user.id,
            contactableType: 'pick_and_drop',
            contactableId: service.id,
            contactMethod: 'chat',
        });

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
            if (service) {
                recordContactingStat({
                    recipientUserId: service.user.id,
                    contactableType: 'pick_and_drop',
                    contactableId: service.id,
                    contactMethod: 'call',
                });
            }
            window.location.href = `tel:${phoneNumber}`;
        } else {
            showError('Phone Number', 'Phone number not available for this service provider.');
        }
    };

    const formatWhatsAppDeparture = (departureTime: string, scheduleType: PickAndDropService['schedule_type']) => {
        const parsedDate = new Date(departureTime);

        if (Number.isNaN(parsedDate.getTime())) {
            return scheduleType === 'once' ? `on ${departureTime}` : `at ${departureTime}`;
        }

        const dateLabel = new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
        }).format(parsedDate);

        const timeLabel = new Intl.DateTimeFormat('en-GB', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
            .format(parsedDate)
            .toLowerCase();

        return scheduleType === 'once' ? `on ${dateLabel} at ${timeLabel}` : `at ${timeLabel}`;
    };

    const handleWhatsAppCall = () => {
        const phoneNumber = service?.contact || service?.user?.phone_number;
        if (phoneNumber) {
            if (service) {
                recordContactingStat({
                    recipientUserId: service.user.id,
                    contactableType: 'pick_and_drop',
                    contactableId: service.id,
                    contactMethod: 'whatsapp',
                });
            }
            const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
            const contactName = service?.name || service?.user?.name || 'there';
            const senderName = user?.name || 'a AsaanCar user';
            const departureLabel = formatWhatsAppDeparture(service.departure_time, service.schedule_type);
            const message = `Hi ${contactName}, I'm ${senderName} and I saw your ride on AsaanCar from ${service.start_location} to ${service.end_location} ${departureLabel}. Is it still available?`;

            window.open(`https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            showError('Phone Number', 'Phone number not available for this service provider.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
                <Navbar auth={{ user }} />
                <div className="flex min-h-screen items-center justify-center pt-20 pb-12">
                    <div className="rounded-[1.75rem] border border-white/70 bg-white/85 px-8 py-10 text-center shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#7e246c] border-t-transparent"></div>
                        <p className="text-[#6b5368] dark:text-white/65">Loading service details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
                <Navbar auth={{ user }} />
                <div className="flex min-h-screen items-center justify-center pt-20 pb-12">
                    <div className="rounded-[1.75rem] border border-white/70 bg-white/85 px-8 py-10 text-center shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                        <p className="mb-4 text-lg text-red-600 dark:text-red-400">{error || 'Service not found'}</p>
                        <button
                            onClick={() => navigate('/pick-and-drop')}
                            className="rounded-lg bg-[#7e246c] px-6 py-3 text-white transition-colors hover:bg-[#6a1f5c]"
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
        ...sortedStops
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

    const routeMarkerCandidates = [
        {
            id: 'start',
            label: 'S',
            title: service.start_location,
            position:
                service.start_latitude != null && service.start_longitude != null
                    ? {
                          lat: Number(service.start_latitude),
                          lng: Number(service.start_longitude),
                      }
                    : null,
            placeId: service.start_place_id ?? null,
            address: service.start_location,
        },
        ...sortedStops.map((stop, index) => ({
            id: `stop-${stop.id ?? index}`,
            label: `${index + 1}`,
            title: stop.location || `Stop ${index + 1}`,
            position:
                stop.latitude != null && stop.longitude != null
                    ? {
                          lat: Number(stop.latitude),
                          lng: Number(stop.longitude),
                      }
                    : null,
            placeId: stop.place_id ?? null,
            address: stop.location || stop.area?.name || stop.city?.name || null,
        })),
        {
            id: 'end',
            label: 'E',
            title: service.end_location,
            position:
                service.end_latitude != null && service.end_longitude != null
                    ? {
                          lat: Number(service.end_latitude),
                          lng: Number(service.end_longitude),
                      }
                    : null,
            placeId: service.end_place_id ?? null,
            address: service.end_location,
        },
    ];

    const routePath = routeMarkers.length === routeMarkerCandidates.length ? routeMarkers.map((marker) => marker.position) : [];

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
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
                    <div className="mt-4 mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-white/60 bg-white/80 px-6 py-7 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.28)] backdrop-blur md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-[#17141f]/88 dark:[background-image:linear-gradient(90deg,_rgba(23,20,31,0.94)_0%,_rgba(23,20,31,0.94)_44%,_rgba(255,255,255,0.14)_100%)] dark:shadow-none">
                        <div className="max-w-3xl text-center md:text-left">
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#7e246c]/10 px-4 py-2 text-sm font-semibold text-[#7e246c] dark:bg-white/8 dark:text-white/80">
                                Route Details
                            </div>
                            <h1 className="mt-4 text-4xl font-bold text-[#2b1128] dark:text-white">{service.start_location}</h1>
                            <div className="my-2 flex justify-center md:justify-start">
                                <ArrowRight className="h-5 w-5 text-[#9e889a] dark:text-white/40" />
                            </div>
                            <p className="text-2xl font-semibold text-[#5f4860] dark:text-white/78">{service.end_location}</p>
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
                                onClick={() => navigate('/pick-and-drop')}
                                className="inline-flex items-center gap-2 rounded-lg border border-[#7e246c]/20 bg-white px-5 py-3 font-medium text-[#7e246c] transition-colors hover:bg-[#fbf3fa] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                            >
                                <ArrowRight className="h-4 w-4 rotate-180" />
                                Back to Listing
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                        {/* Header Section */}
                        <div className="border-b border-[#7e246c]/8 p-8 dark:border-white/10">
                            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                                <div className="flex-1">
                                    <h1 className="mb-4 text-2xl font-bold text-[#2b1128] md:text-3xl dark:text-white">Route Details</h1>

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
                                                <p className="mt-1 text-sm text-[#8a7286] dark:text-white/45">Start Point</p>
                                            </div>
                                        </div>

                                        {/* Stops */}
                                        {service.stops && service.stops.length > 0 && (
                                            <div className="relative z-10">
                                                <div className="mb-6 flex items-center gap-4">
                                                    <div className="absolute top-0 bottom-0 left-[9px] -z-10 h-full w-0.5 bg-[#eadfeb] dark:bg-white/10"></div>
                                                    <div className="-mt-4 ml-[9px] w-full pl-8">
                                                        <button
                                                            onClick={() => setShowStops(!showStops)}
                                                            className="flex w-fit items-center gap-2 rounded-full bg-[#7e246c]/8 px-3 py-1.5 text-sm font-medium text-[#7e246c] transition-colors hover:bg-[#7e246c]/12 dark:bg-white/8 dark:text-white/80"
                                                        >
                                                            {service.stops.length} Stop{service.stops.length !== 1 ? 's' : ''} in between
                                                            {showStops ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                        </button>

                                                        <div
                                                            className={`grid transition-all duration-300 ease-in-out ${showStops ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                                        >
                                                            <div className="overflow-hidden">
                                                                <div className="ml-2 space-y-4 border-l-2 border-dashed border-[#eadfeb] py-1 pl-4 dark:border-white/10">
                                                                    {sortedStops.map((stop, index) => (
                                                                        <div key={stop.id || index} className="relative">
                                                                            <div className="absolute top-2 -left-[21px] h-2.5 w-2.5 rounded-full bg-[#c8afc6] ring-4 ring-white dark:bg-white/35 dark:ring-[#17141f]"></div>
                                                                            <div className="font-medium text-[#2b1128] dark:text-white">
                                                                                {stop.location ||
                                                                                    stop.area?.name ||
                                                                                    stop.city?.name ||
                                                                                    'Location not specified'}
                                                                            </div>
                                                                            <div className="mt-0.5 flex items-center gap-2 text-xs text-[#8a7286] dark:text-white/45">
                                                                                <Clock className="h-3 w-3" /> {stop.stop_time}
                                                                            </div>
                                                                            {stop.notes && (
                                                                                <p className="mt-1 text-xs text-[#8a7286] italic dark:text-white/45">
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
                                                <h3 className="text-xl leading-tight font-bold text-[#2b1128] dark:text-white">
                                                    {service.end_location}
                                                </h3>
                                                <p className="mt-1 text-sm text-[#8a7286] dark:text-white/45">Destination</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Price & Quick Stats */}
                                <div className="flex min-w-[200px] shrink-0 flex-col gap-4">
                                    {service.price_per_person && (
                                        <div className="rounded-xl border border-[#7e246c]/10 bg-[#fbf4fa] p-4 text-center dark:border-white/10 dark:bg-white/6">
                                            <p className="text-sm font-medium text-[#8a7286] dark:text-white/45">Per Person</p>
                                            <div className="mt-1 text-3xl font-bold text-[#7e246c] dark:text-white">
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

                        <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.8fr)]">
                            {/* Left Column: Car & Description */}
                            <div className="space-y-8">
                                {routeMarkerCandidates.length > 1 && (
                                    <div>
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <h2 className="text-lg font-bold text-[#2b1128] dark:text-white">Route Map</h2>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8a7286] dark:text-white/45">
                                                <span className="rounded-full bg-green-100 px-2 py-1 font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                    S Start
                                                </span>
                                                {sortedStops.length > 0 && (
                                                    <span className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                        1-{sortedStops.length} Stops
                                                    </span>
                                                )}
                                                <span className="rounded-full bg-[#7e246c]/10 px-2 py-1 font-medium text-[#7e246c] dark:text-[#d18bc2]">
                                                    E End
                                                </span>
                                            </div>
                                        </div>
                                        <div className="overflow-hidden rounded-2xl border border-[#7e246c]/10 bg-[#fbf4fa] dark:border-white/10 dark:bg-white/6">
                                            <GoogleMap
                                                center={routeMarkers[0]?.position}
                                                markers={routeMarkers}
                                                markerCandidates={routeMarkerCandidates}
                                                path={routePath}
                                                showFixedPin={false}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Car Information */}
                                {(service.car_brand || (service.car && service.car.name)) && (
                                    <div>
                                        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#2b1128] dark:text-white">
                                            <Car className="h-5 w-5 text-[#7e246c]" />
                                            Vehicle Details
                                        </h2>
                                        <div className="rounded-2xl border border-[#7e246c]/10 bg-[#fbf4fa] p-6 dark:border-white/10 dark:bg-white/6">
                                            <div className="mb-6 flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7e246c]/10 text-2xl">
                                                    🚗
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-[#2b1128] dark:text-white">
                                                        {service.car_brand
                                                            ? `${service.car_brand} ${service.car_model || ''}`
                                                            : service.car?.name || 'Standard Vehicle'}
                                                    </h3>
                                                    {service.car_color && (
                                                        <p className="text-sm text-[#8a7286] capitalize dark:text-white/45">{service.car_color}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                                {service.car_seats && (
                                                    <div className="rounded-lg border border-white/70 bg-white p-3 dark:border-white/10 dark:bg-[#17141f]/92">
                                                        <div className="mb-1 text-xs text-[#8a7286] dark:text-white/45">Seats</div>
                                                        <div className="font-semibold text-[#2b1128] dark:text-white">{service.car_seats}</div>
                                                    </div>
                                                )}
                                                {service.car_transmission && (
                                                    <div className="rounded-lg border border-white/70 bg-white p-3 dark:border-white/10 dark:bg-[#17141f]/92">
                                                        <div className="mb-1 text-xs text-[#8a7286] dark:text-white/45">Transmission</div>
                                                        <div className="font-semibold text-[#2b1128] capitalize dark:text-white">
                                                            {service.car_transmission}
                                                        </div>
                                                    </div>
                                                )}
                                                {service.car_fuel_type && (
                                                    <div className="rounded-lg border border-white/70 bg-white p-3 dark:border-white/10 dark:bg-[#17141f]/92">
                                                        <div className="mb-1 text-xs text-[#8a7286] dark:text-white/45">Fuel Type</div>
                                                        <div className="font-semibold text-[#2b1128] capitalize dark:text-white">
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
                                        <h2 className="mb-4 text-lg font-bold text-[#2b1128] dark:text-white">Description</h2>
                                        <div className="rounded-2xl border border-[#7e246c]/10 bg-[#fbf4fa] p-6 leading-relaxed whitespace-pre-wrap text-[#6f556c] dark:border-white/10 dark:bg-white/6 dark:text-white/65">
                                            {service.description}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Provider & Contacts */}
                            <div className="space-y-6">
                                <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                                    <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-[#2b1128] dark:text-white">
                                        <UserIcon className="h-5 w-5 text-[#7e246c]" />
                                        Driver Info
                                    </h2>

                                    <div className="mb-6 flex flex-col items-center text-center">
                                        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#fbf4fa] text-2xl font-bold text-[#9e889a] shadow-md dark:border-[#17141f] dark:bg-white/6 dark:text-white/45">
                                            {(service.name || service.user.name).charAt(0).toUpperCase()}
                                        </div>
                                        <h3 className="text-xl font-bold text-[#2b1128] dark:text-white">{service.name || service.user.name}</h3>
                                        {user && (
                                            <p className="mt-1 text-sm text-[#8a7286] dark:text-white/45">
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
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#7e246c] bg-white px-6 py-3 font-semibold text-[#7e246c] transition-all hover:bg-[#7e246c] hover:text-white dark:bg-transparent"
                                                >
                                                    <MessageSquare className="h-5 w-5" />
                                                    Chat in App
                                                </button>
                                            </>
                                        ) : (
                                            <div className="rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] p-6 text-center dark:border-white/10 dark:bg-white/6">
                                                <p className="mb-4 text-sm font-medium text-[#6b5368] dark:text-white/70">
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
                                                        className="w-full px-4 py-2 text-[#7d6678] transition-colors hover:text-[#2b1128] dark:text-white/55 dark:hover:text-white"
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
