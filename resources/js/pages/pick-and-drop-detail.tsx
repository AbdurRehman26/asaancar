import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, ArrowRight, Phone, MessageSquare, User as UserIcon, Car, Navigation, ChevronDown, ChevronUp } from 'lucide-react';
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
    description?: string;
    price_per_person?: number;
    currency: string;
    is_active: boolean;
    is_everyday?: boolean;
    stops?: PickAndDropStop[];
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
                            className="px-6 py-2 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors"
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
        ? `Book a ${service.driver_gender === 'female' ? 'female' : 'male'} driver pick & drop service from ${service.start_location} to ${service.end_location}. ${service.is_everyday ? 'Available everyday' : 'Scheduled service'} at ${service.departure_time}. ${service.available_spaces} space${service.available_spaces !== 1 ? 's' : ''} available.${service.price_per_person ? ` Price: ${service.currency} ${Math.round(service.price_per_person).toLocaleString()} per person.` : ''}${service.stops && service.stops.length > 0 ? ` Includes ${service.stops.length} stop${service.stops.length !== 1 ? 's' : ''}.` : ''} Book your ride on Asaancar.`
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
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/pick-and-drop')}
                        className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#7e246c] transition-colors"
                    >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        Back to Listing
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-[#7e246c] to-purple-600 p-8 text-white">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        {service.start_location} → {service.end_location}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                            service.driver_gender === 'female'
                                                ? 'bg-pink-500/40 text-white border-2 border-pink-300/60'
                                                : 'bg-cyan-500/40 text-white border-2 border-cyan-300/60'
                                        }`}>
                                            {service.driver_gender === 'female' ? '👩' : '👨'} {service.driver_gender === 'female' ? 'Female' : 'Male'} Driver
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Route Information */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                                        <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white mb-4 flex items-center gap-2">
                                            <Navigation className="h-5 w-5" />
                                            Route Details
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Pickup Location</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white ml-5">{service.start_location}</p>
                                                </div>
                                            </div>
                                            {service.stops && service.stops.length > 0 && (
                                                <div className="ml-5">
                                                    <button
                                                        onClick={() => setShowStops(!showStops)}
                                                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-[#7e246c] transition-colors mb-2"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                        <span>Stops ({service.stops.length})</span>
                                                        {showStops ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    {showStops && (
                                                        <div className="space-y-3">
                                                            {service.stops
                                                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                                                .map((stop, index) => {
                                                                    // Determine stop location display
                                                                    let stopLocation = stop.location;
                                                                    if (!stopLocation) {
                                                                        if (stop.area) {
                                                                            stopLocation = stop.area.name;
                                                                        } else if (stop.city) {
                                                                            stopLocation = stop.city.name;
                                                                        } else {
                                                                            stopLocation = 'Location not specified';
                                                                        }
                                                                    }
                                                                    
                                                                    return (
                                                                        <div key={stop.id} className="flex items-start gap-4">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Stop {index + 1}</span>
                                                                                </div>
                                                                                <p className="text-gray-900 dark:text-white ml-5 font-medium">{stopLocation}</p>
                                                                                {stop.area && (
                                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-5">Area: {stop.area.name}</p>
                                                                                )}
                                                                                <p className="text-sm text-gray-500 dark:text-gray-400 ml-5">
                                                                                    <Clock className="h-3 w-3 inline mr-1" />
                                                                                    {stop.stop_time}
                                                                                </p>
                                                                                {stop.notes && (
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-5 mt-1 italic">{stop.notes}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Dropoff Location</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white ml-5">{service.end_location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Details */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                                        <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white mb-4">Service Details</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Departure Time</span>
                                                </div>
                                                <p className="text-gray-900 dark:text-white font-semibold">
                                                    {service.is_everyday ? (
                                                        <span>Everyday at {service.departure_time}</span>
                                                    ) : (
                                                        service.departure_time
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                                    <Users className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Available Spaces</span>
                                                </div>
                                                <p className="text-gray-900 dark:text-white font-semibold">{service.available_spaces} space{service.available_spaces !== 1 ? 's' : ''}</p>
                                            </div>
                                            {service.price_per_person && (
                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                                        <span className="text-sm font-medium">Price Per Person</span>
                                                    </div>
                                                    <p className="text-gray-900 dark:text-white font-semibold">
                                                        {service.currency} {Math.round(service.price_per_person).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Car Details */}
                                    {service.car_brand && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                                            <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white mb-4 flex items-center gap-2">
                                                <Car className="h-5 w-5" />
                                                Car Information
                                            </h2>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {service.car_brand && (
                                                    <div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Brand</span>
                                                        <p className="text-gray-900 dark:text-white font-semibold">{service.car_brand}</p>
                                                    </div>
                                                )}
                                                {service.car_model && (
                                                    <div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Model</span>
                                                        <p className="text-gray-900 dark:text-white font-semibold">{service.car_model}</p>
                                                    </div>
                                                )}
                                                {service.car_color && (
                                                    <div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Color</span>
                                                        <p className="text-gray-900 dark:text-white font-semibold capitalize">{service.car_color}</p>
                                                    </div>
                                                )}
                                                {service.car_seats && (
                                                    <div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Seats</span>
                                                        <p className="text-gray-900 dark:text-white font-semibold">{service.car_seats}</p>
                                                    </div>
                                                )}
                                                {service.car_transmission && (
                                                    <div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Transmission</span>
                                                        <p className="text-gray-900 dark:text-white font-semibold capitalize">{service.car_transmission}</p>
                                                    </div>
                                                )}
                                                {service.car_fuel_type && (
                                                    <div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Fuel Type</span>
                                                        <p className="text-gray-900 dark:text-white font-semibold capitalize">{service.car_fuel_type}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {service.description && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                                            <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white mb-4">Description</h2>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{service.description}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar - Contact & Provider Info */}
                                <div className="space-y-6">
                                    {/* Provider Information */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                                        <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white mb-4 flex items-center gap-2">
                                            <UserIcon className="h-5 w-5" />
                                            Service Provider
                                        </h2>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Name</span>
                                                <p className="text-gray-900 dark:text-white font-semibold">
                                                    {service.name || service.user.name}
                                                </p>
                                            </div>
                                            {(service.contact || (user && service.user.phone_number)) && (
                                                <div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Phone</span>
                                                    <p className="text-gray-900 dark:text-white">
                                                        {service.contact || (user ? service.user.phone_number : '')}
                                                    </p>
                                                </div>
                                            )}
                                            {user && service.user.email && !service.contact && (
                                                <div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                                                    <p className="text-gray-900 dark:text-white">{service.user.email}</p>
                                                </div>
                                            )}
                                            {!service.name && !service.contact && user && !service.user.email && !service.user.phone_number && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                    Contact information not available
                                                </div>
                                            )}
                                            {!service.name && !service.contact && !user && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                    Please log in to view contact information
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Actions */}
                                    {user && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-3">
                                            <h2 className="text-xl font-semibold text-[#7e246c] dark:text-white mb-4">Contact Provider</h2>
                                            {(service.contact || service.user.phone_number) && (
                                                <>
                                                    <button
                                                        onClick={handleCall}
                                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                                    >
                                                        <Phone className="h-5 w-5" />
                                                        Call Now
                                                    </button>
                                                    <button
                                                        onClick={handleWhatsAppCall}
                                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors font-semibold"
                                                    >
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.239-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                        </svg>
                                                        WhatsApp
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={handleMessageUser}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors font-semibold"
                                            >
                                                <MessageSquare className="h-5 w-5" />
                                                Send Message
                                            </button>
                                        </div>
                                    )}

                                    {!user && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                                            <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                                                Please login to contact the service provider
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => navigate('/login')}
                                                    className="w-full px-4 py-2 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors"
                                                >
                                                    Login
                                                </button>
                                                <button
                                                    onClick={() => navigate('/signup')}
                                                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    Sign Up
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

