import { useAuth } from '@/components/AuthContext';
import { apiFetch } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';

type SignupStep = 'info' | 'otp' | 'password' | 'complete';

export default function SignupPage() {
    const [step, setStep] = useState<SignupStep>('info');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [wantsPassword, setWantsPassword] = useState<boolean | null>(null);
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();
    const playStoreBanner = (
        <div className="rounded-[1.75rem] border border-white/60 bg-white/80 px-6 py-7 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.28)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/88 dark:[background-image:linear-gradient(90deg,_rgba(23,20,31,0.94)_0%,_rgba(23,20,31,0.94)_44%,_rgba(255,255,255,0.14)_100%)] dark:shadow-none">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
                <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold text-[#2b1128] sm:text-3xl dark:text-white">Book faster with the mobile app</h2>
                    <p className="mt-2 hidden text-sm text-[#6f556c] md:block dark:text-white/65">
                        Search routes, connect with drivers, and manage your rides on the go with the AsaanCar Android app.
                    </p>
                </div>

                <a
                    href="https://play.google.com/store/apps/details?id=com.asaancar.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
                >
                    <img src="/google-play-icon.png" alt="Get it on Google Play" className="h-10 w-auto sm:h-12 md:h-14" />
                </a>
            </div>
        </div>
    );
    const backToListingsButton = (
        <button
            type="button"
            onClick={() => navigate('/pick-and-drop')}
            className="mt-3 inline-flex items-center justify-center rounded-lg border border-[#7e246c] px-4 py-2 text-sm font-semibold text-[#7e246c] transition hover:bg-[#7e246c] hover:text-white"
        >
            Go back to listings
        </button>
    );

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await apiFetch('/api/send-signup-otp', {
                method: 'POST',
                body: JSON.stringify({
                    phone_number: '+92' + phoneNumber,
                    name: name,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || 'Failed to send OTP');
            } else {
                const data = await res.json();
                setIdentifier(data.identifier);
                setStep('otp');
            }
        } catch (e) {
            console.error(e);
            setError('Network error: ' + e);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await apiFetch('/api/verify-signup-otp', {
                method: 'POST',
                body: JSON.stringify({
                    identifier,
                    otp,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || 'OTP verification failed');
            } else {
                const data = await res.json();
                if (data.token && data.user) {
                    localStorage.setItem('token', data.token);
                    setToken(data.token);
                    setUser(data.user);

                    // If user already has a password, they're fully set up
                    if (data.user.has_password) {
                        navigate('/');
                    } else {
                        // Proceed to password step for new users
                        setStep('password');
                    }
                }
            }
        } catch (e) {
            console.error(e);
            setError('Network error: ' + e);
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const res = await apiFetch('/api/set-password', {
                method: 'POST',
                body: JSON.stringify({
                    identifier,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || 'Failed to set password');
            } else {
                handleCompleteSignup(true);
            }
        } catch (e) {
            console.error(e);
            setError('Network error: ' + e);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteSignup = async (hasPassword: boolean) => {
        setError(null);
        setLoading(true);
        try {
            const res = await apiFetch('/api/register', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    phone_number: '+92' + phoneNumber,
                    password: hasPassword ? password : null,
                    password_confirmation: hasPassword ? passwordConfirmation : null,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || 'Registration failed');
            } else {
                const data = await res.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    setToken(data.token);
                    setUser(data.user);
                    // Automatically redirect to home after successful signup
                    navigate('/');
                } else {
                    setStep('complete');
                }
            }
        } catch (e) {
            console.error(e);
            setError('Network error: ' + e);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'complete') {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
                <div className="flex min-h-screen items-center justify-center px-6">
                    <div className="w-full max-w-md rounded-[1.75rem] border border-white/70 bg-white/90 p-8 text-center shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                        <h2 className="mb-4 text-2xl font-bold text-[#7e246c] dark:text-white">Account Created!</h2>
                        <p className="mb-4 text-[#6f556c] dark:text-white/65">Your account has been successfully created.</p>
                        <button className="mt-4 rounded bg-[#7e246c] px-6 py-2 font-semibold text-white" onClick={() => navigate('/')}>
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'otp') {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
                <Navbar />
                <div className="flex min-h-screen flex-col md:flex-row">
                    <div className="px-6 pt-28 pb-0 md:hidden">{playStoreBanner}</div>
                    <div className="flex flex-1 flex-col justify-start px-6 py-12 pt-3 md:justify-center md:pt-0">
                        <div className="mx-auto w-full max-w-md">
                            <div className="mb-6 hidden md:block">{playStoreBanner}</div>
                            <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-8 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                                <div className="mb-6">{backToListingsButton}</div>
                                <h1 className="mb-2 text-2xl font-bold text-[#2b1128] dark:text-white">Verify Your Phone</h1>
                                <p className="mb-6 text-[#6f556c] dark:text-white/65">We've sent a 6-digit OTP to your phone number</p>
                                {error && (
                                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-[#4b3748] dark:text-white/80">Enter OTP</label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            required
                                            maxLength={6}
                                            className="w-full rounded-lg border border-[#7e246c]/20 bg-[#fbf4fa] px-4 py-3 text-center text-2xl text-base tracking-widest text-[#2b1128] focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white"
                                            placeholder="000000"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full cursor-pointer rounded-lg bg-[#7e246c] py-3 text-base font-semibold text-white transition hover:bg-[#6a1f5c]"
                                        disabled={loading || otp.length !== 6}
                                        style={{ pointerEvents: loading || otp.length !== 6 ? 'none' : 'auto' }}
                                    >
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                </form>
                                <div className="mt-6 text-center">
                                    <button type="button" className="font-semibold text-[#7e246c] hover:underline" onClick={() => setStep('info')}>
                                        Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'password') {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
                <Navbar />
                <div className="flex min-h-screen flex-col md:flex-row">
                    <div className="px-6 pt-28 pb-0 md:hidden">{playStoreBanner}</div>
                    <div className="flex flex-1 flex-col justify-start px-6 py-12 pt-3 md:justify-center md:pt-0">
                        <div className="mx-auto w-full max-w-md">
                            <div className="mb-6 hidden md:block">{playStoreBanner}</div>
                            <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-8 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                                <div className="mb-6">{backToListingsButton}</div>
                                <h1 className="mb-2 text-2xl font-bold text-[#2b1128] dark:text-white">Set Password (Optional)</h1>
                                <p className="mb-6 text-[#6f556c] dark:text-white/65">
                                    Would you like to set a password for your account? You can skip this and set it later.
                                </p>
                                {wantsPassword === null ? (
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => setWantsPassword(true)}
                                            className="w-full rounded-lg bg-[#7e246c] py-3 font-semibold text-white transition hover:bg-[#6a1f5c]"
                                        >
                                            Yes, set a password
                                        </button>
                                        <button
                                            onClick={() => handleCompleteSignup(false)}
                                            className="w-full rounded-lg bg-gray-200 py-3 font-semibold text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating account...' : 'Skip for now'}
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSetPassword} className="space-y-4">
                                        {error && (
                                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                                {error}
                                            </div>
                                        )}
                                        <div>
                                            <label className="mb-1 block font-medium text-[#4b3748] dark:text-white/80">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="w-full rounded-lg border border-[#7e246c]/20 bg-[#fbf4fa] px-4 py-3 pr-12 text-base text-[#2b1128] focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white"
                                                    placeholder="Enter your password"
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-[#7e246c] focus:outline-none"
                                                    onClick={() => setShowPassword((v) => !v)}
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1 block font-medium text-[#4b3748] dark:text-white/80">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                                    value={passwordConfirmation}
                                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                                    required
                                                    className="w-full rounded-lg border border-[#7e246c]/20 bg-[#fbf4fa] px-4 py-3 pr-12 text-base text-[#2b1128] focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white"
                                                    placeholder="Confirm your password"
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-[#7e246c] focus:outline-none"
                                                    onClick={() => setShowPasswordConfirmation((v) => !v)}
                                                >
                                                    {showPasswordConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full rounded-lg bg-[#7e246c] py-3 font-semibold text-white transition hover:bg-[#6a1f5c]"
                                            disabled={loading}
                                        >
                                            {loading ? 'Setting password...' : 'Set Password & Complete'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCompleteSignup(false)}
                                            className="w-full rounded-lg bg-gray-200 py-3 font-semibold text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                            disabled={loading}
                                        >
                                            Skip
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
            <Navbar />
            <div className="flex min-h-screen flex-col md:flex-row">
                <div className="px-6 pt-28 pb-0 md:hidden">{playStoreBanner}</div>
                <div className="flex flex-1 flex-col justify-start px-6 py-12 pt-3 md:justify-center md:pt-0">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mt-12 rounded-[1.75rem] border border-white/70 bg-white/90 p-8 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                            <div className="mb-6 hidden md:block">{playStoreBanner}</div>
                            <div className="mb-6">{backToListingsButton}</div>
                            <h1 className="mb-2 text-2xl font-bold text-[#2b1128] dark:text-white">Create Your Account</h1>
                            <p className="mb-6 text-[#6f556c] dark:text-white/65">Join AsaanCar and get moving faster.</p>
                            <div className="mb-4 text-lg font-semibold text-[#2b1128] dark:text-white">Account Information</div>
                            {error && (
                                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <label className="mb-1 block font-medium text-[#4b3748] dark:text-white/80">Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-[#7e246c]/20 bg-[#fbf4fa] px-4 py-3 text-base text-[#2b1128] focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium text-[#4b3748] dark:text-white/80">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute top-1/2 left-3 flex -translate-y-1/2 transform items-center gap-2">
                                            <span className="text-xl">🇵🇰</span>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">+92</span>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            required
                                            maxLength={10}
                                            className="w-full rounded-lg border border-[#7e246c]/20 bg-[#fbf4fa] py-3 pr-4 pl-20 text-base text-[#2b1128] focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white"
                                            placeholder="3001234567"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-[#8a7286] dark:text-white/45">
                                        Enter your 10-digit phone number without the country code
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full cursor-pointer rounded-lg bg-[#7e246c] py-3 text-base font-semibold text-white transition hover:bg-[#6a1f5c]"
                                    disabled={loading}
                                    style={{ pointerEvents: loading ? 'none' : 'auto' }}
                                >
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </form>
                            <div className="mt-6 text-center">
                                <span className="text-[#6f556c] dark:text-white/65">Already have an account? </span>
                                <a href="/login" className="font-semibold text-[#7e246c] hover:underline">
                                    Log in
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative hidden flex-1 flex-col items-center justify-center p-12 md:flex">
                    <div className="w-full max-w-lg rounded-[1.75rem] border border-white/70 bg-white/90 p-8 text-center shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                        <h2 className="mb-4 text-3xl font-bold text-[#2b1128] dark:text-white">Join AsaanCar Today</h2>
                        <p className="mb-8 text-lg text-[#6f556c] dark:text-white/65">
                            Join AsaanCar to discover reliable pick and drop rides for your everyday routes.
                        </p>
                        <div className="mb-8 overflow-hidden rounded-2xl border border-[#7e246c]/10 bg-[#fbf4fa] dark:border-white/10 dark:bg-white/6">
                            <img src="/images/car-2.png" alt="Car rental illustration" className="h-auto w-full object-contain" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
