import React from 'react';

const Footer: React.FC = () => (
  <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12 mt-8 bg-white dark:bg-gray-800/80">
    <div className="mx-auto max-w-7xl px-6">
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
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
        <div className="text-sm text-[#7e246c]">
          © {new Date().getFullYear()} AsaanCar. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
);

export default Footer; 