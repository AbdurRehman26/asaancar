import { CheckCircle, ChevronDown, MapPin, Shield, Car } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import { useAuth } from '@/components/AuthContext';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import UniversalCarFilter from '../components/universal-car-filter';

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

// FAQ Accordion Component
const FAQItem = ({
    question,
    answer,
    isOpen,
    onClick
}: {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}) => (
    <div className="border-b border-neutral-200 dark:border-neutral-800">
        <button
            className="flex w-full items-center justify-between py-4 text-left"
            onClick={onClick}
        >
            <span className="font-medium">{question}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`overflow-hidden transition-all ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
            <p className="pb-4 text-sm text-neutral-600 dark:text-neutral-400">{answer}</p>
        </div>
    </div>
);

// Car interface
interface CarData {
    id: number;
    name: string;
    brand: string;
    model: string;
    year: number;
    description: string;
    image?: string;
    images?: string[];
    price?: {
        perDay?: {
            withoutDriver: number;
            withDriver: number;
        };
        perHour?: {
            withoutDriver: number;
            withDriver: number;
        };
        perMinute?: {
            withoutDriver: number;
            withDriver: number;
        };
        currency: string;
    };
    withoutDriver?: number;
    withDriver?: number;
    fuel?: number;
    overtime?: number;
    currency?: string;
    features?: string[];
    specifications?: {
        seats: number;
        fuelType: string;
        transmission: string;
        mileage: string;
        color: string;
        engine: string;
        type: string;
    };
    store?: {
        id: number;
        name: string;
        address: string;
        phone: string;
        email?: string;
        rating: number;
        reviews: number;
        description: string;
        logo_url?: string;
    };
    available?: boolean;
    offer?: {
        id?: number;
        discount?: number;
        currency?: string;
        start_date?: string;
        end_date?: string;
        is_active?: boolean;
    } | null;
    created_at: string;
    updated_at: string;
}

// Car Card Component
const CarCard = ({ 
    car 
}: { 
    car: CarData; 
}) => {
    // Get the primary image (first image from images array or fallback to image field)
    const primaryImage = car.images && car.images.length > 0 ? car.images[0] : car.image;
    
    // Get pricing with fallbacks
    const dailyPrice = car.price?.perDay?.withoutDriver || car.withoutDriver || 150;
    const hourlyPrice = car.price?.perHour?.withoutDriver || Math.round((dailyPrice / 24) * 10) / 10;
    const minutePrice = car.price?.perMinute?.withoutDriver || Math.round((dailyPrice / 24 / 60) * 100) / 100;
    const currency = car.price?.currency || car.currency || 'PKR';
    
    return (
        <div className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-gray-800/80">
            <div className="mb-4 h-48 overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex h-full items-center justify-center">
                    {primaryImage ? (
                        <img 
                            src={primaryImage} 
                            alt={car.name} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                // Fallback to emoji if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.parentElement?.querySelector('.fallback-emoji');
                                if (fallback) {
                                    fallback.classList.remove('hidden');
                                }
                            }}
                        />
                    ) : null}
                    <div className={`text-6xl ${primaryImage ? 'hidden fallback-emoji' : ''}`}>🚗</div>
                </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{car.name}</h3>
            <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">{car.brand} {car.model} ({car.year})</p>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">{car.description}</p>
            <div className="space-y-2">
                <div className="text-sm">
                    <span className="font-medium text-[#7e246c]">from {dailyPrice} {currency}</span>
                    <span className="text-neutral-500"> /day</span>
                </div>
                <div className="text-sm">
                    <span className="font-medium text-[#7e246c]">{hourlyPrice} {currency}</span>
                    <span className="text-neutral-500"> /hour</span>
                </div>
                <div className="text-sm">
                    <span className="font-medium text-[#7e246c]">{minutePrice} {currency}</span>
                    <span className="text-neutral-500"> /minute</span>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-neutral-500">
                    {car.specifications?.seats || 5} seats • {car.specifications?.transmission || 'Automatic'} • {car.specifications?.fuelType || 'Gasoline'}
                </div>
                <button 
                    onClick={() => window.location.href = `/car-detail/${car.id}`}
                    className="rounded-lg bg-[#7e246c] px-4 py-2 text-sm font-medium text-white hover:bg-[#6a1f5c] transition-colors"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

// Pricing Card Component
const PricingCard = ({ 
    title, 
    subtitle, 
    description, 
    price, 
    unit, 
    features, 
    popular = false 
}: { 
    title: string; 
    subtitle: string; 
    description: string; 
    price: string; 
    unit: string; 
    features: string[]; 
    popular?: boolean; 
}) => (
    <div className={`relative rounded-xl border p-6 transition-all hover:shadow-lg ${
        popular 
            ? 'border-[#7e246c] bg-gradient-to-br from-[#7e246c]/5 to-[#7e246c]/10 dark:from-[#7e246c]/20 dark:to-[#7e246c]/10' 
            : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-gray-800/80'
    }`}>
        {popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#7e246c] px-4 py-1 text-xs font-medium text-white">
                Most Popular
            </div>
        )}
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
        </div>
        <div className="mb-4">
            <div className="text-2xl font-bold text-[#7e246c]">
                {price}
                <span className="text-sm font-normal text-neutral-500">/{unit}</span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        </div>
        <ul className="space-y-2">
            {features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <CheckCircle className="mr-2 h-4 w-4 text-[#7e246c]" />
                    {feature}
                </li>
            ))}
        </ul>
    </div>
);

// Step Card Component
const StepCard = ({ 
    number, 
    title, 
    description, 
    icon: Icon 
}: { 
    number: string; 
    title: string; 
    description: string; 
    icon: React.ElementType; 
}) => (
    <div className="text-center">
        <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7e246c]/10 text-[#7e246c]">
                <Icon className="h-8 w-8" />
            </div>
        </div>
        <div className="mb-2 text-sm font-medium text-[#7e246c]">{number}</div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
);

export default function Welcome() {
    const { user } = useAuth();
    useRevealOnScroll();
    const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
    const [latestCars, setLatestCars] = useState<CarData[]>([]);
    const [carsLoading, setCarsLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch latest cars
    useEffect(() => {
        const fetchLatestCars = async () => {
            try {
                console.log('Fetching latest cars...');
                const response = await fetch('/api/customer/cars?per_page=6&page=1');
                const data = await response.json();
                console.log('Cars API response:', data);
                setLatestCars(data.data || []);
                console.log('Set latest cars:', data.data || []);
            } catch (error) {
                console.error('Error fetching latest cars:', error);
                setLatestCars([]);
            } finally {
                setCarsLoading(false);
            }
        };

        fetchLatestCars();
    }, []);

    // Debug effect for car rendering
    useEffect(() => {
        console.log('Cars state updated - loading:', carsLoading, 'cars count:', latestCars.length);
        if (latestCars.length > 0) {
            console.log('First car data:', latestCars[0]);
        }
    }, [carsLoading, latestCars]);

    // Additional debug effect to track when cars disappear
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('Current cars state - loading:', carsLoading, 'count:', latestCars.length);
        }, 2000);
        
        return () => clearInterval(interval);
    }, [carsLoading, latestCars]);

    const pricingTiers = [
        {
            title: "Minute Rate",
            subtitle: "Feeling spontaneous?",
            description: "Choose this for quick drives up to 2 hours.",
            price: "from 0,17 €",
            unit: "minute",
            features: ["includes FREE 200 km", "Perfect for short trips", "No minimum time"]
        },
        {
            title: "Hourly Rate",
            subtitle: "Got plans?",
            description: "Choose this for your day trips and simply pay per kilometre.",
            price: "from 6,99 €",
            unit: "hour",
            features: ["+ 0,19 €/km", "unlimited kilometres", "Flexible hourly pricing"],
            popular: true
        },
        {
            title: "Daily Rate",
            subtitle: "Escapade time?",
            description: "Choose this for multiday drives and simply pay per kilometre.",
            price: "from 30,00 €",
            unit: "day",
            features: ["includes FREE 60 km", "Best for longer trips", "24-hour rental period"]
        }
    ];

    const steps = [
        {
            number: "1",
            title: "Find a rental car",
            description: "Say goodbye to the chore of visiting car rental stations! Our rental cars are available 24/7. Reserve your car via our app, whenever you need it.",
            icon: Car
        },
        {
            number: "2",
            title: "Unlock the car",
            description: "Once you're at the car you want to rent, unlock it with a push of a button. Choose your preferred rate and start your trip!",
            icon: Shield
        },
        {
            number: "3",
            title: "Drop off anywhere",
            description: "Simply end your trip anywhere in the service area — no annoying drop off procedures, no refueling required!",
            icon: MapPin
        }
    ];

    const faqItems = [
        {
            question: 'How do I book a car?',
            answer: 'Simply browse our selection of vehicles, choose your preferred dates, and complete the booking process with secure payment.',
        },
        {
            question: 'What documents do I need?',
            answer: "You'll need a valid driver's license, proof of insurance, and a credit card for the security deposit.",
        },
        {
            question: 'Can I cancel my booking?',
            answer: 'Yes, you can cancel your booking up to 24 hours before pickup with a full refund.',
        },
        {
            question: 'Do you offer insurance?',
            answer: 'Yes, we offer comprehensive insurance options to ensure your peace of mind during your rental.',
        },
    ];

    return (
        <>
            <title>Welcome - AsaanCar</title>

            {/* Navbar */}
            <Navbar auth={{ user }} />

            <main>
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                                Car rental from <span className="text-[#7e246c]">30,00 €/day</span>
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Car rental has never been easier. We don't do car rental stations, paperwork, or checking-in times. 
                                When you rent a car with AsaanCar, you won't wait in queues.
                            </p>
                        </div>
                        
                        {/* Search Filter - Full Screen */}
                        <div className="mt-10 w-full max-w-none">
                            <UniversalCarFilter
                                onSearch={(filters) => {
                                    const params = new URLSearchParams();
                                    Object.entries(filters).forEach(([key, value]) => {
                                        if (value) params.set(key, value);
                                    });
                                    navigate(`/cars?${params.toString()}`);
                                }}
                                fullWidth={true}
                                className="w-full max-w-none"
                            />
                        </div>

                        {/* Auth Buttons */}
                        {!user && (
                            <div className="mt-8 flex items-center justify-center gap-x-6">
                                <a
                                    href="/signup"
                                    className="rounded-lg bg-[#7e246c] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6a1f5c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
                                >
                                    Join for free
                                </a>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-[#7e246c] dark:text-white dark:hover:text-[#7e246c]"
                                >
                                    Log in <span aria-hidden="true">→</span>
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="bg-white py-24 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Rent a car with just an app
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                With our transparent pricing, you can rent a car from just a few minutes up to 30 days. 
                                Simply rent a car that's parked near you, and drop it off anywhere in the city when you are done.
                            </p>
                        </div>
                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                                {steps.map((step) => (
                                    <StepCard
                                        key={step.number}
                                        number={step.number}
                                        title={step.title}
                                        description={step.description}
                                        icon={step.icon}
                                    />
                                ))}
                            </dl>
                        </div>
                    </div>
                </section>

                {/* Car Showcase Section */}
                <section className="bg-neutral-50 py-24 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Latest cars available
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Choose from our selection of iconic and premium cars. From boardroom to bar, there's a car for every occasion.
                            </p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                            {carsLoading ? (
                                // Loading skeleton
                                Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="animate-pulse">
                                        <div className="h-48 rounded-lg bg-gray-200 dark:bg-gray-700 mb-4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                ))
                            ) : latestCars.length > 0 ? (
                                latestCars.map((car, index) => (
                                    <CarCard key={car.id || index} car={car} />
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-12">
                                    <div className="text-6xl mb-4">🚗</div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No cars available</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">Check back later for new additions to our fleet.</p>
                                </div>
                            )}
                        </div>
                        {latestCars.length > 0 && (
                            <div className="mt-12 text-center">
                                <button
                                    onClick={() => navigate('/cars')}
                                    className="rounded-lg bg-[#7e246c] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6a1f5c] transition-colors"
                                >
                                    View All Cars
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="bg-white py-24 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Fuss-free pricing
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Transparent pricing. Fuel, parking, maintenance – it's on us! Our rates are all-inclusive and flexible to your needs.
                            </p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                            {pricingTiers.map((tier, index) => (
                                <PricingCard
                                    key={index}
                                    title={tier.title}
                                    subtitle={tier.subtitle}
                                    description={tier.description}
                                    price={tier.price}
                                    unit={tier.unit}
                                    features={tier.features}
                                    popular={tier.popular}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="bg-neutral-50 py-24 dark:bg-gray-800">
                    <div className="mx-auto max-w-3xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Questions?
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Looking for more information? We cover your most frequently asked questions.
                            </p>
                        </div>
                        <div className="mx-auto mt-16 max-w-4xl">
                            {faqItems.map((item, index) => (
                                <FAQItem
                                    key={index}
                                    question={item.question}
                                    answer={item.answer}
                                    isOpen={activeAccordion === index}
                                    onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <Footer />
            </main>
        </>
    );
}
