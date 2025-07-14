import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Fuel, Info } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import Navbar from '../components/navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginModal from '@/pages/auth/login-modal';
import RegisterModal from '@/pages/auth/register-modal';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';

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
          setCar(data.data || data);
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [carId]);

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
          <RegisterModal />
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
            <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 border border-[#7e246c]/40 shadow-lg flex flex-col gap-8">
              {/* Pick-up */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-[#7e246c]" />
                  <span className="font-semibold text-white text-lg">Pick-up Detail</span>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-4 border border-[#7e246c]/30">
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={e => setPickupAddress(e.target.value)}
                    className="w-full rounded-lg border-2 border-[#7e246c] bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                    placeholder="Pick-up address"
                  />
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="text-[#7e246c]" />
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={e => setPickupTime(e.target.value)}
                        className="w-full rounded-lg border-2 border-[#7e246c] bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Calendar className="text-[#7e246c]" />
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={e => setPickupDate(e.target.value)}
                        className="w-full rounded-lg border-2 border-[#7e246c] bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Drop-off */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-[#7e246c]" />
                  <span className="font-semibold text-white text-lg">Drop-off Details</span>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-2 border border-[#7e246c]/30">
                  <input
                    type="text"
                    value={dropoffAddress}
                    onChange={e => setDropoffAddress(e.target.value)}
                    className="w-full rounded-lg border-2 border-[#7e246c] bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                    placeholder="Drop-off address"
                  />
                  <div className="text-xs text-gray-400 mt-2">
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
            <div className="flex gap-4 mt-6">
              {user ? (
                <button onClick={handleBooking} className="w-full py-3 rounded-md bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition" disabled={loading}>Confirm Booking</button>
              ) : (
                <button disabled className="w-full py-3 rounded-md bg-gray-300 text-gray-500 cursor-not-allowed font-semibold text-base shadow-sm flex items-center justify-center gap-2 dark:bg-gray-700 dark:text-gray-400">
                  Please login to book
                </button>
              )}
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
      <div className="mt-6">
        <Link to={`/chat?store=${car.store_id}`} className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-primary/90 transition">Message Store</Link>
      </div>
    </div>
    </>
  );
} 