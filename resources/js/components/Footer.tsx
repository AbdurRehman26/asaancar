import React from 'react';

const Footer: React.FC = () => (
    <footer className="mt-8 border-t border-white/60 bg-white/75 py-3 text-[#2f2231] shadow-[0_-18px_40px_-34px_rgba(126,36,108,0.14)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/75 dark:text-white dark:shadow-none">
        <div className="mx-auto max-w-7xl px-6">
            <div className="relative flex flex-col items-center justify-between gap-1 overflow-hidden rounded-[1.25rem] md:flex-row">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-56 bg-gradient-to-l from-white/60 via-white/18 to-transparent dark:from-white/0 dark:via-white/0" />
                <div className="flex items-center gap-2 text-xl font-bold text-[#2f2231] dark:text-white">
                    <img src="/images/car-logo-nameless.png" alt="AsaanCar Logo" className="h-18 w-24" />
                    <span>AsaanCar</span>
                </div>
                <div className="flex gap-6">
                    <a href="/" className="text-sm text-[#6b5368] hover:text-[#2f2231] dark:text-white/75 dark:hover:text-white">
                        Home
                    </a>
                    <a href="/pick-and-drop" className="text-sm text-[#6b5368] hover:text-[#2f2231] dark:text-white/75 dark:hover:text-white">
                        Find a Ride
                    </a>
                    <a href="/about" className="text-sm text-[#6b5368] hover:text-[#2f2231] dark:text-white/75 dark:hover:text-white">
                        About Us
                    </a>
                    <a href="/contact" className="text-sm text-[#6b5368] hover:text-[#2f2231] dark:text-white/75 dark:hover:text-white">
                        Contact Us
                    </a>
                </div>
                <div className="flex flex-col items-center gap-0.5 md:items-end">
                    <a
                        href="https://play.google.com/store/apps/details?id=com.asaancar.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
                    >
                        <img src="/google-play-icon.png" alt="Get it on Google Play" className="h-28 w-auto md:h-24" />
                    </a>
                    <div className="text-xs text-[#8a7286] dark:text-white/55">© {new Date().getFullYear()} AsaanCar. All rights reserved.</div>
                    <a
                        href="/privacy-policy"
                        className="text-xs text-[#8a7286] hover:text-[#2f2231] hover:underline dark:text-white/55 dark:hover:text-white"
                    >
                        Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
