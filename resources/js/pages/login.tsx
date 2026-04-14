import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { apiFetch } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/navbar';

type AuthMethod = 'otp' | 'password';

export default function LoginPage() {
    const [authMethod, setAuthMethod] = useState<AuthMethod>('otp');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [retryCooldown, setRetryCooldown] = useState(0);
    const [retryingOtp, setRetryingOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();
    const { success: showSuccess, error: showError } = useToast();

    // Check if user just verified their email
    useEffect(() => {
        if (searchParams.get('verified') === '1') {
            // Show success message for email verification
            setError(null);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!otpSent || retryCooldown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setRetryCooldown((previousCooldown) => {
                if (previousCooldown <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }

                return previousCooldown - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [otpSent, retryCooldown]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (authMethod === 'otp') {
                // OTP login flow
                const res = await apiFetch('/api/send-login-otp', {
                    method: 'POST',
                    body: JSON.stringify({
                        phone_number: '+92' + phoneNumber,
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.message || 'Failed to send OTP');
                    showError('OTP Failed', data.message || '');
                } else {
                    setOtpSent(true);
                    setIdentifier(data.identifier);
                    setRetryCooldown(90);
                }
            } else {
                // Password login flow
                const res = await apiFetch('/api/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        login_method: 'password',
                        phone_number: '+92' + phoneNumber,
                        password: password,
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.message || 'Login failed');
                    showError('Login Failed', data.message || '');
                } else {
                    localStorage.setItem('token', data.token);
                    setToken(data.token);
                    setUser(data.user?.data || data.user);
                    showSuccess('Login Successful', 'Welcome back!');
                    navigate('/');
                }
            }
        } catch (e) {
            console.error(e);
            setError('Network error: ' + e);
            showError('Network Error', 'Unable to connect. Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setVerifying(true);
        try {
            const res = await apiFetch('/api/verify-login-otp', {
                method: 'POST',
                body: JSON.stringify({
                    identifier,
                    otp,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'OTP verification failed');
                showError('Verification Failed', data.message || '');
            } else {
                // Store token and user
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user?.data || data.user);
                showSuccess('Login Successful', 'Welcome back! You have been logged in successfully.');
                navigate('/');
            }
        } catch (e) {
            console.error(e);
            setError('Network error: ' + e);
            showError('Network Error', 'Unable to connect. Please check your internet connection and try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handleRetryOtp = async () => {
        if (retryCooldown > 0 || retryingOtp) {
            return;
        }

        setError(null);
        setRetryingOtp(true);

        try {
            const res = await apiFetch('/api/send-login-otp', {
                method: 'POST',
                body: JSON.stringify({
                    phone_number: '+92' + phoneNumber,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Failed to resend OTP');
                showError('Retry Failed', data.message || '');
            } else {
                setIdentifier(data.identifier);
                setOtp('');
                setRetryCooldown(90);
                showSuccess('OTP Sent', 'A new OTP has been sent to your phone number.');
            }
        } catch (e) {
            console.error(e);
            setError('Network error: ' + e);
            showError('Network Error', 'Unable to connect. Please check your internet connection and try again.');
        } finally {
            setRetryingOtp(false);
        }
    };

    if (otpSent) {
        return (
            <div className="flex min-h-screen flex-col md:flex-row">
                <Navbar />
                <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 pt-16 md:pt-0 dark:bg-gray-900">
                    <div className="mx-auto w-full max-w-md">
                        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Verify Your Phone</h1>
                        <p className="mb-6 text-gray-500 dark:text-gray-300">We've sent a 6-digit OTP to your phone number</p>
                        {error && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">Enter OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    maxLength={6}
                                    className="w-full rounded-lg border border-[#7e246c] bg-gray-50 px-4 py-3 text-center text-2xl text-base tracking-widest focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-800 dark:text-white"
                                    placeholder="000000"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full cursor-pointer rounded-lg bg-[#7e246c] py-3 text-base font-semibold text-white transition hover:bg-[#6a1f5c]"
                                disabled={verifying || otp.length !== 6}
                                style={{ pointerEvents: verifying || otp.length !== 6 ? 'none' : 'auto' }}
                            >
                                {verifying ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    type="button"
                                    className={`font-semibold ${
                                        retryCooldown > 0 || retryingOtp
                                            ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
                                            : 'text-[#7e246c] hover:underline'
                                    }`}
                                    onClick={handleRetryOtp}
                                    disabled={retryCooldown > 0 || retryingOtp}
                                >
                                    {retryingOtp ? 'Retrying...' : retryCooldown > 0 ? `Retry OTP in ${retryCooldown}s` : 'Retry OTP'}
                                </button>
                                <button
                                    type="button"
                                    className="font-semibold text-[#7e246c] hover:underline"
                                    onClick={() => {
                                        setOtpSent(false);
                                        setRetryCooldown(0);
                                    }}
                                >
                                    Back to login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative hidden flex-1 flex-col items-center justify-center bg-white p-12 md:flex dark:bg-gray-900">
                    <div className="w-full max-w-lg text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Verify Your Login</h2>
                        <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">Enter the OTP sent to your phone number to complete login</p>
                        <div className="overflow-hidden rounded-2xl shadow-lg">
                            <img src="/images/car-2.png" alt="Car rental illustration" className="h-auto w-full object-contain" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <Navbar />
            {/* Left: Login Form */}
            <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 pt-16 md:pt-0 dark:bg-gray-900">
                <div className="mx-auto w-full max-w-md">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                    <p className="mb-6 text-gray-500 dark:text-gray-300">Log in to your account</p>

                    {searchParams.get('verified') === '1' && (
                        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                            <div className="flex items-center">
                                <svg className="mr-2 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Account verified successfully! You can now log in to your account.
                                </span>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">Authentication method</label>
                            <div className="mb-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAuthMethod('otp')}
                                    className={`flex-1 rounded-lg border px-4 py-2 transition ${
                                        authMethod === 'otp'
                                            ? 'border-[#7e246c] bg-[#7e246c] text-white'
                                            : 'border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
                                    }`}
                                >
                                    OTP
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMethod('password')}
                                    className={`flex-1 rounded-lg border px-4 py-2 transition ${
                                        authMethod === 'password'
                                            ? 'border-[#7e246c] bg-[#7e246c] text-white'
                                            : 'border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
                                    }`}
                                >
                                    Password
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">Phone Number</label>
                            <div className="relative">
                                <div className="absolute top-1/2 left-3 flex -translate-y-1/2 transform items-center gap-2">
                                    <span className="text-xl">🇵🇰</span>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">+92</span>
                                </div>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                    required
                                    className="w-full rounded-lg border border-[#7e246c] bg-gray-50 py-3 pr-4 pl-20 text-base focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-800 dark:text-white"
                                    placeholder="3001234567"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter your 10-digit phone number without the country code</p>
                        </div>
                        {authMethod === 'password' && (
                            <div>
                                <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-[#7e246c] bg-gray-50 px-4 py-3 pr-12 text-base focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-800 dark:text-white"
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
                        )}
                        {error && <div className="mt-3 text-center text-sm text-red-600">{error}</div>}
                        <button
                            type="submit"
                            className="w-full cursor-pointer rounded-lg bg-[#7e246c] py-3 text-base font-semibold text-white transition hover:bg-[#6a1f5c]"
                            disabled={loading}
                            style={{ pointerEvents: loading ? 'none' : 'auto' }}
                        >
                            {loading ? (authMethod === 'otp' ? 'Sending OTP...' : 'Logging in...') : authMethod === 'otp' ? 'Send OTP' : 'Login'}
                        </button>
                    </form>
                    {/* Signup Link */}
                    <div className="mt-6 text-center">
                        <span className="text-gray-600 dark:text-gray-300">Don't have an account? </span>
                        <a href="/signup" className="font-semibold text-[#7e246c] hover:underline">
                            Sign up
                        </a>
                    </div>
                </div>
            </div>
            {/* Right: Car Image */}
            <div className="relative hidden flex-1 flex-col items-center justify-center bg-white p-12 md:flex dark:bg-gray-900">
                <div className="w-full max-w-lg text-center">
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Welcome to AsaanCar</h2>
                    <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">Your trusted partner for seamless car rental experiences</p>
                    <div className="mb-8 overflow-hidden rounded-2xl shadow-lg">
                        <img src="/images/car-2.png" alt="Car rental illustration" className="h-auto w-full object-contain" />
                    </div>
                    {/* Play Store Download Button */}
                    <a
                        href="https://play.google.com/store/apps/details?id=com.asaancar.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
                    >
                        <img src="/google-play-download-android-app-logo.svg" alt="Get it on Google Play" className="h-40 w-auto sm:h-48" />
                    </a>
                </div>
            </div>
        </div>
    );
}
