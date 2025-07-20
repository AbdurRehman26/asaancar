import React from 'react';

const Footer: React.FC = () => (
  <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12 mt-8 bg-white dark:bg-gray-800/80">
    <div className="mx-auto max-w-7xl px-6">
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex items-center gap-2 text-xl font-bold text-[#7e246c]">
          <svg className="h-8 w-8 text-[#7e246c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
          AsaanCar
        </div>
        <div className="flex gap-6">
          <a href="/cars" className="text-sm text-[#7e246c] hover:text-[#6a1f5c]">Cars</a>
          <a href="/" className="text-sm text-[#7e246c] hover:text-[#6a1f5c]">Home</a>
        </div>
        <div className="text-sm text-[#7e246c]">
          © {new Date().getFullYear()} AsaanCar. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
);

export default Footer; 