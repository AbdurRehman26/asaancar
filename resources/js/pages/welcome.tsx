import { ArrowRight, CheckCircle, ChevronDown, MessageSquare, Target, Users, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginModal from '@/pages/auth/login-modal';
import Navbar from '../components/navbar';
import { useAuth } from '@/components/AuthContext';

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

// Scroll progress indicator
const useScrollProgress = () => {
    const [progress, setProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            const currentProgress = (window.scrollY / totalScroll) * 100;
            setProgress(currentProgress);
            setShowScrollTop(window.scrollY > 500);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return { progress, showScrollTop };
};

// Stats counter animation
const useCounterAnimation = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.5 }
        );

        const element = countRef.current;
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;

        const steps = 60;
        const stepDuration = duration / steps;
        const increment = end / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            current += increment;
            step += 1;

            if (step === steps) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [end, duration, isVisible]);

    return { count, countRef };
};

// Smooth scroll utility
const smoothScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
    <div className="reveal flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-gray-800/80">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        </div>
    </div>
);

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

// Stats Card Component
const StatCard = ({ number, label, icon: Icon }: { number: number; label: string; icon: React.ElementType }) => {
    const { count, countRef } = useCounterAnimation(number);
    
    return (
        <div ref={countRef} className="reveal flex flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-gray-800/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                <Icon className="h-6 w-6" />
            </div>
            <div className="text-center">
                <div className="text-3xl font-bold text-[#7e246c] stat-number">{count.toLocaleString()}+</div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
            </div>
        </div>
    );
};

export default function Welcome() {
    const { user } = useAuth();
    useRevealOnScroll();
    const { progress, showScrollTop } = useScrollProgress();
    const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loginOpen, setLoginOpen] = useState(false);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        setEmailError('');
        // Handle subscription logic here
        alert('Thank you for subscribing!');
        setEmail('');
    };

    const navLinks = [
        { href: '#features', label: 'Features' },
        { href: '#how-it-works', label: 'How it Works' },
    ];

    const faqItems = [
        {
            question: 'How do I book a car?',
            answer: 'Simply browse our selection of vehicles, choose your preferred dates, and complete the booking process with secure payment.',
        },
        {
            question: 'What documents do I need?',
            answer: 'You\'ll need a valid driver\'s license, proof of insurance, and a credit card for the security deposit.',
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

            {/* Modals */}
            {!user && (
                <>
                    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Log in to your account</DialogTitle>
                            </DialogHeader>
                            <LoginModal canResetPassword={true} />
                        </DialogContent>
                    </Dialog>
                </>
            )}

            {/* Scroll Progress Bar */}
            <div 
                className="fixed top-0 left-0 h-1 w-full bg-[#7e246c]/20 z-50"
                style={{ transform: `scaleX(${progress / 100})` }}
            />

            {/* Scroll to Top Button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-4 right-4 rounded-full bg-[#7e246c] p-3 text-white shadow-lg transition-opacity ${
                    showScrollTop ? 'opacity-100' : 'opacity-0'
                }`}
                aria-label="Scroll to top"
            >
                <ArrowRight className="h-6 w-6" />
            </button>

            {/* Navbar */}
            <Navbar 
                auth={{ user }}
            />

            <main>
                {/* Hero section */}
                <div className="relative isolate pt-14 bg-neutral-50 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
                        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
                            <div className="flex">
                                <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-gray-600 ring-1 ring-[#7e246c]/20 hover:ring-[#7e246c]/30 dark:text-gray-300 dark:ring-[#7e246c]/30 dark:hover:ring-[#7e246c]/40">
                                    <span className="font-semibold text-[#7e246c]">What's new</span>
                                    <span className="h-4 w-px bg-[#7e246c]/20 dark:bg-[#7e246c]/30" aria-hidden="true" />
                                    <a href="#" className="flex items-center gap-x-1">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        See our latest updates
                                    </a>
                                </div>
                            </div>
                            <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                                Rent a car with ease
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Experience hassle-free car rentals with our intuitive platform. Find the perfect vehicle
                                for your needs, book with confidence, and hit the road in minutes.
                            </p>
                            {!user && (
                                <div className="mt-10 flex items-center gap-x-6">
                                    <a href="/signup" className="rounded-lg bg-[#7e246c] px-4 py-2 text-sm text-white border border-[#7e246c] transition-colors hover:bg-[#6a1f5c] hover:border-[#6a1f5c]">
                                        Register Now
                                    </a>
                                    <button onClick={() => setLoginOpen(true)} className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-[#7e246c] dark:hover:text-[#7e246c] transition">
                                        Log in <span aria-hidden="true">→</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
                            <div className="mx-auto w-[22.875rem] max-w-full rounded-lg bg-gradient-to-br from-[#7e246c]/10 to-[#7e246c]/5 p-8 ring-1 ring-[#7e246c]/20 dark:from-[#7e246c]/20 dark:to-[#7e246c]/10 dark:ring-[#7e246c]/30">
                                <div className="text-center">
                                    <div className="mb-4 text-6xl">🚗</div>
                                    <h3 className="text-xl font-semibold text-[#7e246c] mb-2">Find Your Perfect Ride</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Browse our selection of quality vehicles and book with confidence
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <section id="features" className="py-24 bg-neutral-50 dark:bg-gray-900 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12 text-center">
                            <h2 className="reveal mb-4 text-3xl font-bold text-gray-900 dark:text-white">Why Choose AsaanCar</h2>
                            <p className="reveal mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
                                Everything you need for a smooth car rental experience.
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <FeatureCard
                                icon={Target}
                                title="Easy Booking"
                                description="Book your desired car in just a few clicks with our simple booking process."
                            />
                            <FeatureCard
                                icon={Zap}
                                title="Fast Service"
                                description="Quick car delivery and pickup at your convenience."
                            />
                            <FeatureCard
                                icon={MessageSquare}
                                title="24/7 Support"
                                description="Our customer support team is always ready to help you."
                            />
                            <FeatureCard
                                icon={CheckCircle}
                                title="Quality Cars"
                                description="Well-maintained vehicles from trusted partners."
                            />
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="bg-neutral-50 py-24 dark:bg-gray-900 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12 text-center">
                            <h2 className="reveal mb-4 text-3xl font-bold text-gray-900 dark:text-white">How AsaanCar Works</h2>
                            <p className="reveal mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
                                Rent a car in three simple steps
                            </p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                {
                                    step: '01',
                                    title: 'Choose Your Car',
                                    description: 'Browse our selection and pick the perfect car for your needs.',
                                },
                                {
                                    step: '02',
                                    title: 'Book & Pay',
                                    description: 'Complete the booking process with secure payment.',
                                },
                                {
                                    step: '03',
                                    title: 'Enjoy Your Ride',
                                    description: 'Pick up your car and start your journey.',
                                },
                            ].map((item) => (
                                <div key={item.step} className="reveal text-center">
                                    <div className="mb-4 text-4xl font-bold text-[#7e246c]">{item.step}</div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-24 bg-neutral-50 dark:bg-gray-900 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                number={1000}
                                label="Happy Customers"
                                icon={Users}
                            />
                            <StatCard
                                number={500}
                                label="Cars Available"
                                icon={Target}
                            />
                            <StatCard
                                number={95}
                                label="Customer Satisfaction"
                                icon={CheckCircle}
                            />
                            <StatCard
                                number={24}
                                label="Hour Support"
                                icon={MessageSquare}
                            />
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-neutral-50 dark:bg-gray-900 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="mx-auto max-w-3xl px-6">
                        <div className="mb-12 text-center">
                            <h2 className="reveal mb-4 text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                            <p className="reveal text-neutral-600 dark:text-neutral-400">
                                Find answers to common questions about AsaanCar.
                            </p>
                        </div>
                        <div className="reveal">
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

                {/* Newsletter Section */}
                <section className="bg-neutral-50 py-24 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="rounded-2xl bg-[#7e246c]/5 px-6 py-12 dark:bg-gray-800/80 md:px-12">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="reveal mb-4 text-3xl font-bold text-gray-900 dark:text-white">Stay Updated</h2>
                                <p className="reveal mb-8 text-neutral-600 dark:text-neutral-400">
                                    Get the latest updates and special offers from AsaanCar delivered to your inbox.
                                </p>
                                <form onSubmit={handleSubscribe} className="reveal flex flex-col gap-4 sm:flex-row">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-[#7e246c] px-6 py-2 text-white transition-colors hover:bg-[#6a1f5c]"
                                    >
                                        Subscribe
                                    </button>
                                </form>
                                {emailError && (
                                    <p className="mt-2 text-sm text-red-500">{emailError}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-neutral-200 py-12 dark:border-neutral-800 bg-white dark:bg-gray-800/80">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                            <div className="flex items-center gap-2 text-xl font-bold text-[#7e246c]">
                                <svg className="h-8 w-8 text-[#7e246c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                </svg>
                                AsaanCar
                            </div>
                            <div className="flex gap-6">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="text-sm text-gray-600 dark:text-gray-300 hover:text-[#7e246c] dark:hover:text-[#7e246c] transition"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            smoothScrollTo(link.href.slice(1));
                                        }}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                © {new Date().getFullYear()} AsaanCar. All rights reserved.
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
}
