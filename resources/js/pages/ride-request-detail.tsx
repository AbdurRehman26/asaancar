import { useAuth } from '@/components/AuthContext';
import Chat from '@/components/chat';
import Footer from '@/components/Footer';
import GoogleMap from '@/components/GoogleMap';
import Navbar from '@/components/navbar';
import SEO from '@/components/SEO';
import { useToast } from '@/contexts/ToastContext';
import { recordContactingStat } from '@/lib/contacting-stats';
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
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
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
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
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

        recordContactingStat({
            recipientUserId: request.user.id,
            contactableType: 'ride_request',
            contactableId: request.id,
            contactMethod: 'call',
        });

        window.location.href = `tel:${phoneNumber}`;
    };

    const formatWhatsAppDeparture = (departureTime: string, scheduleType: RideRequestDetailData['schedule_type']) => {
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
        const phoneNumber = request.contact || request.user?.phone_number;

        if (!phoneNumber) {
            showError('Phone Number', 'Phone number not available for this requester.');

            return;
        }

        recordContactingStat({
            recipientUserId: request.user.id,
            contactableType: 'ride_request',
            contactableId: request.id,
            contactMethod: 'whatsapp',
        });

        const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
        const contactName = request.name || request.user?.name || 'there';
        const senderName = user?.name || 'a AsaanCar user';
        const departureLabel = formatWhatsAppDeparture(request.departure_time, request.schedule_type);
        const message = `Hi ${contactName}, I'm ${senderName} and I saw your ride request on AsaanCar from ${request.start_location} to ${request.end_location} ${departureLabel}. Is it still available?`;

        window.open(`https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleMessageUser = async () => {
        if (!user || !request) {
            return;
        }

        recordContactingStat({
            recipientUserId: request.user.id,
            contactableType: 'ride_request',
            contactableId: request.id,
            contactMethod: 'chat',
        });

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
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
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
                    <div className="mt-4 flex flex-col gap-4 rounded-[1.75rem] border border-white/60 bg-white/80 px-6 py-7 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.28)] backdrop-blur md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-[#17141f]/88 dark:[background-image:linear-gradient(90deg,_rgba(23,20,31,0.94)_0%,_rgba(23,20,31,0.94)_44%,_rgba(255,255,255,0.14)_100%)] dark:shadow-none">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#7e246c]/10 px-4 py-2 text-sm font-semibold text-[#7e246c] dark:bg-white/8 dark:text-white/80">
                                Ride Request
                            </div>
                            <h1 className="mt-4 text-4xl font-bold text-[#2b1128] dark:text-white">{request.start_location}</h1>
                            <div className="my-2 flex justify-center md:justify-start">
                                <ArrowRight className="h-5 w-5 text-[#9e889a] dark:text-white/40" />
                            </div>
                            <p className="text-2xl font-semibold text-[#5f4860] dark:text-white/78">{request.end_location}</p>
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
                                onClick={() => navigate('/ride-requests')}
                                className="inline-flex items-center gap-2 rounded-lg border border-[#7e246c]/20 bg-white px-5 py-3 font-medium text-[#7e246c] transition-colors hover:bg-[#fbf3fa] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                            >
                                Back to Requests
                            </button>
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-[#8a7286] dark:text-white/45">From</div>
                                        <div className="text-2xl font-bold text-[#2b1128] dark:text-white">{request.start_location}</div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-[#9e889a] dark:text-white/40" />
                                    <div>
                                        <div className="text-sm text-[#8a7286] dark:text-white/45">To</div>
                                        <div className="text-2xl font-bold text-[#2b1128] dark:text-white">{request.end_location}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-[#7e246c]/10 bg-[#fbf4fa] p-4 dark:border-white/10 dark:bg-white/6">
                                    <div className="mb-1 flex items-center gap-2 text-sm text-[#8a7286] dark:text-white/45">
                                        <Clock className="h-4 w-4" />
                                        Departure
                                    </div>
                                    <div className="font-semibold text-[#2b1128] dark:text-white">
                                        {request.formatted_departure_time || request.departure_time}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-[#7e246c]/10 bg-[#fbf4fa] p-4 dark:border-white/10 dark:bg-white/6">
                                    <div className="mb-1 flex items-center gap-2 text-sm text-[#8a7286] dark:text-white/45">
                                        <Users className="h-4 w-4" />
                                        Seats Needed
                                    </div>
                                    <div className="font-semibold text-[#2b1128] dark:text-white">{request.required_seats}</div>
                                </div>
                                <div className="rounded-2xl border border-[#7e246c]/10 bg-[#fbf4fa] p-4 dark:border-white/10 dark:bg-white/6">
                                    <div className="mb-1 flex items-center gap-2 text-sm text-[#8a7286] dark:text-white/45">
                                        <User className="h-4 w-4" />
                                        Driver Preference
                                    </div>
                                    <div className="font-semibold text-[#2b1128] capitalize dark:text-white">{request.preferred_driver_gender}</div>
                                </div>
                                <div className="rounded-2xl border border-[#7e246c]/10 bg-[#fbf4fa] p-4 dark:border-white/10 dark:bg-white/6">
                                    <div className="mb-1 flex items-center gap-2 text-sm text-[#8a7286] dark:text-white/45">
                                        <MapPin className="h-4 w-4" />
                                        Budget
                                    </div>
                                    <div className="font-semibold text-[#2b1128] dark:text-white">
                                        {request.budget_per_seat
                                            ? `${request.currency || 'PKR'} ${Math.round(request.budget_per_seat).toLocaleString()}`
                                            : 'Flexible'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                        <div className="space-y-6">
                            <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
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
                            <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                                <h2 className="mb-4 text-xl font-semibold text-[#7e246c] dark:text-white">Requester</h2>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-[#8a7286] dark:text-white/45">Name</div>
                                        <div className="font-semibold text-[#2b1128] dark:text-white">{request.name || request.user.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-[#8a7286] dark:text-white/45">Schedule</div>
                                        <div className="font-semibold text-[#2b1128] capitalize dark:text-white">
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
                                        <div className="rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] p-6 text-center dark:border-white/10 dark:bg-white/6">
                                            <p className="mb-4 text-sm font-medium text-[#6b5368] dark:text-white/70">
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
                                                    className="w-full px-4 py-2 text-[#7d6678] transition-colors hover:text-[#2b1128] dark:text-white/55 dark:hover:text-white"
                                                >
                                                    Create Account
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {request.description ? (
                                <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                                    <h2 className="mb-4 text-xl font-semibold text-[#7e246c] dark:text-white">Notes</h2>
                                    <p className="whitespace-pre-wrap text-[#6f556c] dark:text-white/65">{request.description}</p>
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
