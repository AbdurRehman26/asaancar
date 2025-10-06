import { ChevronDown, Shield, Star, Clock, Award } from 'lucide-react';
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

// Car Category Card Component
const CarCategoryCard = ({
    title,
    subtitle,
    image,
    onClick
}: {
    title: string;
    subtitle: string;
    image: string;
    onClick: () => void;
}) => (
    <div
        onClick={onClick}
        className="group cursor-pointer rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg hover:border-[#7e246c] dark:border-neutral-800 dark:bg-gray-800/80"
    >
        <div className="mb-4 h-32 overflow-hidden rounded-lg relative">
            <div className="flex h-full items-center justify-center">
                {image.startsWith('/') ? (
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-contain p-2"
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
                <div className={`text-4xl ${image.startsWith('/') ? 'hidden fallback-emoji' : ''}`}>
                    {image}
                </div>
            </div>
            {/* Category name overlay on image */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white font-bold text-lg text-center px-2">
                    {title}
                </h3>
            </div>
        </div>
        <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
        </div>
    </div>
);

// Car Brand Card Component
const CarBrandCard = ({
    title,
    subtitle,
    image,
    onClick
}: {
    title: string;
    subtitle: string;
    image: string;
    onClick: () => void;
}) => (
    <div
        onClick={onClick}
        className="group cursor-pointer rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg hover:border-[#7e246c] dark:border-neutral-800 dark:bg-gray-800/80"
    >
        <div className="mb-4 h-32 overflow-hidden rounded-lg relative">
            <div className="flex h-full items-center justify-center">
                {image.startsWith('/') ? (
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-contain p-2"
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
                <div className={`text-4xl ${image.startsWith('/') ? 'hidden fallback-emoji' : ''}`}>
                    {image}
                </div>
            </div>
            {/* Brand name overlay on image */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white font-bold text-lg text-center px-2">
                    {title}
                </h3>
            </div>
        </div>
        <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
        </div>
    </div>
);

// Feature Card Component
const FeatureCard = ({
    icon: Icon,
    title,
    description
}: {
    icon: React.ElementType;
    title: string;
    description: string;
}) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c] text-white">
                <Icon className="h-6 w-6" />
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        </div>
    </div>
);

// Testimonial Card Component
const TestimonialCard = ({
    name,
    rating,
    comment
}: {
    name: string;
    rating: number;
    comment: string;
}) => (
    <div className="bg-white dark:bg-gray-800/80 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
            ))}
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">{comment}</p>
        <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
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

// Car Type interface
interface CarType {
    id: number;
    name: string;
    image?: string;
    created_at: string;
    updated_at: string;
}

interface CarBrand {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

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

    // Get brand image path
    const getBrandImagePath = (brandName: string) => {
        return `/images/car-brands/${brandName.toLowerCase()}.png`;
    };

    // Handle image error - fallback to brand image or emoji
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        const brandName = car.brand;

        if (brandName) {
            const brandImagePath = getBrandImagePath(brandName);
            // Only try brand image if we haven't already tried it
            if (target.src !== brandImagePath) {
                target.src = brandImagePath;
                return;
            }
        }

        // Final fallback to emoji
        target.style.display = 'none';
        const fallback = target.parentElement?.querySelector('.fallback-emoji');
        if (fallback) {
            fallback.classList.remove('hidden');
        }
    };

    return (
        <div className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-gray-800/80">
            <div className="mb-4 h-48 overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex h-full items-center justify-center p-4">
                    {primaryImage ? (
                        <img
                            src={primaryImage}
                            alt={car.name}
                            className="h-full w-full object-contain"
                            onError={handleImageError}
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

export default function Welcome() {
    const { user } = useAuth();
    useRevealOnScroll();
    const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
    const [latestCars, setLatestCars] = useState<CarData[]>([]);
    const [carsLoading, setCarsLoading] = useState(true);
    const [carTypes, setCarTypes] = useState<CarType[]>([]);
    const [carTypesLoading, setCarTypesLoading] = useState(true);
    const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
    const [carBrandsLoading, setCarBrandsLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch latest cars
    useEffect(() => {
        const fetchLatestCars = async () => {
            try {
                const response = await fetch('/api/cars?per_page=6&page=1');
                const data = await response.json();
                setLatestCars(data.data || []);
            } catch (error) {
                console.error('Error fetching latest cars:', error);
                setLatestCars([]);
            } finally {
                setCarsLoading(false);
            }
        };

        fetchLatestCars();
    }, []);

    // Fetch car types
    useEffect(() => {
        const fetchCarTypes = async () => {
            try {
                const response = await fetch('/api/car-types');
                const data = await response.json();
                setCarTypes(data.data || []);
            } catch (error) {
                console.error('Error fetching car types:', error);
                setCarTypes([]);
            } finally {
                setCarTypesLoading(false);
            }
        };

        fetchCarTypes();
    }, []);

    // Fetch car brands
    useEffect(() => {
        const fetchCarBrands = async () => {
            try {
                const response = await fetch('/api/car-brands');
                const data = await response.json();
                setCarBrands(data.data || []);
            } catch (error) {
                console.error('Error fetching car brands:', error);
                setCarBrands([]);
            } finally {
                setCarBrandsLoading(false);
            }
        };

        fetchCarBrands();
    }, []);

    // Map car types to display data
    const getCarTypeDisplayData = (typeName: string) => {
        const typeMap: { [key: string]: { image: string; subtitle: string; category: string } } = {
            'budget': { image: '🚗', subtitle: 'Daihatsu Mira or similar', category: 'budget' },
            'standard': { image: '🚙', subtitle: 'Toyota Corolla or similar', category: 'standard' },
            'luxury': { image: '🏎️', subtitle: 'Mercedes Benz or similar', category: 'luxury' },
            'suv': { image: '🚐', subtitle: 'Land Cruiser or similar', category: 'suv' },
            'vans': { image: '🚌', subtitle: 'Toyota Coaster or similar', category: 'vans' },
            'sedan': { image: '🚙', subtitle: 'Sedan vehicles', category: 'sedan' },
            'hatchback': { image: '🚗', subtitle: 'Hatchback vehicles', category: 'hatchback' },
            'convertible': { image: '🏎️', subtitle: 'Convertible vehicles', category: 'convertible' },
            'coupe': { image: '🏎️', subtitle: 'Coupe vehicles', category: 'coupe' },
            'truck': { image: '🚛', subtitle: 'Truck vehicles', category: 'truck' }
        };

        return typeMap[typeName.toLowerCase()] || {
            image: '🚗',
            subtitle: `${typeName} vehicles`,
            category: typeName.toLowerCase()
        };
    };

    // Map car brands to display data
    const getCarBrandDisplayData = (brandName: string) => {
        const brandMap: { [key: string]: { image: string; subtitle: string; category: string } } = {
            'toyota': { image: '/images/car-brands/toyota.png', subtitle: 'Reliable & Efficient', category: 'toyota' },
            'honda': { image: '/images/car-brands/honda.png', subtitle: 'Performance & Style', category: 'honda' },
            'suzuki': { image: '/images/car-brands/suzuki.png', subtitle: 'Compact & Practical', category: 'suzuki' },
            'nissan': { image: '/images/car-brands/nissan.png', subtitle: 'Innovation & Comfort', category: 'nissan' },
            'daihatsu': { image: '/images/car-brands/daihatsu.png', subtitle: 'Small & Efficient', category: 'daihatsu' },
            'changan': { image: '/images/car-brands/changan.png', subtitle: 'Modern & Affordable', category: 'changan' },
            'kia': { image: '/images/car-brands/kia.png', subtitle: 'Design & Technology', category: 'kia' },
            'hyundai': { image: '/images/car-brands/hyundai.png', subtitle: 'Quality & Value', category: 'hyundai' },
            'chevrolet': { image: '/images/car-brands/chevrolet.png', subtitle: 'American Heritage', category: 'chevrolet' },
            'bmw': { image: '/images/car-brands/bmw.png', subtitle: 'Luxury & Performance', category: 'bmw' },
            'ford': { image: '/images/car-brands/ford.png', subtitle: 'Built Tough', category: 'ford' },
            'audi': { image: '/images/car-brands/audi.png', subtitle: 'Premium & Sophisticated', category: 'audi' }
        };

        return brandMap[brandName.toLowerCase()] || {
            image: '🚗',
            subtitle: `${brandName} vehicles`,
            category: brandName.toLowerCase()
        };
    };

    const features = [
        {
            icon: Shield,
            title: "No Hidden Charges",
            description: "Insurance is already included in the price. What you see online is exactly what you will be charged."
        },
        {
            icon: Award,
            title: "Flexible Pricing Packages",
            description: "No one size fits all. Our packages are optimized for your needs and goals."
        },
        {
            icon: Clock,
            title: "24 Hours Assistance",
            description: "We provide assistance 24 hours a day, seven days a week. You are never too far away for us."
        }
    ];

    const testimonials = [
        {
            name: "Ali Sangi",
            rating: 5,
            comment: "Booked 9 SUVs/cars from AsaanCar for two days during a wedding event. And I think hiring their services was the best decision we made."
        },
        {
            name: "Ramsha Rasool",
            rating: 5,
            comment: "Great service! Extremely punctual, neat, clean and maintained car, extremely professional and well mannered staff."
        },
        {
            name: "Mian Amin",
            rating: 5,
            comment: "Excellent service provided by AsaanCar. Cars were almost new and drivers were professional in driving skills."
        }
    ];

    const faqItems = [
        {
            question: 'Who can rent a car?',
            answer: 'The car with driver can be rented by anyone above the age of 18. However, in case of self-drive and driving license needs to be at least 1 year old.',
        },
        {
            question: 'Can I rent a car with and without driver both?',
            answer: 'Yes, you may book any car available on our website, with driver. However, the self-drive option is currently limited to specific vehicles.',
        },
        {
            question: 'How can I pay the rent?',
            answer: 'We accept cash and bank transfers at the moment.',
        },
        {
            question: 'Do I need to pay any security deposit?',
            answer: 'Yes, in case of the self-drive option, a security deposit is required.',
        },
        {
            question: 'What happens if an accident occurs?',
            answer: 'In case of Self-Driver option, we cover the small damages from your security deposit. ',
        },
        {
            question: 'What is your fuel policy?',
            answer: 'Customers are responsible for paying for their own fuel consumption. Each car is provided with a level of fuel and customers have to return the vehicle with the same level of fuel.',
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
                    <div className="mx-auto max-w-7xl px-6 py-18 sm:py-24 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-4xl font-bold mt-10 tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                                Search A Car
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Find the perfect car for your journey with AsaanCar - Pakistan's trusted car rental service.
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

                {/* Car Categories Section */}
                <section className="bg-white py-16 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center flex flex-col items-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                What type of car are you looking for?
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Browse our diverse collection of car types to find the perfect match for your needs
                            </p>
                        </div>
                        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
                            {carTypesLoading ? (
                                // Loading skeleton for car types
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="animate-pulse">
                                        <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700 mb-4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    </div>
                                ))
                            ) : carTypes.length > 0 ? (
                                carTypes.map((type) => {
                                    const displayData = getCarTypeDisplayData(type.name);
                                    return (
                                        <CarCategoryCard
                                            key={type.id}
                                            title={type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                                            subtitle={displayData.subtitle}
                                            image={type.image || displayData.image}
                                            onClick={() => navigate(`/cars?type_id=${type.id}`)}
                                        />
                                    );
                                })
                            ) : (
                                <div className="col-span-4 text-center py-12">
                                    <div className="text-6xl mb-4">🚗</div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No car types available</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">Check back later for car type updates.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Car Brands Section */}
                <section className="bg-gray-50 py-16 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center flex flex-col items-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Popular Car Brands
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Choose from our wide selection of trusted car brands
                            </p>
                        </div>
                        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
                            {carBrandsLoading ? (
                                // Loading skeleton for car brands
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="animate-pulse">
                                        <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700 mb-4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    </div>
                                ))
                            ) : carBrands.length > 0 ? (
                                carBrands.map((brand) => {
                                    const displayData = getCarBrandDisplayData(brand.name);
                                    return (
                                        <CarBrandCard
                                            key={brand.id}
                                            title={brand.name}
                                            subtitle={displayData.subtitle}
                                            image={displayData.image}
                                            onClick={() => navigate(`/cars?brand_id=${brand.id}`)}
                                        />
                                    );
                                })
                            ) : (
                                <div className="col-span-4 text-center py-12">
                                    <div className="text-6xl mb-4">🚗</div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No car brands available</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">Check back later for car brand updates.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="bg-neutral-50 py-16 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Why Rent A Car With AsaanCar?
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                AsaanCar is widely regarded as one of the best Car Rental Service Providers serving not only Karachi but other major cities of Pakistan as well.
                            </p>
                        </div>
                        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                {features.map((feature) => (
                                    <FeatureCard
                                        key={feature.title}
                                        icon={feature.icon}
                                        title={feature.title}
                                        description={feature.description}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Latest Cars Section */}
                <section className="bg-white py-16 dark:bg-gray-900">
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

                {/* Testimonials Section */}
                <section className="bg-neutral-50 py-16 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                What Our Customers Say
                            </h2>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                            {testimonials.map((testimonial) => (
                                <TestimonialCard
                                    key={testimonial.name}
                                    name={testimonial.name}
                                    rating={testimonial.rating}
                                    comment={testimonial.comment}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="bg-white py-16 dark:bg-gray-900">
                    <div className="mx-auto max-w-3xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Frequently Asked Questions
                            </h2>
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
