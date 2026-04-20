import { useAuth } from '@/components/AuthContext';
import React, { useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/navbar';

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
                    Accept: 'application/json',
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
            <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] pt-20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
                <section className="mx-auto max-w-lg px-6 py-20">
                    <div className="mb-8 rounded-[1.75rem] border border-white/60 bg-white/80 px-6 py-7 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.28)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/88 dark:shadow-none">
                        <h1 className="mb-4 text-4xl font-bold text-[#2b1128] dark:text-white">Contact Us</h1>
                        <p className="text-[#6f556c] dark:text-white/65">
                            Have a question or need help? Fill out the form below and our team will get back to you soon.
                        </p>
                    </div>
                    {submitted ? (
                        <div className="mb-6 rounded-[1.25rem] border border-green-300 bg-green-100 px-4 py-3 text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
                            Thank you for reaching out! We'll get back to you as soon as possible.
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 rounded-[1.75rem] border border-white/70 bg-white/90 p-8 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none"
                        >
                            <div>
                                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="contact_info" className="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75">
                                    Contact Information
                                </label>
                                <input
                                    type="text"
                                    id="contact_info"
                                    name="contact_info"
                                    value={form.contact_info}
                                    onChange={handleChange}
                                    placeholder="Email or phone number"
                                    className="h-11 w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 text-[#2b1128] placeholder:text-[#a18ba0] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:placeholder:text-white/35 dark:focus:bg-white/8"
                                    required
                                />
                                {errors.contact_info && <p className="mt-1 text-xs text-red-500">{errors.contact_info}</p>}
                            </div>
                            <div>
                                <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-3 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                    required
                                />
                                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                            </div>
                            <button
                                type="submit"
                                className="w-full rounded-xl bg-[#7e246c] px-6 py-3 font-semibold text-white transition hover:bg-[#6a1f5c] hover:shadow-[0_18px_30px_-18px_rgba(126,36,108,0.7)]"
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
