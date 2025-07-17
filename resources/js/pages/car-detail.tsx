import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Fuel, Info, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import Navbar from '../components/navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginModal from '@/pages/auth/login-modal';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import Chat from '../components/chat';
import DarkModeToggle from '../components/ui/dark-mode-toggle';

// No hardcoded car data

export default function CarDetailPage() {
  const { user } = useAuth();
  // Get car ID from URL (for demonstration, usePage.props or useParams if available)
  const carId = (typeof window !== 'undefined' && window.location.pathname.split('/').pop()) || 'N/A';
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickupAddress, setPickupAddress] = useState('Werdener Str. 87, 40233 Düsseldorf, Germany');
  const [pickupTime, setPickupTime] = useState('23:30');
  const [pickupDate, setPickupDate] = useState('2025-07-13');
  const [dropoffAddress, setDropoffAddress] = useState('Werdener Str. 87, 40233 Düsseldorf, Germany');
  const [promo, setPromo] = useState('');
  const [refillTank, setRefillTank] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [userBooking, setUserBooking] = useState<any>(null);

  useEffect(() => {
    if (!carId) return;
    setLoading(true);
    apiFetch(`/api/cars/${carId}`)
      .then(async res => {
        if (!res.ok) {
          setError('Failed to fetch car details');
          setCar(null);
        } else {
          const data = await res.json();
          const carData = data.data || data;
          console.log('🔍 DEBUG: Car data received:', carData);
          console.log('🔍 DEBUG: Car store_id:', carData.store_id);
          console.log('🔍 DEBUG: Car store object:', carData.store);
          setCar(carData);
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [carId]);

  useEffect(() => {
    if (user && car && car.id) {
      apiFetch(`/api/bookings/user-car/${car.id}`)
        .then(async res => {
          const data = await res.json();
          setUserBooking(data.data);
        })
        .catch(() => setUserBooking(null));
    } else {
      setUserBooking(null);
    }
  }, [user, car]);

  // Debug logging for user and car state changes
  useEffect(() => {
    console.log('🔍 DEBUG: User state changed:', user);
    console.log('🔍 DEBUG: Car state changed:', car);
    if (car) {
      console.log('🔍 DEBUG: Car store_id type:', typeof car.store_id);
      console.log('🔍 DEBUG: Car store_id value:', car.store_id);
    }
  }, [user, car]);

  useEffect(() => {
    if (user && loginOpen) {
      setLoginOpen(false);
    }
  }, [user, loginOpen]);

  const handleBooking = async () => {
    if (!car) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          car_id: car.id,
          pickup_address: pickupAddress,
          pickup_time: pickupTime,
          pickup_date: pickupDate,
          dropoff_address: dropoffAddress,
          refill_tank: refillTank,
          promo,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Booking failed');
      } else {
        // Optionally redirect or show success
        window.location.href = '/bookings';
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = async () => {
    console.log('🔍 DEBUG: handleOpenChat called');
    console.log('🔍 DEBUG: User object:', user);
    console.log('🔍 DEBUG: Car object:', car);
    console.log('🔍 DEBUG: Car store_id:', car?.store_id);
    console.log('🔍 DEBUG: Car store object:', car?.store);
    console.log('🔍 DEBUG: Car store.id:', car?.store?.id);
    console.log('🔍 DEBUG: User exists:', !!user);
    console.log('🔍 DEBUG: Car exists:', !!car);
    console.log('🔍 DEBUG: Store_id exists:', !!car?.store_id);
    console.log('🔍 DEBUG: Store.id exists:', !!car?.store?.id);
    
    setChatError(null);
    
    // Check if user is logged in
    if (!user) {
      const msg = 'Please log in to start a chat with the store.';
      console.error('❌ ERROR:', msg, { user: 'missing' });
      setShowChat(true);
      setConversationId(null);
      setChatError(msg);
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
      return;
    }
    
    console.log('✅ DEBUG: User is logged in and car has store_id');
    console.log('🔍 DEBUG: About to fetch conversations for store_id:', car.store.id);
    
    try {
      // Fetch or create the conversation for this store
      const res = await apiFetch('/api/chat/conversations');
      const data = await res.json();
      console.log('🔍 DEBUG: Fetched conversations:', data);
      const conv = data.find((c: any) => c.type === 'store' && String(c.store_id) === String(car.store.id));
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
    } catch (e: any) {
      console.error('❌ ERROR: Error opening chat:', e);
      setShowChat(true);
      setConversationId(null);
      setChatError('Could not start chat. Please try again later. ' + (e?.message || ''));
    }
  };

  const totalAmount = car?.rental || 0;

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">Loading car details...</div>);
  }
  if (error) {
    return (<div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-red-600">{error}</div>);
  }
  if (!car) {
    return (<div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-gray-600">Car not found.</div>);
  }
  return (
    <>
      {/* Modals */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log in to your account</DialogTitle>
          </DialogHeader>
          <LoginModal canResetPassword={true} />
        </DialogContent>
      </Dialog>
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create an account</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
        {/* Navbar */}
        <Navbar 
          auth={{ user }}
          onLoginClick={() => setLoginOpen(true)}
          onRegisterClick={() => setRegisterOpen(true)}
        />
        <div className="py-10 px-2 md:px-8">
        <div className="text-xs text-gray-400 dark:text-neutral-400 mb-2">Car ID: {carId}</div>
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800/80 rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Left: Car & Booking Details */}
        <div className="md:w-1/2 p-8 flex flex-col gap-8">
          <div className="flex justify-center items-center">
            <img src={car.image || '/images/car-placeholder.jpeg'} alt={car.name} className="h-56 object-contain rounded-xl bg-gray-50 dark:bg-neutral-800" />
          </div>
          <a href="/cars" className="text-2xl font-bold text-[#7e246c] dark:text-white text-center block hover:text-[#6a1f5c] dark:hover:text-gray-200 transition">{car.name}</a>
          <div>
            <h3 className="text-lg font-semibold text-[#7e246c] dark:text-white mb-4 text-center md:text-left">Pick-up & Drop-off Details</h3>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#7e246c]/40 shadow-lg flex flex-col gap-8">
              {/* Pick-up */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-[#7e246c]" />
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">Pick-up Detail</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-4 border border-[#7e246c]/30">
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={e => setPickupAddress(e.target.value)}
                    className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                    placeholder="Pick-up address"
                  />
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="text-[#7e246c]" />
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={e => setPickupTime(e.target.value)}
                        className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Calendar className="text-[#7e246c]" />
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={e => setPickupDate(e.target.value)}
                        className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Drop-off */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-[#7e246c]" />
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">Drop-off Details</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-2 border border-[#7e246c]/30">
                  <input
                    type="text"
                    value={dropoffAddress}
                    onChange={e => setDropoffAddress(e.target.value)}
                    className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                    placeholder="Drop-off address"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Overtime is applied after 10 hours or 12:00 AM, whichever comes first. Based on your time selection, overtime will apply after 11:30 PM on a daily basis. Additional day will be charged after 6:00 AM.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right: Pricing & Booking Summary */}
        <div className="md:w-1/2 bg-white dark:bg-gray-800/80 border-l border-gray-100 dark:border-neutral-800 p-8 flex flex-col gap-8">
          <div>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-[#7e246c] dark:text-white font-bold">
                  <th className="text-left">Rate</th>
                  <th>No. of days</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody className="text-black dark:text-white">
                <tr>
                  <td>Rental</td>
                  <td>1</td>
                  <td>{car.currency} {typeof car.rental === 'number' ? car.rental.toLocaleString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td>Base Fare</td>
                  <td>-</td>
                  <td>{car.currency} {typeof car.baseFare === 'number' ? car.baseFare.toLocaleString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td>Fuel</td>
                  <td>-</td>
                  <td>{typeof car.fuel === 'number' ? car.fuel.toLocaleString() : 'N/A'}/km</td>
                </tr>
                <tr>
                  <td>Over Time</td>
                  <td>-</td>
                  <td>{typeof car.overtime === 'number' ? car.overtime.toLocaleString() : 'N/A'}/hour</td>
                </tr>
                <tr>
                  <td className="text-[#7e246c] dark:text-white">Discount</td>
                  <td colSpan={2} className="text-right"><button className="text-[#7e246c] dark:text-white underline text-xs">Promo code</button></td>
                </tr>
              </tbody>
            </table>
            <div className="mb-4">
              <div className="font-semibold text-[#7e246c] dark:text-white mb-2">Optional Service</div>
              <label className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 cursor-pointer border border-gray-200 dark:border-neutral-700">
                <Fuel className="h-5 w-5 text-[#7e246c]" />
                <span className="flex-1 text-black dark:text-white">Refill Tank <span className="block text-xs text-gray-500 dark:text-neutral-400">Refill fuel at the end of the day</span></span>
                <input type="checkbox" checked={refillTank} onChange={e => setRefillTank(e.target.checked)} className="accent-[#7e246c] h-5 w-5" />
              </label>
            </div>
            <div className="flex flex-col gap-2 mb-2">
              <div className="text-lg font-bold text-[#7e246c] dark:text-white">Total Amount</div>
              <div className="text-3xl font-extrabold text-[#7e246c] dark:text-white">{car.currency} {typeof totalAmount === 'number' ? totalAmount.toLocaleString() : 'N/A'}</div>
            </div>
            <div className="text-xs text-red-700 dark:text-red-400 font-semibold mb-2">Excluding fuel & overtime charges (charges – view details)</div>
            <div className="flex items-start gap-2 mb-4">
              <input type="radio" checked readOnly className="accent-[#7e246c] mt-1" />
              <span className="text-xs text-gray-700 dark:text-neutral-400">
                Kindly note that the Fuel Charges and Overtime will be applied based on the mileage of the car and extra hours of the services (if any). Your final invoice will be generated after adding the Fuel and Overtime charges at the end of your reservation. For more details please read the <a href="#" className="underline text-[#7e246c] dark:text-white">Fuel and Overtime charges and terms of use</a>.
              </span>
            </div>
            <div className="flex gap-4 mt-6 flex-col">
              {user ? (
                <button onClick={handleBooking} className="w-full py-3 rounded-md bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition" disabled={loading}>
                  {userBooking ? 'Create Another Booking' : 'Confirm Booking'}
                </button>
              ) : (
                <button disabled className="w-full py-3 rounded-md bg-gray-300 text-gray-500 cursor-not-allowed font-semibold text-base shadow-sm flex items-center justify-center gap-2 dark:bg-gray-700 dark:text-gray-400">
                  Please login to book
                </button>
              )}
              {/* User Booking Info (if exists) */}
              {userBooking && (
                <div className="rounded-xl border border-[#7e246c] bg-[#7e246c]/5 dark:bg-[#7e246c]/10 p-4 mb-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-[#7e246c] dark:text-white">You have already booked this car</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Status: <span className="font-bold">{userBooking.status}</span></div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Pickup: <span className="font-bold">{userBooking.start_date}</span></div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Dropoff: <span className="font-bold">{userBooking.end_date}</span></div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Total: <span className="font-bold">{userBooking.total_price} {car.currency}</span></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Booking ID: {userBooking.id}</div>
                </div>
              )}
              {/* Message Store Button below booking button */}
              <button
                onClick={async () => {
                  console.log('🔍 DEBUG: Message Store button clicked');
                  console.log('🔍 DEBUG: Button click - User:', user);
                  console.log('🔍 DEBUG: Button click - Car:', car);
                  console.log('🔍 DEBUG: Button click - Car store_id:', car?.store?.id);
                  await handleOpenChat();
                }}
                className={`w-full py-3 rounded-md font-semibold transition mt-2 
                  ${user ? 'bg-[#7e246c] text-white hover:bg-[#6a1f5c] cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'}`}
                disabled={!user}
              >
                {user ? 'Message Store' : 'Please login to send message'}
              </button>
            </div>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>
        </div>
        </div>
      </div>
      {/* Footer */}
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
    </div>
    </>
  );
} 