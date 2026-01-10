import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Clock, ArrowRight, Phone, MessageSquare, User as UserIcon, Car, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import { apiFetch } from '@/lib/utils';
import Chat from '@/components/chat';
import { useToast } from '@/contexts/ToastContext';
import SEO from '@/components/SEO';

interface PickAndDropStop {
    id: number;
    location?: string;
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
    end_location: string;
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
                        pick_and_drop_service_id: serviceId
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
                <div className="pt-20 pb-12 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="inline-block w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin mb-4"></div>
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
                <div className="pt-20 pb-12 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error || 'Service not found'}</p>
                        <button
                            onClick={() => navigate('/pick-and-drop')}
                            className="px-6 pt-4 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors"
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

            <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/pick-and-drop')}
                        className="mb-6 flex pt-4 items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#7e246c] hover:underline transition-all"
                    >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        Back to Listing
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                        {/* Header Section */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                        Route Details
                                    </h1>

                                    {/* Visual Route */}
                                    <div className="relative pl-2">
                                        {/* Start */}
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="mt-1.5 flex flex-col items-center gap-1">
                                                <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.15)] ring-2 ring-white dark:ring-gray-800"></div>
                                                <div className="w-0.5 h-full min-h-[40px] bg-gradient-to-b from-green-500/50 to-gray-200 dark:to-gray-700 absolute top-5 left-[7px] -z-10"></div>
                                            </div>
                                            <div className="pb-6">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                                    {service.start_location}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start Point</p>
                                            </div>
                                        </div>

                                        {/* Stops */}
                                        {service.stops && service.stops.length > 0 && (
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-0.5 h-full absolute left-[9px] top-0 bottom-0 bg-gray-200 dark:bg-gray-700 -z-10"></div>
                                                    <div className="ml-[9px] -mt-4 pl-8 w-full">
                                                        <button
                                                            onClick={() => setShowStops(!showStops)}
                                                            className="flex items-center gap-2 text-sm font-medium text-[#7e246c] bg-[#7e246c]/5 px-3 py-1.5 rounded-full w-fit hover:bg-[#7e246c]/10 transition-colors"
                                                        >
                                                            {service.stops.length} Stop{service.stops.length !== 1 ? 's' : ''} in between
                                                            {showStops ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                        </button>

                                                        <div className={`grid transition-all duration-300 ease-in-out ${showStops ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                                                            <div className="overflow-hidden">
                                                                <div className="space-y-4 border-l-2 border-dashed border-gray-200 dark:border-gray-700 ml-2 pl-4 py-1">
                                                                    {service.stops
                                                                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                                                                        .map((stop, index) => (
                                                                            <div key={stop.id || index} className="relative">
                                                                                <div className="absolute -left-[21px] top-2 w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600 ring-4 ring-white dark:ring-gray-800"></div>
                                                                                <div className="font-medium text-gray-900 dark:text-white">
                                                                                    {stop.location || stop.area?.name || stop.city?.name || 'Location not specified'}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                                                    <Clock className="w-3 h-3" /> {stop.stop_time}
                                                                                </div>
                                                                                {stop.notes && (
                                                                                    <p className="text-xs text-gray-500 mt-1 italic">"{stop.notes}"</p>
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
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="mt-1 flex flex-col items-center">
                                                <MapPin className="w-5 h-5 text-[#7e246c] fill-[#7e246c]/10" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                                    {service.end_location}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Destination</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Price & Quick Stats */}
                                <div className="flex flex-col gap-4 min-w-[200px] shrink-0">
                                    {service.price_per_person && (
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Per Person</p>
                                            <div className="text-3xl font-bold text-[#7e246c] dark:text-[#9d4edd] mt-1">
                                                {service.currency} {Math.round(service.price_per_person).toLocaleString()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Key Info Chips */}
                                    <div className="flex flex-wrap gap-2">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border w-full justify-center ${service.is_everyday
                                            ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30'
                                            : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                                            }`}>
                                            <Clock className="w-4 h-4" />
                                            {service.schedule_type == 'once' ? 'On' : service.schedule_type == 'custom' ? service.selected_days : service.schedule_type.toUpperCase()} • {service.formatted_departure_time || service.departure_time}
                                        </div>

                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30 w-full justify-center">
                                            <Users className="w-4 h-4" />
                                            {service.available_spaces} Seat{service.available_spaces !== 1 ? 's' : ''} left
                                        </div>

                                        {service.driver_gender && (
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border w-full justify-center ${service.driver_gender === 'female'
                                                ? 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800/30'
                                                : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/30'
                                                }`}>
                                                {service.driver_gender === 'female' ? '👩' : '👨'} {service.driver_gender === 'female' ? 'Female' : 'Male'} Driver
                                            </div>
                                        )}

                                        {service.is_roundtrip && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/30 w-full justify-center">
                                                🔄 Round Trip {(service.formatted_return_time || service.return_time) && `• Return: ${service.formatted_return_time || service.return_time}`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Car & Description */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Car Information */}
                                {(service.car_brand || (service.car && service.car.name)) && (
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Car className="h-5 w-5 text-[#7e246c]" />
                                            Vehicle Details
                                        </h2>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 rounded-full bg-[#7e246c]/10 flex items-center justify-center text-2xl">
                                                    🚗
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {service.car_brand ? `${service.car_brand} ${service.car_model || ''}` : (service.car?.name || 'Standard Vehicle')}
                                                    </h3>
                                                    {service.car_color && (
                                                        <p className="text-gray-500 text-sm capitalize">{service.car_color}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {service.car_seats && (
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                        <div className="text-xs text-gray-400 mb-1">Seats</div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">{service.car_seats}</div>
                                                    </div>
                                                )}
                                                {service.car_transmission && (
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                        <div className="text-xs text-gray-400 mb-1">Transmission</div>
                                                        <div className="font-semibold text-gray-900 dark:text-white capitalize">{service.car_transmission}</div>
                                                    </div>
                                                )}
                                                {service.car_fuel_type && (
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                        <div className="text-xs text-gray-400 mb-1">Fuel Type</div>
                                                        <div className="font-semibold text-gray-900 dark:text-white capitalize">{service.car_fuel_type}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {service.description && (
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Description</h2>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {service.description}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Provider & Contacts */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg shadow-gray-100 dark:shadow-none">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <UserIcon className="h-5 w-5 text-[#7e246c]" />
                                        Driver Info
                                    </h2>

                                    <div className="flex flex-col items-center text-center mb-6">
                                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-400 dark:text-gray-500 mb-3 border-4 border-white dark:border-gray-800 shadow-md">
                                            {(service.name || service.user.name).charAt(0).toUpperCase()}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {service.name || service.user.name}
                                        </h3>
                                        {user && (
                                            <p className="text-sm text-gray-500 mt-1">
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
                                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg shadow-green-600/20"
                                                        >
                                                            <Phone className="h-5 w-5" />
                                                            Call Driver
                                                        </button>
                                                        <button
                                                            onClick={handleWhatsAppCall}
                                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl hover:bg-[#20BA5A] transition-colors font-semibold shadow-lg shadow-[#25D366]/20"
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
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#7e246c] text-[#7e246c] rounded-xl hover:bg-[#7e246c] hover:text-white transition-all font-semibold"
                                                >
                                                    <MessageSquare className="h-5 w-5" />
                                                    Chat in App
                                                </button>
                                            </>
                                        ) : (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
                                                <p className="text-sm text-blue-800 dark:text-blue-300 mb-4 font-medium">
                                                    Login to view contact details and book your ride.
                                                </p>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => navigate('/login')}
                                                        className="w-full px-4 py-2 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors"
                                                    >
                                                        Login Now
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('/signup')}
                                                        className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
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

