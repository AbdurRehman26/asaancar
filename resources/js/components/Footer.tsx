import React from 'react';

const Footer: React.FC = () => (
  <footer className="border-t border-neutral-200 dark:border-neutral-800 py-2 mt-8 bg-white dark:bg-gray-800/80">
    <div className="mx-auto max-w-7xl px-6">
      <div className="flex flex-col items-center justify-between gap-1 md:flex-row">
        <div className="flex items-center gap-2 text-xl font-bold text-[#7e246c]">
          <img src="/images/car-logo-nameless.png" alt="AsaanCar Logo" className="h-18 w-24" />
          <span>AsaanCar</span>
        </div>
        <div className="flex gap-6">
          <a href="/cars" className="text-sm text-[#7e246c] hover:text-[#6a1f5c]">Cars</a>
          <a href="/" className="text-sm text-[#7e246c] hover:text-[#6a1f5c]">Home</a>
          <a href="/about" className="text-sm text-[#7e246c] hover:text-[#6a1f5c]">About Us</a>
          <a href="/contact" className="text-sm text-[#7e246c] hover:text-[#6a1f5c]">Contact Us</a>
        </div>
        <div className="flex flex-col items-center gap-0.5 md:items-end">
          <a
            href="https://play.google.com/store/apps/details?id=com.asaancar.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
          >
            <img
              src="/google-play-download-android-app-logo.svg"
              alt="Get it on Google Play"
              className="h-20 w-auto sm:h-24"
            />
          </a>
          <div className="text-xs text-[#7e246c]">
            © {new Date().getFullYear()} AsaanCar. All rights reserved.
          </div>
          <a href="/privacy-policy" className="text-xs text-[#7e246c] hover:text-[#6a1f5c] hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer; 