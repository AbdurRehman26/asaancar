import { useAuth } from '@/components/AuthContext';
import Chat from '@/components/chat';
import Footer from '@/components/Footer';
import GoogleMap from '@/components/GoogleMap';
import Navbar from '@/components/navbar';
import SEO from '@/components/SEO';
import { useToast } from '@/contexts/ToastContext';
import { apiFetch } from '@/lib/utils';
import { ArrowRight, Clock, MapPin, MessageSquare, Phone, User, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface RideRequestDetailData {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone_number?: string;
    };
    name?: string;
    contact?: string;
    start_location: string;
    start_place_id?: string | null;
    start_latitude?: number | null;
    start_longitude?: number | null;
    end_location: string;
    end_place_id?: string | null;
    end_latitude?: number | null;
    end_longitude?: number | null;
    departure_time: string;
    formatted_departure_time?: string;
    schedule_type: 'once' | 'everyday' | 'weekdays' | 'weekends' | 'custom';
    selected_days?: string[];
    selected_days_label?: string | null;
    is_roundtrip?: boolean;
    formatted_return_time?: string | null;
    required_seats: number;
    preferred_driver_gender: 'male' | 'female' | 'any';
    budget_per_seat?: number | null;
    currency?: string;
    description?: string;
}

export default function RideRequestDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { error: showError } = useToast();
    const [request, setRequest] = useState<RideRequestDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [chatError, setChatError] = useState<string | null>(null);

    const fetchRequest = useCallback(async () => {
        if (!id) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch(`/api/ride-requests/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch ride request details');
            }

            const data = await response.json();
            setRequest(data.data || data);
        } catch (fetchError) {
            setError(fetchError instanceof Error ? fetchError.message : 'Failed to load ride request');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void fetchRequest();
    }, [fetchRequest]);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
                <Navbar auth={{ user }} />
                <div className="flex min-h-screen items-center justify-center pt-20 pb-12">
                    <div className="text-center">
                        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#7e246c] border-t-transparent"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading ride request...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
                <Navbar auth={{ user }} />
                <div className="flex min-h-screen items-center justify-center pt-20 pb-12">
                    <div className="text-center">
                        <p className="mb-4 text-lg text-red-600 dark:text-red-400">{error || 'Ride request not found'}</p>
                        <button
                            onClick={() => navigate('/ride-requests')}
                            className="rounded-lg bg-[#7e246c] px-6 py-3 text-white transition-colors hover:bg-[#6a1f5c]"
                        >
                            Back to Ride Requests
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const routeMarkerCandidates = [
        {
            id: 'start',
            label: 'S',
            title: request.start_location,
            position:
                request.start_latitude != null && request.start_longitude != null
                    ? { lat: Number(request.start_latitude), lng: Number(request.start_longitude) }
                    : null,
            placeId: request.start_place_id ?? null,
            address: request.start_location,
        },
        {
            id: 'end',
            label: 'E',
            title: request.end_location,
            position:
                request.end_latitude != null && request.end_longitude != null
                    ? { lat: Number(request.end_latitude), lng: Number(request.end_longitude) }
                    : null,
            placeId: request.end_place_id ?? null,
            address: request.end_location,
        },
    ];

    const routeMarkers = routeMarkerCandidates
        .filter((marker) => marker.position)
        .map((marker) => ({
            id: marker.id,
            label: marker.label,
            title: marker.title,
            position: marker.position!,
        }));

    const handleCall = () => {
        const phoneNumber = request.contact || request.user?.phone_number;

        if (!phoneNumber) {
            showError('Phone Number', 'Phone number not available for this requester.');

            return;
        }

        window.location.href = `tel:${phoneNumber}`;
    };

    const handleWhatsAppCall = () => {
        const phoneNumber = request.contact || request.user?.phone_number;

        if (!phoneNumber) {
            showError('Phone Number', 'Phone number not available for this requester.');

            return;
        }

        const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
        window.open(`https://wa.me/${cleanPhoneNumber}`, '_blank');
    };

    const handleMessageUser = async () => {
        if (!user || !request) {
            return;
        }

        try {
            const response = await apiFetch('/api/chat/conversations');
            const conversations: Array<{ id: number; type: string; recipient_user_id?: number | null }> = await response.json();
            const existingConversation = conversations.find(
                (conversation) => conversation.type === 'user' && Number(conversation.recipient_user_id) === request.user.id,
            );

            if (existingConversation) {
                setConversationId(existingConversation.id);
                setShowChat(true);
                setChatError(null);

                return;
            }

            const createResponse = await apiFetch('/api/chat/conversations', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'user',
                    recipient_user_id: request.user.id,
                }),
            });

            const newConversation = await createResponse.json();

            if (newConversation?.id) {
                setConversationId(newConversation.id);
                setShowChat(true);
                setChatError(null);

                return;
            }

            setShowChat(true);
            setConversationId(null);
            setChatError('Could not start chat. Please try again later.');
        } catch (chatRequestError) {
            console.error('Chat error:', chatRequestError);
            setShowChat(true);
            setConversationId(null);
            setChatError('Could not start chat. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
            <SEO
                title={`${request.start_location} to ${request.end_location} Ride Request | Asaancar`}
                description={`Passenger needs ${request.required_seats} seat${request.required_seats !== 1 ? 's' : ''} from ${request.start_location} to ${request.end_location}.`}
                image={`${typeof window !== 'undefined' ? window.location.origin : ''}/icon.png`}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                type="article"
                siteName="Asaancar"
            />
            <Navbar auth={{ user }} />

            <div className="px-4 pt-20 pb-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    <div className="mt-4 overflow-hidden rounded-3xl border border-[#7e246c]/15 bg-gradient-to-r from-[#7e246c] via-[#8d2b79] to-[#b14a9a] px-5 py-4 text-white shadow-xl shadow-[#7e246c]/20 sm:px-6">
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
                                    src="/google-play-download-android-app-logo.svg"
                                    alt="Get it on Google Play"
                                    className="h-24 w-auto sm:h-28 md:h-32"
                                />
                            </a>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-lg dark:bg-gray-800">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#7e246c]/10 px-4 py-2 text-sm font-semibold text-[#7e246c] dark:bg-[#7e246c]/20 dark:text-[#d685c3]">
                                    Ride Request
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">From</div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{request.start_location}</div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">To</div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{request.end_location}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Clock className="h-4 w-4" />
                                        Departure
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {request.formatted_departure_time || request.departure_time}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Users className="h-4 w-4" />
                                        Seats Needed
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-white">{request.required_seats}</div>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <User className="h-4 w-4" />
                                        Driver Preference
                                    </div>
                                    <div className="font-semibold text-gray-900 capitalize dark:text-white">{request.preferred_driver_gender}</div>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <MapPin className="h-4 w-4" />
                                        Budget
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {request.budget_per_seat
                                            ? `${request.currency || 'PKR'} ${Math.round(request.budget_per_seat).toLocaleString()}`
                                            : 'Flexible'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate('/ride-requests')}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                Back to Requests
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                        <div className="space-y-6">
                            <div className="rounded-3xl bg-white p-6 shadow-lg dark:bg-gray-800">
                                <h2 className="mb-4 text-xl font-semibold text-[#7e246c] dark:text-white">Route Map</h2>
                                <GoogleMap
                                    markerCandidates={routeMarkerCandidates}
                                    markers={routeMarkers}
                                    path={routeMarkers.map((marker) => marker.position)}
                                    showFixedPin={false}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-3xl bg-white p-6 shadow-lg dark:bg-gray-800">
                                <h2 className="mb-4 text-xl font-semibold text-[#7e246c] dark:text-white">Requester</h2>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                                        <div className="font-semibold text-gray-900 dark:text-white">{request.name || request.user.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Schedule</div>
                                        <div className="font-semibold text-gray-900 capitalize dark:text-white">
                                            {request.schedule_type === 'custom'
                                                ? request.selected_days_label || request.selected_days?.join(', ')
                                                : request.schedule_type}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {user ? (
                                        <>
                                            {(request.contact || request.user.phone_number) && (
                                                <>
                                                    <button
                                                        onClick={handleCall}
                                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700"
                                                    >
                                                        <Phone className="h-5 w-5" />
                                                        Call Requester
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
                                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-900/20">
                                            <p className="mb-4 text-sm font-medium text-blue-800 dark:text-blue-300">
                                                Login to view contact details and connect with the requester.
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

                            {request.description ? (
                                <div className="rounded-3xl bg-white p-6 shadow-lg dark:bg-gray-800">
                                    <h2 className="mb-4 text-xl font-semibold text-[#7e246c] dark:text-white">Notes</h2>
                                    <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">{request.description}</p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {showChat && user && (
                <div className="fixed right-6 bottom-6 z-50 flex h-[500px] w-96 max-w-full flex-col rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
                    <div className="flex items-center justify-between rounded-t-xl bg-[#7e246c] px-4 py-2">
                        <span className="font-semibold text-white">Chat with {request?.user.name}</span>
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
        </div>
    );
}
