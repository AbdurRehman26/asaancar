import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Fuel, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import Navbar from '../components/navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginModal from '@/pages/auth/login-modal';
import { apiFetch } from '@/lib/utils';
import Chat from '../components/chat';
import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';
import UserBookingsList from '../components/UserBookingsList';

interface Car {
  id: number;
  name: string;
  image?: string;
  rental?: number;
  baseFare?: number;
  fuel?: number;
  overtime?: number;
  currency?: string;
  store_id?: number;
  store?: { id: number };
  [key: string]: unknown;
}

interface Booking {
  id: number;
  status: string;
  start_date: string;
  total_price: number;
  pickup_location?: string;
  number_of_days?: number;
  rental_type?: string;
  refill_tank?: boolean;
  pickup_date?: string;
  pickup_time?: string;
  notes?: string;
  [key: string]: unknown;
}

// No hardcoded car data

export default function CarDetailPage() {
  const { user } = useAuth();
  // Get car ID from URL (for demonstration, usePage.props or useParams if available)
  const carId = (typeof window !== 'undefined' && window.location.pathname.split('/').pop()) || 'N/A';
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatButtonLoading, setChatButtonLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCarAndBooking = async () => {
    console.log('Calling booking API for car:', carId);
    if (!carId) return;
    setLoading(true);
    try {
      const carRes = await apiFetch(`/api/cars/${carId}`);
      if (!carRes.ok) {
        setError('Failed to fetch car details');
        setCar(null);
      } else {
        const json = await carRes.json();
        const carData: Car = json.data || json;
        setCar(carData);
      }
      const bookingRes = await apiFetch(`/api/bookings/user-car/${carId}`);
      const bookingData = await bookingRes.json();
      if (Array.isArray(bookingData.data)) {
        setUserBookings(bookingData.data);
      } else if (bookingData.data) {
        setUserBookings([bookingData.data]);
      } else {
        setUserBookings([]);
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarAndBooking();
  }, [carId]);

  useEffect(() => {
    if (user && loginOpen) {
      setLoginOpen(false);
    }
  }, [user, loginOpen]);

  const handleOpenChat = async () => {
    setChatButtonLoading(true);

    setChatError(null);

    // Check if user is logged in
    if (!user) {
      const msg = 'Please log in to start a chat with the store.';
      console.error('❌ ERROR:', msg, { user: 'missing' });
      setShowChat(true);
      setConversationId(null);
      setChatError(msg);
      setChatButtonLoading(false);
      return;
    }

    // Check if car has store information
    if (!car?.store?.id) {
      const msg = 'Cannot start chat: this car is not associated with a store.';
      console.error('❌ ERROR:', msg, {
        store_id: car?.store_id ? `exists (${car.store_id})` : 'missing',
        store_object: car?.store ? 'exists' : 'missing',
        store_id_from_object: car?.store?.id ? `exists (${car.store.id})` : 'missing',
        car_id: car?.id
      });
      setShowChat(true);
      setConversationId(null);
      setChatError(msg);
      setChatButtonLoading(false);
      return;
    }

    console.log('✅ DEBUG: User is logged in and car has store_id');
    console.log('🔍 DEBUG: About to fetch conversations for store_id:', car.store.id);

    try {
      // Fetch or create the conversation for this store
      const res = await apiFetch('/api/chat/conversations');
      const data = await res.json();
      console.log('🔍 DEBUG: Fetched conversations:', data);
      const conv = data.find((c: unknown): c is { id: number; type: string; store_id: number } => {
        if (typeof c === 'object' && c !== null && 'type' in c && 'store_id' in c && 'id' in c) {
          // @ts-expect-error: c is loosely typed from API response, checked for required fields above
          return c.type === 'store' && String(c.store_id) === String(car.store.id);
        }
        return false;
      });
      console.log('🔍 DEBUG: Found existing conversation:', conv);

      if (conv) {
        setConversationId(conv.id);
        setShowChat(true);
        setChatError(null);
        console.log('✅ DEBUG: Using existing conversation:', conv.id);
      } else {
        console.log('🔍 DEBUG: No existing conversation found, creating new one');
        const createRes = await apiFetch('/api/chat/conversations', {
          method: 'POST',
          body: JSON.stringify({ type: 'store', store_id: car.store.id }),
        });
        const newConv = await createRes.json();
        console.log('🔍 DEBUG: Created new conversation response:', newConv);
        if (newConv && newConv.id) {
          setConversationId(newConv.id);
          setShowChat(true);
          setChatError(null);
          console.log('✅ DEBUG: Successfully created and set conversation:', newConv.id);
        } else {
          throw new Error('Failed to create conversation. Response: ' + JSON.stringify(newConv));
        }
      }
    } catch (e: unknown) {
      console.error('❌ ERROR: Error opening chat:', e);
      setShowChat(true);
      setConversationId(null);
      setChatError('Could not start chat. Please try again later. ' + ((e as Error)?.message || ''));
    }
    setChatButtonLoading(false);
  };

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">Loading car details...</div>);
  }
  if (!car) {
    return (<div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-gray-600">Car not found.</div>);
  }
  return (
    <>
      <div className="min-h-screen bg-neutral-50 mt-17 dark:bg-gray-900">
        {/* Navbar */}
        <Navbar auth={{ user }} />
        <div className="py-10 px-2 md:px-8">
          <div className="text-xs text-gray-400 dark:text-neutral-400 mb-2">Car ID: {carId}</div>
          <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800/80 rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
            {/* Left: Car & Booking Details */}
            <div className="md:w-1/2 p-8 flex flex-col gap-8">
              <div className="flex justify-center items-center">
                <img src={car.image || '/images/car-placeholder.jpeg'} alt={car.name} className="h-56 object-contain rounded-xl bg-gray-50 dark:bg-neutral-800" />
              </div>
              <a href="/cars" className="text-2xl font-bold text-[#7e246c] dark:text-white text-center block hover:text-[#6a1f5c] dark:hover:text-gray-200 transition">{car.name}</a>
              <BookingForm
                car={car}
                user={user}
                onBooking={async (formData) => {
                  setLoading(true);
                  setError(null);
                  setSuccess(null);
                  try {
                    const res = await apiFetch('/api/bookings', {
                      method: 'POST',
                      body: JSON.stringify(formData),
                    });
                    if (!res.ok) {
                      const err = await res.json();
                      setError(err.message || 'Booking failed');
                    } else {
                      setSuccess('Booking successful!');
                      await fetchCarAndBooking();
                    }
                  } catch {
                    setError('Network error');
                  } finally {
                    setLoading(false);
                  }
                }}
                loading={loading}
                error={error}
                success={success}
                userBookings={userBookings}
              />
            </div>
            {/* Right: Pricing & Booking Summary */}
            <div className="md:w-1/2 bg-white dark:bg-gray-800/80 border-l border-gray-100 dark:border-neutral-800 p-8 flex flex-col gap-8">
              <div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-[#7e246c] dark:text-white mb-4">Rate Details</h3>
                  <div className="flex gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rentalType"
                        value="withoutDriver"
                        checked={true} // Always true for now, as BookingForm manages this
                        onChange={() => {}}
                        className="accent-[#7e246c] h-4 w-4"
                      />
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Without Driver</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">24 hrs/day</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rentalType"
                        value="withDriver"
                        checked={true} // Always true for now, as BookingForm manages this
                        onChange={() => {}}
                        className="accent-[#7e246c] h-4 w-4"
                      />
                      <span className="font-semibold text-gray-700 dark:text-gray-200">With Driver</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">10 hrs/day</span>
                    </label>
                  </div>
                  <div className="mb-4 flex items-center gap-2">
                    <label htmlFor="numberOfDays" className="text-[#7e246c] font-semibold">No. of Days</label>
                    <input
                      id="numberOfDays"
                      type="number"
                      min={1}
                      value={1} // Always 1 for now, as BookingForm manages this
                      onChange={() => {}}
                      className="w-24 rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                    />
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#7e246c] dark:text-white font-semibold border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left pb-3">Type</th>
                        <th className="pb-3">Hours/Day</th>
                        <th className="text-right pb-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-gray-300">
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 font-medium">With Driver</td>
                        <td className="py-3 text-center font-semibold">10 hrs/day</td>
                        <td className="py-3 text-right font-bold text-[#7e246c] dark:text-white">{car.currency} {(typeof car.withDriver === 'number' ? car.withDriver.toLocaleString() : 'N/A')}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium">Without Driver</td>
                        <td className="py-3 text-center font-semibold">24 hrs/day</td>
                        <td className="py-3 text-right font-bold text-[#7e246c] dark:text-white">{car.currency} {(typeof car.rental === 'number' ? car.rental.toLocaleString() : 'N/A')}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-4 text-sm font-semibold text-[#7e246c] dark:text-white">
                    Refill fuel at the end of the day or pay <span className="font-bold">PKR 32/KM</span>
                  </div>
                  <div className="text-sm font-semibold text-[#7e246c] dark:text-white mt-1">
                    Overtime: <span className="font-bold">PKR 400/hr</span>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#7e246c] dark:text-white mb-3">Optional Service</h3>
                  <label className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-[#7e246c]/30 transition-all duration-200">
                    <Fuel className="h-5 w-5 text-[#7e246c]" />
                    <span className="flex-1 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white">Refill Tank</span>
                      <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">Refill fuel at the end of the day</span>
                    </span>
                    <input type="checkbox" checked={true} onChange={() => {}} className="accent-[#7e246c] h-5 w-5 rounded" />
                  </label>
                </div>
                <div className="bg-gradient-to-r from-[#7e246c]/10 to-purple-500/10 dark:from-[#7e246c]/20 dark:to-purple-500/20 rounded-xl p-6 border border-[#7e246c]/20 mb-4">
                  <div className="text-lg font-bold text-[#7e246c] dark:text-white mb-2">Total Amount</div>
                  <div className="text-4xl font-black text-[#7e246c] dark:text-white">{car.currency} {(typeof car.rental === 'number' ? car.rental.toLocaleString() : 'N/A')}</div>
                  <div className="mt-2 text-sm font-semibold">
                    Refill: <span className="font-bold">40 PKR / Km</span>
                  </div>
                </div>
                <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-3">Excluding fuel & overtime charges <span className="underline cursor-pointer hover:text-red-700">(charges – view details)</span></div>
                <div className="flex items-start gap-3 mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="w-5 h-5 rounded-full bg-[#7e246c] flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Kindly note that the Fuel Charges and Overtime will be applied based on the mileage of the car and extra hours of the services (if any). Your final invoice will be generated after adding the Fuel and Overtime charges at the end of your reservation. For more details please read the <a href="#" className="underline text-[#7e246c] dark:text-white">Fuel and Overtime charges and terms of use</a>.
                  </span>
                </div>
                <div className="flex gap-4 mt-6 flex-col">
                  <button
                    onClick={async () => {
                      await handleOpenChat();
                    }}
                    className={`w-full py-3 rounded-md font-semibold transition mt-2
                      ${user ? 'bg-[#7e246c] text-white hover:bg-[#6a1f5c] cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'}`}
                    disabled={!user || chatButtonLoading}
                  >
                    {chatButtonLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        Loading...
                      </span>
                    ) : (
                      user ? 'Message Store' : 'Please login to send message'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      {showChat && user && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-full h-[500px] bg-gray-900 rounded-xl shadow-2xl flex flex-col border border-gray-800">
          <div className="flex items-center justify-between px-4 py-2 bg-[#7e246c] rounded-t-xl">
            <span className="text-white font-semibold">Store Chat</span>
            <button onClick={() => setShowChat(false)} className="text-white text-xl font-bold">&times;</button>
          </div>
          <div className="flex-1 min-h-0">
            {chatError ? (
              <div className="flex items-center justify-center h-full text-red-400 text-center px-4">{chatError}</div>
            ) : typeof conversationId === 'number' ? (
              <Chat conversationId={conversationId} currentUser={user} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">No conversation selected.</div>
            )}
          </div>
        </div>
      )}

    <UserBookingsList userBookings={userBookings} car={car} />
    </>
  );
}
