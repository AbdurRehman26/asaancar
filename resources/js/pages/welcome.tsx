import { MapPin, ThumbsUp, CheckCircle, Headphones, Network, ShieldCheck, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import { useAuth } from '@/components/AuthContext';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import PickAndDropFilter from '../components/pick-and-drop-filter';
import PickAndDropCard, { PickAndDropService } from '@/components/PickAndDropCard';
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
                            <h1 className="text-4xl pt-16 font-bold mt-18 xs:pt-14 tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                                Pick and Drop
                            </h1>
                            <p className="mt-4 sm:mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Find the perfect ride for your journey with AsaanCar - <span className="font-semibold text-[#7e246c] dark:text-[#9d4edd]">Pakistan's trusted pick & drop service</span>.
                            </p>

                            {/* Karachi Availability Notice */}
                            <div className="mt-4 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-700/20 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-300/20">
                                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Currently available in Karachi only. We'll be expanding to other cities soon!
                            </div>

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
                                        className="h-32 sm:h-40 w-auto sm:h-48"
                                    />
                                </a>
                            </div>
                        </div>

                        {/* Search Filter - Full Screen */}
                        <div className="mt-8 sm:mt-10 w-full max-w-none">
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
                            <div className="mt-6 pb-4 sm:mt-8 flex items-center justify-center gap-x-6">
                                <a
                                    href="/signup"
                                    className="rounded-lg bg-[#7e246c] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6a1f5c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
                                >
                                    Sign Up
                                </a>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-[#7e246c] dark:text-white dark:hover:text-[#7e246c]"
                                >
                                    Login <span aria-hidden="true">→</span>
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Pick & Drop Services Section */}
                <section className="bg-gray-50 py-10 sm:py-16 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center flex flex-col items-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Pick & Drop Services
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Share rides or find passengers for your journey. Multiple stops available.
                            </p>
                        </div>
                        {pickAndDropLoading ? (
                            <div className="mx-auto mt-10 sm:mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="animate-pulse bg-white dark:bg-gray-700 rounded-lg p-6 h-64"></div>
                                ))}
                            </div>
                        ) : pickAndDropServices.length > 0 ? (
                            <>
                                <div className="mx-auto mt-10 sm:mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                                    {pickAndDropServices.map((service) => (
                                        <PickAndDropCard
                                            key={service.id}
                                            service={service}
                                            onClick={() => navigate(`/pick-and-drop/${service.id}`)}
                                        />
                                    ))}
                                </div>
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => navigate('/pick-and-drop')}
                                        className="rounded-lg bg-[#7e246c] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6a1f5c] transition-colors"
                                    >
                                        View All Pick & Drop Services
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="mt-10 sm:mt-12 text-center py-12 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">No pick and drop services available at the moment.</p>
                                <button
                                    onClick={() => navigate('/pick-and-drop')}
                                    className="mt-4 rounded-lg bg-[#7e246c] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6a1f5c] transition-colors"
                                >
                                    Browse All Services
                                </button>
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
                            <p className="mt-4 sm:mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Discover a wide range of services offered for different travel and business needs.
                            </p>
                        </div>
                        <div className="mx-auto mt-10 sm:mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                            {whyAsaanCarCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div
                                        key={card.title}
                                        className={`rounded-2xl p-6 sm:p-8 ${
                                            card.variant === 'brand'
                                                ? 'bg-[#7e246c] dark:bg-[#7e246c]'
                                                : 'bg-slate-800 dark:bg-slate-900'
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
