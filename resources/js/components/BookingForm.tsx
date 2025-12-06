import React, { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import type { Car } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { StandaloneSearchBox } from '@react-google-maps/api';
import GoogleMap from './GoogleMap';
import { useJsApiLoader } from '@react-google-maps/api';
import { Link } from 'react-router-dom';

const GOOGLE_MAP_LIBRARIES = ['places'] as unknown as string[];

interface User {
  id: number;
  name: string;
}

interface Booking {
  id: number;
  status: string;
  start_date?: string;
  total_price: number;
  pickup_location?: string;
  number_of_days?: number;
  rental_type?: string;
  refill_tank?: boolean;
  pickup_date?: string;
  pickup_time?: string;
  notes?: string;
}

interface BookingFormProps {
  car: Car;
  user?: User;
  onBooking: (data: Record<string, unknown>) => Promise<void>;
  error: string | null;
  success: string | null;
  userBookings: Booking[];
  rentalType: 'with_driver' | 'without_driver';
  setRentalType: (type: 'with_driver' | 'without_driver') => void;
  numberOfDays: number;
  setNumberOfDays: (days: number) => void;
  onMessageStore?: () => void;
  pickupDate: string;
  setPickupDate: (date: string) => void;
  pickupTime: string;
  setPickupTime: (time: string) => void;
  selectedAddress: string;
  setSelectedAddress: (address: string) => void;
  selectedLatLng: { lat: number; lng: number } | null;
  setSelectedLatLng: (latLng: { lat: number; lng: number } | null) => void;
  refillTank: boolean;
  setRefillTank: (val: boolean) => void;
}

// Export BookingPrice as a separate component
export function BookingPrice({ car, rentalType, numberOfDays }: { car: Car; rentalType: 'with_driver' | 'without_driver'; numberOfDays: number }) {
  const dailyPrice = rentalType === 'with_driver'
    ? (car && typeof car.withDriver === 'number' ? car.withDriver : 0)
    : (car && typeof car.rental === 'number' ? car.rental : 0);
  const totalAmount = dailyPrice * numberOfDays;
  return (
    <div className="mt-6 bg-gradient-to-r from-[#7e246c]/10 to-purple-500/10 dark:from-[#7e246c]/20 dark:to-purple-500/20 rounded-xl p-6 border border-[#7e246c]/20">
      <div className="text-lg font-bold text-[#7e246c] dark:text-white mb-2">Total Amount</div>
      <div className="text-4xl font-black text-[#7e246c] dark:text-white">{car.currency} {Math.round(totalAmount).toLocaleString()}</div>
    </div>
  );
}

const BookingForm: React.FC<BookingFormProps> = ({ car, user, onBooking, error, success, userBookings, rentalType, numberOfDays, setNumberOfDays, onMessageStore, pickupDate, setPickupDate, pickupTime, setPickupTime, selectedAddress, setSelectedAddress, selectedLatLng, setSelectedLatLng, refillTank }) => {
  const { success: showSuccess, error: showError } = useToast();
  // pickupAddress, pickupTime, pickupDate, selectedAddress, selectedLatLng are now controlled by parent
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const searchBoxRef = React.useRef<google.maps.places.SearchBox | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [bookAsGuest, setBookAsGuest] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestBookingStatus, setGuestBookingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [guestBookingError, setGuestBookingError] = useState<string | null>(null);
  const [guestBookingSuccess, setGuestBookingSuccess] = useState<string | null>(null);



  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  });



    // Handler for map click
  const handleMapClick = (data: { lat: number; lng: number; address?: string }) => {
    setSelectedLatLng({ lat: data.lat, lng: data.lng });
    if (data.address) {
      setSelectedAddress(data.address);
    }
  };

  // Handler for place search
  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      setSelectedLatLng({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      setSelectedAddress(place.formatted_address || '');
    }
  };

  // Calculate price based on rental type, number of days, and refill tank
  const dailyPrice = rentalType === 'with_driver'
    ? (car && typeof car.withDriver === 'number' ? car.withDriver : 0)
    : (car && typeof car.rental === 'number' ? car.rental : 0);
  // If refill tank affects price, add logic here. For now, just show as option.
  const totalAmount = dailyPrice * numberOfDays;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setButtonLoading(true);
    // Frontend validation for start date and time
    const now = new Date();
    const selectedDateTime = new Date(`${pickupDate}T${pickupTime}`);
    if (isNaN(selectedDateTime.getTime())) {
      setValidationError('Please enter a valid pickup date and time.');
      setButtonLoading(false);
      return;
    }
    if (selectedDateTime <= now) {
      setValidationError('Start date and time must be in the future.');
      setButtonLoading(false);
      return;
    }
    if (!user && bookAsGuest) {
      if (!guestName.trim()) {
        setValidationError('Please enter your name.');
        setButtonLoading(false);
        return;
      }
      if (!guestPhone.trim()) {
        setValidationError('Please enter your phone number.');
        setButtonLoading(false);
        return;
      }
    }
    await onBooking({
      car_id: car.id,
      pickup_location: selectedAddress,
      pickup_time: pickupTime,
      pickup_date: pickupDate,
      rental_type: rentalType,
      refill_tank: refillTank,
      number_of_days: numberOfDays,
      total_price: totalAmount,
      notes,
      car_offer_id: car.offer && typeof (car.offer as { id: number }).id === 'number' ? (car.offer as { id: number }).id : null,
      ...(bookAsGuest ? { guest_name: guestName, guest_phone: guestPhone } : {}),
    });
    setButtonLoading(false);
  };

  const handleGuestBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setGuestBookingError(null);
    setGuestBookingSuccess(null);
    setGuestBookingStatus('sending');
    // Validate guest fields
    if (!guestName.trim()) {
      setValidationError('Please enter your name.');
      setGuestBookingStatus('idle');
      return;
    }
    if (!guestPhone.trim()) {
      setValidationError('Please enter your phone number.');
      setGuestBookingStatus('idle');
      return;
    }
    if (!selectedAddress) {
      setValidationError('Please select an address.');
      setGuestBookingStatus('idle');
      return;
    }
    if (!pickupDate) {
      setValidationError('Please select a pickup date.');
      setGuestBookingStatus('idle');
      return;
    }
    if (!pickupTime) {
      setValidationError('Please select a pickup time.');
      setGuestBookingStatus('idle');
      return;
    }
    // Calculate price
    const dailyPrice = rentalType === 'with_driver'
      ? (car && typeof car.withDriver === 'number' ? car.withDriver : 0)
      : (car && typeof car.rental === 'number' ? car.rental : 0);
    const totalAmount = dailyPrice * numberOfDays;
    try {
      const res = await fetch('/api/guest-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_id: car.id,
          guest_name: guestName,
          guest_phone: guestPhone,
          notes,
          number_of_days: numberOfDays,
          refill_tank: refillTank,
          pickup_location: selectedAddress,
          rental_type: rentalType,
          total_price: totalAmount,
          pickup_time: pickupTime,
          pickup_date: pickupDate,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setGuestBookingStatus('error');
        setGuestBookingError(data.message || 'Failed to book as guest.');
        showError('Guest Booking Failed', data.message || 'Failed to create booking. Please try again.');
      } else {
        setGuestBookingStatus('success');
        setGuestBookingSuccess('Booking successful!');
        showSuccess('Guest Booking Successful', 'Your booking request has been sent successfully!');
        setGuestName('');
        setGuestPhone('');
        setNotes('');
      }
    } catch {
      setGuestBookingStatus('error');
      setGuestBookingError('Network error.');
      showError('Network Error', 'Unable to connect. Please check your internet connection and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div>
        <h3 className="text-lg font-semibold text-[#7e246c] dark:text-white mb-4 text-center md:text-left">Pick-up & Drop-off Details</h3>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#7e246c]/40 shadow-lg flex flex-col gap-8">
          {/* Pick-up */}
          <div>
              <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-[#7e246c]" />
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">Pick-up Detail</span>
              </div>
              <div
                  className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-4 border border-[#7e246c]/30">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={selectedAddress}
                      readOnly
                      className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition cursor-pointer"
                      placeholder="Pick-up address"
                      onClick={() => setAddressModalOpen(true)}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-[#7e246c] text-white rounded hover:bg-[#6a1f5c]"
                      onClick={() => setAddressModalOpen(true)}
                      title="Select address on map"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Address Selection Modal */}
                  <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Select Address</DialogTitle>
                      </DialogHeader>
                      {!isLoaded ? (
                        <div>Loading map...</div>
                      ) : (
                        <>
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <StandaloneSearchBox
                              onLoad={ref => (searchBoxRef.current = ref)}
                              onPlacesChanged={() => {
                                const searchBox = searchBoxRef.current;
                                if (searchBox) {
                                  const places = searchBox.getPlaces();
                                  if (places && places.length > 0) {
                                    const place = places[0];
                                    if (place.geometry && place.geometry.location) {
                                      setSelectedLatLng({
                                        lat: place.geometry.location.lat(),
                                        lng: place.geometry.location.lng(),
                                      });
                                      setSelectedAddress(place.formatted_address || '');
                                    }
                                  }
                                }
                              }}
                            >
                              <Input
                                value={selectedAddress}
                                onChange={e => setSelectedAddress(e.target.value)}
                                placeholder="Search or select address on map"
                              />
                            </StandaloneSearchBox>
                          </div>
                          <div className="mb-4">
                            <GoogleMap
                              showSearchBox={false}
                              markerPosition={selectedLatLng || undefined}
                              onMapClick={handleMapClick}
                              onPlaceSelected={handlePlaceSelected}
                            />
                          </div>
                          {selectedLatLng && (
                            <div className="text-xs text-gray-500 mb-2">Lat: {selectedLatLng.lat}, Lng: {selectedLatLng.lng}</div>
                          )}
                          <button
                            className="mt-2 px-4 py-2 bg-[#7e246c] text-white rounded hover:bg-[#6a1f5c]"
                            type="button"
                            onClick={() => {
                              setSelectedAddress(selectedAddress);
                              setAddressModalOpen(false);
                            }}
                          >
                            Save Address
                          </button>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                  <div className="flex flex-col gap-4 md:flex-row md:gap-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Clock className="text-[#7e246c]" />
                          <input
                              type="time"
                              value={pickupTime}
                              onChange={e => setPickupTime(e.target.value)}
                              className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                          />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Calendar className="text-[#7e246c]" />
                          <input
                              type="date"
                              value={pickupDate}
                              onChange={e => setPickupDate(e.target.value)}
                              className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                          />
                      </div>
                  </div>
                  <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition mt-2"
                      placeholder="Notes (optional)"
                      rows={3}
                  />
              </div>
          </div>
          {/* Number of Days */}
          <div className="flex flex-col gap-2 mt-6">
              <label htmlFor="numberOfDays" className="font-semibold text-[#7e246c]">No. of Days</label>
              <input
                  id="numberOfDays"
                  type="number"
                  min={1}
                  value={numberOfDays}
                  onChange={e => setNumberOfDays(Number(e.target.value) || 1)}
                  className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
              />
          </div>
      </div>
      {/* Price Display - always above the button */}
      <div
          className="mt-2 bg-gradient-to-r from-[#7e246c]/10 to-purple-500/10 dark:from-[#7e246c]/20 dark:to-purple-500/20 rounded-xl p-6 border border-[#7e246c]/20">
          <div className="text-lg font-bold text-[#7e246c] dark:text-white mb-2">Total Amount</div>
          <div
              className="text-4xl font-black text-[#7e246c] dark:text-white">{car.currency} {Math.round(totalAmount).toLocaleString()}</div>
      </div>


{/* Book as Guest checkbox and fields for guests */}
{!user && (
  <div className="mb-4 flex flex-col gap-2">
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={bookAsGuest}
        onChange={e => setBookAsGuest(e.target.checked)}
        className="accent-[#7e246c] mt-3 h-5 w-5 rounded"
      />
      <span className="mt-3 font-semibold text-[#7e246c]">Book as guest</span>
    </label>
    {bookAsGuest && (
      <>
        <input
          type="text"
          value={guestName}
          onChange={e => setGuestName(e.target.value)}
          className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-900 px-4 py-2"
          placeholder="Your Name"
          required
        />
        <input
          type="text"
          value={guestPhone}
          onChange={e => setGuestPhone(e.target.value)}
          className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-900 px-4 py-2"
          placeholder="Phone Number"
          required
        />
      </>
    )}
  </div>
)}

      <div className="flex gap-4 mt-6 flex-col">
          {user ? (
              <>
                  <button
                      type="submit"
                      className={`w-full py-3 rounded-md bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition ${buttonLoading ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
                      disabled={buttonLoading}
                  >
                      {buttonLoading ? (
                          <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                       viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                   strokeWidth="4"></circle><path className="opacity-75"
                                                                                  fill="currentColor"
                                                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Loading...
                </span>
                          ) : (
                              userBookings.length > 0 ? 'Create Another Booking' : 'Confirm Booking'
                          )}
                      </button>
                      {/* Message Store button below booking button */}
                      {onMessageStore && (
                        <button
                          type="button"
                          className="w-full py-3 rounded-md bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition mt-2"
                          onClick={onMessageStore}
                        >
                          Message Store
                        </button>
                      )}
                      {validationError && <div className="text-red-600 mt-2 font-semibold">{validationError}</div>}
                      {error && <div className="text-red-600 mt-2 font-semibold">{error}</div>}
                      {success && <div className="text-green-600 mt-2 font-semibold text-center">{success}</div>}
                  </>
              ) : (
                <>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className={`w-full py-3 rounded-md font-semibold transition ${bookAsGuest ? 'bg-[#7e246c] text-white hover:bg-[#6a1f5c]' : 'bg-[#7e246c]/60 text-white/60 cursor-not-allowed'}`}
                    disabled={buttonLoading || !bookAsGuest}
                    onClick={bookAsGuest ? handleGuestBooking : undefined}
                  >
                    {guestBookingStatus === 'sending' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        Booking...
                      </span>
                    ) : (
                      'Book as Guest'
                    )}
                  </button>
                  <Link
                    to="/login"
                    className={`w-full py-3 rounded-md text-center font-semibold transition ${bookAsGuest ? 'bg-[#7e246c]/60 text-white/60 cursor-not-allowed' : 'bg-[#7e246c] text-white hover:bg-[#6a1f5c]'}`}
                    tabIndex={bookAsGuest ? -1 : 0}
                    aria-disabled={bookAsGuest ? 'true' : 'false'}
                    onClick={e => { if (bookAsGuest) e.preventDefault(); }}
                  >
                    Please Login to Book
                  </Link>
                </div>
                {validationError && <div className="text-red-600 mt-2 font-semibold">{validationError}</div>}
                {guestBookingError && <div className="text-red-600 mt-2 font-semibold">{guestBookingError}</div>}
                {guestBookingSuccess && <div className="text-green-600 mt-2 font-semibold text-center">{guestBookingSuccess}</div>}
                {error && <div className="text-red-600 mt-2 font-semibold">{error}</div>}
                {success && <div className="text-green-600 mt-2 font-semibold text-center">{success}</div>}
                </>
              )}
          </div>
      </div>
    </form>
  );
};

export default BookingForm;
