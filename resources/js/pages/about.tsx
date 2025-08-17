import React from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { useAuth } from '@/components/AuthContext';

export default function About() {
  const { user } = useAuth();
  return (
    <>
      <title>About Us - AsaanCar</title>
      <Navbar auth={{ user }} />
      <main className="bg-neutral-50 dark:bg-gray-900 min-h-screen pt-20">
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold text-[#7e246c] mb-6">About Us</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-10">
            AsaanCar is honored to be a two-time recipient of the "Pakistan Consumer Choice Award," recognized for redefining car rentals across the country.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Who We Are</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Gone are the days of stressful car rentals—endless searching, unpredictable prices, and questionable quality. AsaanCar is Pakistan’s first on-demand car rental platform, designed to make your journey smooth from start to finish. We bring together convenience, reliability, and quality assurance, all in one place.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">What We Offer</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            With AsaanCar, booking a car is just a few clicks away. Whether you need a ride for a business meeting, a family trip, a wedding, or simply to get around town, we have you covered. Our services are tailored for:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300">
            <li>Corporate teams & office staff</li>
            <li>Travelers and tourists</li>
            <li>Special occasions & events</li>
            <li>Families and individuals</li>
          </ul>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Choose from a wide selection of the latest, well-maintained vehicles—available with a professional chauffeur or for self-drive. Our flexible options ensure you get exactly what you need, when you need it.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Car rental, made simple.</span> AsaanCar was founded with a single goal: to put you, the customer, at the heart of everything we do. We set out to transform the car rental experience into something modern, transparent, and customer-focused.
          </p>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Every vehicle and driver on our platform is carefully vetted through our "AsaanCar Quality Check"—so you can book with confidence, knowing your safety and comfort are our top priorities.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Vision</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            What started as a bold idea to revolutionize car rentals in Pakistan has grown into a movement to set new standards for the entire industry. AsaanCar leverages technology to make car rentals accessible, efficient, and inspiring for everyone.
          </p>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            We’re passionate about driving progress—not just for our customers, but for the next generation of entrepreneurs and innovators in Pakistan.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
