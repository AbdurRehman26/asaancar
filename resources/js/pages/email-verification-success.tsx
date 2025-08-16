import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, LoaderCircle } from 'lucide-react';

export default function EmailVerificationSuccess() {
  const navigate = useNavigate();
  const { id, hash } = useParams();
  const [countdown, setCountdown] = useState(5);
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the query parameters from the current URL
        const urlParams = new URLSearchParams(window.location.search);
        const expires = urlParams.get('expires');
        const signature = urlParams.get('signature');
        
        // Construct the API URL
        const apiUrl = `/api/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`;
        
        // Make the verification request to the API
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setVerificationStatus('success');
          // Start countdown to redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate('/login?verified=1');
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setVerificationStatus('error');
          setErrorMessage(data.message || 'Verification failed');
        }
      } catch {
        setVerificationStatus('error');
        setErrorMessage('Network error occurred');
      }
    };

    verifyEmail();
  }, [navigate, id, hash]);

  const handleManualRedirect = () => {
    navigate('/login?verified=1');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          {verificationStatus === 'verifying' && (
            <>
              <LoaderCircle className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying Email
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Verified Successfully!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your email has been verified. You can now log in to your account.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Redirecting to login in {countdown} seconds...
              </div>
              <button
                onClick={handleManualRedirect}
                className="w-full bg-[#7e246c] text-white py-2 px-4 rounded-lg hover:bg-[#6a1f5c] transition-colors"
              >
                Go to Login Now
              </button>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {errorMessage}
              </p>
              <button
                onClick={handleManualRedirect}
                className="w-full bg-[#7e246c] text-white py-2 px-4 rounded-lg hover:bg-[#6a1f5c] transition-colors"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
