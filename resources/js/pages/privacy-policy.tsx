import React from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { useAuth } from '@/components/AuthContext';

export default function PrivacyPolicy() {
  const { user } = useAuth();
  return (
    <>
      <title>Privacy Policy - AsaanCar</title>
      <Navbar auth={{ user }} />
      <main className="bg-neutral-50 dark:bg-gray-900 min-h-screen pt-20">
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold text-[#7e246c] mb-6">Privacy Policy</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-10">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Introduction</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            At AsaanCar, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our car rental platform and services.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300">
            <li>Personal identification information (name, email address, phone number)</li>
            <li>Payment information (credit card details, billing address)</li>
            <li>Booking and rental history</li>
            <li>Driver's license information (for self-drive rentals)</li>
            <li>Communication preferences and feedback</li>
          </ul>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            We also automatically collect certain information when you visit our platform, such as your IP address, browser type, device information, and usage patterns.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300">
            <li>Process and manage your bookings and reservations</li>
            <li>Communicate with you about your bookings, account, and our services</li>
            <li>Process payments and prevent fraudulent transactions</li>
            <li>Improve our platform, services, and user experience</li>
            <li>Send you promotional materials and updates (with your consent)</li>
            <li>Comply with legal obligations and enforce our terms of service</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Information Sharing and Disclosure</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300">
            <li>Service providers who assist us in operating our platform (payment processors, cloud hosting, etc.)</li>
            <li>Car rental partners and store owners to fulfill your bookings</li>
            <li>Law enforcement or government authorities when required by law</li>
            <li>Other parties with your explicit consent</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Data Security</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your Rights</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300">
            <li>Access and receive a copy of your personal information</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Request deletion of your personal information</li>
            <li>Object to or restrict the processing of your information</li>
            <li>Withdraw consent for marketing communications at any time</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Cookies and Tracking Technologies</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie preferences through your browser settings, though this may affect certain functionality of our services.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Third-Party Links</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Children's Privacy</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Changes to This Privacy Policy</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please{' '}
            <a href="/contact" className="text-[#7e246c] hover:text-[#6a1f5c] hover:underline font-semibold">
              contact us
            </a>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

