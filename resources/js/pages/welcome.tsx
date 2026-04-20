import { useAuth } from '@/components/AuthContext';
import { DashboardEmptyState, DashboardHero, DashboardPanel, DashboardPrimaryLink, DashboardSecondaryButton } from '@/components/dashboard-shell';
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
                <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] pt-24 pb-10 sm:pb-16 dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 xl:px-8">
                        <DashboardHero
                            eyebrow="AsaanCar rides"
                            title="Find a Ride"
                            description="Find reliable rides for daily commutes and one-off travel with the same calm, organized experience we’ve brought into the dashboard."
                            actions={
                                <>
                                    <DashboardPrimaryLink to="/pick-and-drop">Browse all rides</DashboardPrimaryLink>
                                    <DashboardSecondaryButton onClick={() => navigate('/ride-requests')}>View ride requests</DashboardSecondaryButton>
                                </>
                            }
                        />

                        <DashboardPanel
                            title="Search routes"
                            description="Choose your start and end locations to jump straight into available rides."
                            className="overflow-visible"
                            contentClassName="space-y-6"
                        >
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

                            <div className="flex flex-col items-center justify-between gap-4 rounded-[1.5rem] border border-[#7e246c]/10 bg-[#fcf7fb] px-5 py-5 sm:flex-row dark:border-white/10 dark:bg-[#18141f] dark:[background-image:linear-gradient(90deg,_rgba(255,255,255,0.045)_0%,_rgba(255,255,255,0.055)_58%,_rgba(255,255,255,0.09)_100%)]">
                                <div>
                                    <p className="text-sm font-semibold text-[#2b1128] dark:text-white">Take AsaanCar with you</p>
                                    <p className="mt-1 text-sm text-[#7d6678] dark:text-white/65">
                                        Search routes, connect with drivers, and manage your rides on the go with the AsaanCar Android app.
                                    </p>
                                </div>
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.asaancar.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
                                >
                                    <img src="/google-play-icon.png" alt="Get it on Google Play" className="h-16 w-auto sm:h-20 md:h-24" />
                                </a>
                            </div>

                            {!user ? (
                                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <a
                                        href="/signup"
                                        className="inline-flex items-center justify-center rounded-xl bg-[#7e246c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#67205a]"
                                    >
                                        Create your account
                                    </a>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="inline-flex items-center justify-center rounded-xl border border-[#7e246c]/20 bg-white px-5 py-3 text-sm font-semibold text-[#7e246c] transition hover:border-[#7e246c]/35 hover:bg-[#fbf3fa] dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    >
                                        Login
                                    </button>
                                </div>
                            ) : null}
                        </DashboardPanel>

                        <DashboardPanel
                            title="Featured rides"
                            description="A quick look at the latest rides available right now."
                            actions={<DashboardPrimaryLink to="/pick-and-drop">View all rides</DashboardPrimaryLink>}
                        >
                            {pickAndDropLoading ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="h-72 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/95 shadow-[0_20px_45px_-32px_rgba(126,36,108,0.32)] dark:border-white/10 dark:bg-[#191520]"
                                        ></div>
                                    ))}
                                </div>
                            ) : pickAndDropServices.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                        {pickAndDropServices.map((service) => (
                                            <PickAndDropCard
                                                key={service.id}
                                                service={service}
                                                variant="dashboard"
                                                onClick={() => navigate(`/pick-and-drop/${service.id}`)}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                                        <DashboardPrimaryLink to="/pick-and-drop">View all rides</DashboardPrimaryLink>
                                        <DashboardSecondaryButton onClick={() => navigate('/ride-requests')}>
                                            View ride requests
                                        </DashboardSecondaryButton>
                                    </div>
                                </>
                            ) : (
                                <DashboardEmptyState
                                    icon={<MapPin className="h-6 w-6" />}
                                    title="No rides available yet"
                                    description="There aren’t any rides to show at the moment, but you can still browse the listings page or check ride requests."
                                    action={
                                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                                            <DashboardPrimaryLink to="/pick-and-drop">Browse all rides</DashboardPrimaryLink>
                                            <DashboardSecondaryButton onClick={() => navigate('/ride-requests')}>
                                                Browse ride requests
                                            </DashboardSecondaryButton>
                                        </div>
                                    }
                                />
                            )}
                        </DashboardPanel>

                        <DashboardPanel
                            title="Why AsaanCar"
                            description="Built for dependable daily travel with the same focus on clarity, safety, and support."
                        >
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {whyAsaanCarCards.map((card) => {
                                    const Icon = card.icon;

                                    return (
                                        <div
                                            key={card.title}
                                            className="rounded-[1.5rem] border border-white/70 bg-white/95 p-6 shadow-[0_16px_38px_-30px_rgba(126,36,108,0.4)] ring-1 ring-[#7e246c]/6 dark:border-white/10 dark:bg-[#1b1724] dark:ring-white/5"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7e246c]/10 text-[#7e246c] dark:bg-white/8 dark:text-white">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <h3 className="mt-4 text-lg font-semibold text-[#2b1128] dark:text-white">{card.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-[#7d6678] dark:text-white/65">{card.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </DashboardPanel>
                    </div>
                </section>

                {/* Footer */}
                <Footer />
            </main>
        </>
    );
}
