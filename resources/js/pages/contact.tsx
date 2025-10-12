import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { useAuth } from '@/components/AuthContext';

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', contact_info: '', message: '' });
  const [errors, setErrors] = useState<{ name?: string; contact_info?: string; message?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.contact_info.trim()) newErrors.contact_info = 'Contact information is required.';
    if (!form.message.trim()) newErrors.message = 'Message is required.';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({ name: '', contact_info: '', message: '' });
        setErrors({});
      } else if (res.status === 422) {
        const data = await res.json();
        setErrors(data.errors || {});
      } else {
        setErrors({ message: 'Something went wrong. Please try again.' });
      }
    } catch {
      setErrors({ message: 'Network error. Please try again.' });
    }
  };

  return (
    <>
      <title>Contact Us - AsaanCar</title>
      <Navbar auth={{ user }} />
      <main className="bg-neutral-50 dark:bg-gray-900 min-h-screen pt-20">
        <section className="max-w-lg mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold text-[#7e246c] mb-6">Contact Us</h1>
          <p className="mb-8 text-gray-700 dark:text-gray-300">Have a question or need help? Fill out the form below and our team will get back to you soon.</p>
          {submitted ? (
            <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded mb-6">
              Thank you for reaching out! We'll get back to you as soon as possible.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800/80 p-8 rounded-xl shadow border border-neutral-200 dark:border-neutral-700">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-1 text-gray-900 dark:text-white">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-[#7e246c] rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]"
                  required
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="contact_info" className="block text-sm font-semibold mb-1 text-gray-900 dark:text-white">Contact Information</label>
                <input
                  type="text"
                  id="contact_info"
                  name="contact_info"
                  value={form.contact_info}
                  onChange={handleChange}
                  placeholder="Email or phone number"
                  className="w-full border border-[#7e246c] rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]"
                  required
                />
                {errors.contact_info && <p className="text-red-500 text-xs mt-1">{errors.contact_info}</p>}
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-1 text-gray-900 dark:text-white">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border border-[#7e246c] rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]"
                  required
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-[#7e246c] text-white font-semibold px-6 py-3 rounded-md hover:bg-[#6a1f5c] transition shadow cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                Send Message
              </button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
} 