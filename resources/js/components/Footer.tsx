import React from 'react';

const Footer: React.FC = () => (
    <footer className="mt-8 border-t border-white/15 bg-gradient-to-r from-[#d88ac8] via-[#9d3d88] to-[#7e246c] py-2 text-white">
        <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-center justify-between gap-1 md:flex-row">
                <div className="flex items-center gap-2 text-xl font-bold text-white">
                    <img src="/images/car-logo-nameless.png" alt="AsaanCar Logo" className="h-18 w-24" />
                    <span>AsaanCar</span>
                </div>
                <div className="flex gap-6">
                    <a href="/" className="text-sm text-white/85 hover:text-white">
                        Home
                    </a>
                    <a href="/pick-and-drop" className="text-sm text-white/85 hover:text-white">
                        Find a Ride
                    </a>
                    <a href="/about" className="text-sm text-white/85 hover:text-white">
                        About Us
                    </a>
                    <a href="/contact" className="text-sm text-white/85 hover:text-white">
                        Contact Us
                    </a>
                </div>
                <div className="flex flex-col items-center gap-0.5 md:items-end">
                    <a
                        href="https://play.google.com/store/apps/details?id=com.asaancar.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        <img src="/google-play-download-android-app-logo.webp" alt="Get it on Google Play" className="h-14 w-auto md:h-12" />
                    </a>
                    <div className="text-xs text-white/85">© {new Date().getFullYear()} AsaanCar. All rights reserved.</div>
                    <a href="/privacy-policy" className="text-xs text-white/85 hover:text-white hover:underline">
                        Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
