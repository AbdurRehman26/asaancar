import { useAuth } from '@/components/AuthContext';
import PickAndDropCard, { PickAndDropService } from '@/components/PickAndDropCard';
import { CheckCircle, Headphones, MapPin, Network, ShieldCheck, ThumbsUp, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/navbar';
import PickAndDropFilter from '../components/pick-and-drop-filter';
// Animation utility for reveal on scroll
const useRevealOnScroll = () => {
    useEffect(() => {
        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-reveal');
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.1,
        });

        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
};

export default function Welcome() {
    const { user } = useAuth();
    useRevealOnScroll();
    const [pickAndDropServices, setPickAndDropServices] = useState<PickAndDropService[]>([]);
    const [pickAndDropLoading, setPickAndDropLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch pick and drop services
    useEffect(() => {
        const fetchPickAndDrop = async () => {
            try {
                const response = await fetch('/api/pick-and-drop?per_page=6');
                if (response.ok) {
                    const result = await response.json();
                    // Handle paginated response - Laravel returns { data: [...], links: {...}, meta: {...} }
                    const services = result.data || (Array.isArray(result) ? result : []);
                    setPickAndDropServices((services as PickAndDropService[]).slice(0, 6));
                } else {
                    const errorText = await response.text();
                    console.error('Failed to fetch pick and drop services:', response.status, errorText);
                }
            } catch (error) {
                console.error('Error fetching pick and drop services:', error);
            } finally {
                setPickAndDropLoading(false);
            }
        };

        fetchPickAndDrop();
    }, []);

    const whyAsaanCarCards = [
        {
            icon: ThumbsUp,
            title: 'Reliability',
            description: 'Timely pick-up and drop-off at your doorstep or nearest location with backup services to ensure bookings are completed.',
            variant: 'brand' as const,
        },
        {
            icon: CheckCircle,
            title: 'Safety & Security',
            description: 'Regular captain verification and vehicle inspection as well as rapid response to in-ride emergencies.',
            variant: 'dark' as const,
        },
        {
            icon: Headphones,
            title: 'Customer Support',
            description: 'Dedicated account managers and round-the-clock customer support provided.',
            variant: 'brand' as const,
        },
        {
            icon: Network,
            title: 'Technology Stack',
            description: 'Client dashboard with complete transparency and trackability of rides.',
            variant: 'dark' as const,
        },
        {
            icon: ShieldCheck,
            title: 'In-ride Insurance',
            description: 'Travel with peace of mind with optional in-ride insurance packages.',
            variant: 'brand' as const,
        },
        {
            icon: Wallet,
            title: 'Affordability',
            description: 'Competitive rates with top-notch service for every client.',
            variant: 'dark' as const,
        },
    ];

    return (
        <>
            <title>Welcome - AsaanCar</title>

            {/* Navbar */}
            <Navbar auth={{ user }} />

            <main>
                {/* Hero Section with Search */}
                <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 sm:py-12 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="xs:pt-14 mt-18 pt-16 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                                Find a Ride
                            </h1>
                            <p className="mt-4 text-lg leading-8 text-gray-600 sm:mt-6 dark:text-gray-300">
                                Find the perfect ride for your journey with AsaanCar -{' '}
                                <span className="font-semibold text-[#7e246c] dark:text-[#9d4edd]">Pakistan's trusted ride-sharing service</span>.
                            </p>
                            {/* Play Store Download Button */}
                            <div className="mt-6 flex items-center justify-center">
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.asaancar.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
                                >
                                    <img
                                        src="/google-play-download-android-app-logo.svg"
                                        alt="Get it on Google Play"
                                        className="h-32 w-auto sm:h-40 sm:h-48"
                                    />
                                </a>
                            </div>
                        </div>

                        {/* Search Filter - Full Screen */}
                        <div className="mt-8 w-full max-w-none sm:mt-10">
                            <PickAndDropFilter
                                onSearch={(filters) => {
                                    const params = new URLSearchParams();
                                    Object.entries(filters).forEach(([key, value]) => {
                                        if (value) {
                                            params.set(key, value.toString());
                                        }
                                    });
                                    navigate(`/pick-and-drop?${params.toString()}`);
                                }}
                                fullWidth={true}
                                className="w-full max-w-none"
                            />
                        </div>

                        {/* Auth Buttons */}
                        {!user && (
                            <div className="mt-6 flex items-center justify-center gap-x-6 pb-4 sm:mt-8">
                                <a
                                    href="/signup"
                                    className="rounded-lg bg-[#7e246c] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6a1f5c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
                                >
                                    Sign Up
                                </a>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-sm leading-6 font-semibold text-gray-900 hover:text-[#7e246c] dark:text-white dark:hover:text-[#7e246c]"
                                >
                                    Login <span aria-hidden="true">→</span>
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Find a Ride Section */}
                <section className="bg-gray-50 py-10 sm:py-16 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">Find a Ride</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Share rides or find passengers for your journey. Multiple stops available.
                            </p>
                        </div>
                        {pickAndDropLoading ? (
                            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="h-64 animate-pulse rounded-lg bg-white p-6 dark:bg-gray-700"></div>
                                ))}
                            </div>
                        ) : pickAndDropServices.length > 0 ? (
                            <>
                                <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                                    {pickAndDropServices.map((service) => (
                                        <PickAndDropCard
                                            key={service.id}
                                            service={service}
                                            onClick={() => navigate(`/pick-and-drop/${service.id}`)}
                                        />
                                    ))}
                                </div>
                                <div className="mt-8 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <button
                                            onClick={() => navigate('/pick-and-drop')}
                                            className="rounded-lg bg-[#7e246c] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6a1f5c]"
                                        >
                                            View All Rides
                                        </button>
                                        <button
                                            onClick={() => navigate('/ride-requests')}
                                            className="rounded-lg border border-[#7e246c] px-6 py-3 text-sm font-semibold text-[#7e246c] shadow-sm transition-colors hover:bg-[#7e246c] hover:text-white dark:border-[#d685c3] dark:text-[#d685c3] dark:hover:border-[#7e246c] dark:hover:bg-[#7e246c]"
                                        >
                                            View Ride Requests
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="mt-10 rounded-lg border border-gray-200 bg-white py-12 text-center sm:mt-12 dark:border-gray-600 dark:bg-gray-700">
                                <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <p className="text-gray-600 dark:text-gray-400">No rides available at the moment.</p>
                                <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <button
                                        onClick={() => navigate('/pick-and-drop')}
                                        className="rounded-lg bg-[#7e246c] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6a1f5c]"
                                    >
                                        Browse All Rides
                                    </button>
                                    <button
                                        onClick={() => navigate('/ride-requests')}
                                        className="rounded-lg border border-[#7e246c] px-6 py-3 text-sm font-semibold text-[#7e246c] shadow-sm transition-colors hover:bg-[#7e246c] hover:text-white dark:border-[#d685c3] dark:text-[#d685c3] dark:hover:border-[#7e246c] dark:hover:bg-[#7e246c]"
                                    >
                                        Browse Ride Requests
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Why AsaanCar? Section */}
                <section className="bg-white py-10 sm:py-16 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Why <span className="text-[#7e246c] dark:text-[#9d4edd]">AsaanCar?</span>
                            </h2>
                            <p className="mt-4 text-lg leading-8 text-gray-600 sm:mt-6 dark:text-gray-300">
                                Discover a wide range of services offered for different travel and business needs.
                            </p>
                        </div>
                        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                            {whyAsaanCarCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div
                                        key={card.title}
                                        className={`rounded-2xl p-6 sm:p-8 ${
                                            card.variant === 'brand' ? 'bg-[#7e246c] dark:bg-[#7e246c]' : 'bg-slate-800 dark:bg-slate-900'
                                        }`}
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-white">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="mt-4 text-xl font-bold text-white">{card.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-white/90">{card.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <Footer />
            </main>
        </>
    );
}
