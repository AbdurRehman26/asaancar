import React, { useState, useEffect, useState as useReactState } from 'react';
import { useParams } from 'react-router-dom';
// import { Fuel } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import Navbar from '../components/navbar';
import { apiFetch } from '@/lib/utils';
import Chat from '../components/chat';
import BookingForm from '../components/BookingForm';
import UserBookingsList from '../components/UserBookingsList';
import GoogleMap from '../components/GoogleMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { StandaloneSearchBox } from '@react-google-maps/api';
import { User, Phone, FileText, Calendar, MapPin, Car, CheckCircle, XCircle } from 'lucide-react';

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
  const { id } = useParams<{ id: string }>();
  const carId = id || 'N/A';
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [rentalType, setRentalType] = useState<'with_driver' | 'without_driver'>('without_driver');
  const [numberOfDays, setNumberOfDays] = useState<number>(1);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedLatLng, setSelectedLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('');
  const searchBoxRef = React.useRef<google.maps.places.SearchBox | null>(null);
    // Inquiry box state
    const [inquiry, setInquiry] = useReactState({ name: '', contact: '', message: '' });
    const [inquiryStatus, setInquiryStatus] = useReactState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [inquiryError, setInquiryError] = useReactState<string | null>(null);

    // Guest booking modal state
    const [guestModalOpen, setGuestModalOpen] = useState(false);
    const [guestBooking, setGuestBooking] = useState({
      name: '',
      phone: '',
      note: '',
      numberOfDays: 1,
      refillTank: false,
      address: selectedAddress,
      rentalType: 'without_driver',
      addressModalOpen: false,
      addressLatLng: selectedLatLng,
      pickupDate: pickupDate,
      pickupTime: pickupTime,
    });
    const [guestBookingStatus, setGuestBookingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [guestBookingError, setGuestBookingError] = useState<string | null>(null);

    // Calculate guest booking price
    const guestDailyPrice = guestBooking.rentalType === 'with_driver'
      ? (car && typeof car.withDriver === 'number' ? car.withDriver : 0)
      : (car && typeof car.rental === 'number' ? car.rental : 0);

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

  const fetchCarAndBooking = async () => {
    console.log('Calling booking API for car:', carId);
    if (!carId) return;
    setLoading(true);
    try {
      const carRes = await apiFetch(`/api/customer/cars/${carId}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId]);

  useEffect(() => {
    if (user && loginOpen) {
      setLoginOpen(false);
    }
  }, [user, loginOpen]);

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">Loading car details...</div>);
  }
  if (!car) {
    return (<div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-gray-600">Car not found.</div>);
  }


    const handleInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInquiry({ ...inquiry, [e.target.name]: e.target.value });
    };

    const handleInquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInquiryStatus('sending');
        setInquiryError(null);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: inquiry.name,
                    email: inquiry.contact, // backend expects email, allow phone in this field
                    message: inquiry.message,
                    store_id: car.store_id || null,
                    car_details: car ? { id: car.id, name: car.name } : null,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setInquiryStatus('error');
                setInquiryError(data.message || 'Failed to send inquiry.');
            } else {
                setInquiryStatus('success');
                setInquiry({ name: '', contact: '', message: '' });
            }
        } catch {
            setInquiryStatus('error');
            setInquiryError('Network error.');
        }
    };

  // Handle guest booking change
  const handleGuestBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setGuestBooking(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'numberOfDays' ? Number(value) : value),
    }));
  };

  // Handle guest booking submit
  const handleGuestBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestBookingStatus('sending');
    setGuestBookingError(null);
    try {
      const res = await fetch('/api/guest-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_id: car.id,
          guest_name: guestBooking.name,
          guest_phone: guestBooking.phone,
          notes: guestBooking.note,
          number_of_days: numberOfDays,
          refill_tank: guestBooking.refillTank,
          pickup_location: guestBooking.address,
          rental_type: guestBooking.rentalType,
          total_price: guestDailyPrice * (numberOfDays || 1),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setGuestBookingStatus('error');
        setGuestBookingError(data.message || 'Failed to book as guest.');
      } else {
        setGuestBookingStatus('success');
        setGuestBooking(prev => ({
          ...prev,
          name: '',
          phone: '',
          note: '',
          numberOfDays: 1,
          refillTank: false,
          address: '',
          rentalType: 'without_driver',
          addressModalOpen: false,
          addressLatLng: null,
          pickupDate,
          pickupTime,
        }));
      }
    } catch {
      setGuestBookingStatus('error');
      setGuestBookingError('Network error.');
    }
  };

  return (
      <>
          <div className="mt-17 min-h-screen bg-neutral-50 dark:bg-gray-900">
              {/* Navbar */}
              <Navbar auth={{ user }} />
              <div className="px-2 py-10 md:px-8">
                  <div className="mb-2 text-xs text-gray-400 dark:text-neutral-400">Car ID: {carId}</div>
                  <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-lg md:flex-row dark:bg-gray-800/80">
                      {/* Left: Car Image & Rate Details */}
                      <div className="flex flex-col gap-8 p-8 md:w-1/2">
                          <div className="flex items-center justify-center">
                              <img
                                  src={car.image || '/images/car-placeholder.jpeg'}
                                  alt={car.name}
                                  className="h-56 rounded-xl bg-gray-50 object-contain dark:bg-neutral-800"
                              />
                          </div>
                          <a
                              href="/cars"
                              className="block text-center text-2xl font-bold text-[#7e246c] transition hover:text-[#6a1f5c] dark:text-white dark:hover:text-gray-200"
                          >
                              {car.name}
                          </a>

                          <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
                              <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                      <DialogTitle>Select Address</DialogTitle>
                                  </DialogHeader>
                                  <div className="mb-4">
                                      <label className="mb-1 block text-sm font-medium">Address</label>
                                      <StandaloneSearchBox
                                          onLoad={(ref) => (searchBoxRef.current = ref)}
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
                                              onChange={(e) => setSelectedAddress(e.target.value)}
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
                                      <div className="mb-2 text-xs text-gray-500">
                                          Lat: {selectedLatLng.lat}, Lng: {selectedLatLng.lng}
                                      </div>
                                  )}
                                  <button
                                      className="mt-2 rounded bg-[#7e246c] px-4 py-2 text-white hover:bg-[#6a1f5c]"
                                      onClick={() => setAddressModalOpen(false)}
                                  >
                                      Save Address
                                  </button>
                              </DialogContent>
                          </Dialog>
                          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
                              <h3 className="mb-4 text-lg font-bold text-[#7e246c] dark:text-white">Rate Details</h3>
                              <table className="w-full text-sm">
                                  <thead>
                                      <tr className="border-b border-gray-200 font-semibold text-[#7e246c] dark:border-gray-700 dark:text-white">
                                          <th className="pb-3 text-left">Type</th>
                                          <th className="pb-3">Hours/Day</th>
                                          <th className="pb-3 text-right">Amount</th>
                                      </tr>
                                  </thead>
                                  <tbody className="text-gray-700 dark:text-gray-300">
                                      <tr className="border-b border-gray-100 dark:border-gray-800">
                                          <td className="py-3 font-medium">With Driver</td>
                                          <td className="py-3 text-center font-semibold">10 hrs/day</td>
                                          <td className="py-3 text-right font-bold text-[#7e246c] dark:text-white">
                                              {car.currency} {typeof car.withDriver === 'number' ? car.withDriver.toLocaleString() : 'N/A'}
                                          </td>
                                      </tr>
                                      <tr>
                                          <td className="py-3 font-medium">Without Driver</td>
                                          <td className="py-3 text-center font-semibold">24 hrs/day</td>
                                          <td className="py-3 text-right font-bold text-[#7e246c] dark:text-white">
                                              {car.currency} {typeof car.rental === 'number' ? car.rental.toLocaleString() : 'N/A'}
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                              <div className="mt-4 text-sm font-semibold text-[#7e246c] dark:text-white">
                                  Refill fuel at the end of the day or pay <span className="font-bold">PKR 32/KM</span>
                              </div>
                              <div className="mt-1 text-sm font-semibold text-[#7e246c] dark:text-white">
                                  Overtime: <span className="font-bold">PKR 400/hr</span>
                              </div>
                          </div>
                          <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                              <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#7e246c]">
                                  <span className="text-xs font-bold text-white">i</span>
                              </div>
                              <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                  Kindly note that the Fuel Charges and Overtime will be applied based on the mileage of the car and extra hours of
                                  the services (if any). Your final invoice will be generated after adding the Fuel and Overtime charges at the end of
                                  your reservation. For more details please read the{' '}
                                  <a href="#" className="text-[#7e246c] underline dark:text-white">
                                      Fuel and Overtime charges and terms of use
                                  </a>
                                  .
                              </span>
                          </div>

                          {!user && (
                              <div className="mt-8 rounded-xl border border-[#7e246c]/30 bg-white p-6 shadow dark:bg-gray-900">
                                  <h3 className="mb-4 text-lg font-bold text-[#7e246c]">Send an Inquiry to Store Owner</h3>
                                  <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4">
                                      <input
                                          type="text"
                                          name="name"
                                          value={inquiry.name}
                                          onChange={handleInquiryChange}
                                          className="rounded-lg border-2 border-[#7e246c] px-4 py-2"
                                          placeholder="Your Name"
                                          required
                                      />
                                      <input
                                          type="text"
                                          name="contact"
                                          value={inquiry.contact}
                                          onChange={handleInquiryChange}
                                          className="rounded-lg border-2 border-[#7e246c] px-4 py-2"
                                          placeholder="Email or Phone Number"
                                          required
                                      />
                                      <textarea
                                          name="message"
                                          value={inquiry.message}
                                          onChange={handleInquiryChange}
                                          className="rounded-lg border-2 border-[#7e246c] px-4 py-2"
                                          placeholder="Your Message"
                                          rows={4}
                                          required
                                      />
                                      <button
                                          type="submit"
                                          className="rounded bg-[#7e246c] px-6 py-2 font-semibold text-white transition hover:bg-[#6a1f5c]"
                                          disabled={inquiryStatus === 'sending'}
                                      >
                                          {inquiryStatus === 'sending' ? 'Sending...' : 'Send Inquiry'}
                                      </button>
                                      {inquiryStatus === 'success' && <div className="font-semibold text-green-600">Inquiry sent successfully!</div>}
                                      {inquiryStatus === 'error' && <div className="font-semibold text-red-600">{inquiryError}</div>}
                                  </form>
                              </div>
                          )}
                      </div>
                      {/* Right: BookingForm, Price, Optional Service */}
                      <div className="flex flex-col gap-8 border-l border-gray-100 bg-white p-8 md:w-1/2 dark:border-neutral-800 dark:bg-gray-800/80">
                          {car && (
                              <>
                                  <BookingForm
                                      car={car}
                                      user={user ?? undefined}
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
                                      error={error}
                                      success={success}
                                      userBookings={userBookings}
                                      rentalType={rentalType}
                                      setRentalType={setRentalType}
                                      numberOfDays={numberOfDays}
                                      setNumberOfDays={setNumberOfDays}
                                      onMessageStore={async () => {
                                          if (!user || !car?.store?.id) return;

                                          const storeId = car.store!.id;
                                          try {
                                              const res = await apiFetch('/api/chat/conversations');
                                              const data: Array<{ id: number; type: string; store_id: number }> = await res.json();
                                              const conv = data.find((c) => c.type === 'store' && String(c.store_id) === String(storeId));
                                              if (conv) {
                                                  setConversationId(conv.id);
                                                  setShowChat(true);
                                                  setChatError(null);
                                              } else {
                                                  const createRes = await apiFetch('/api/chat/conversations', {
                                                      method: 'POST',
                                                      body: JSON.stringify({ type: 'store', store_id: storeId }),
                                                  });
                                                  const newConv = await createRes.json();
                                                  if (newConv && newConv.id) {
                                                      setConversationId(newConv.id);
                                                      setShowChat(true);
                                                      setChatError(null);
                                                  } else {
                                                      setShowChat(true);
                                                      setConversationId(null);
                                                      setChatError('Could not start chat. Please try again later.');
                                                  }
                                              }
                                          } catch {
                                              setShowChat(true);
                                              setConversationId(null);
                                              setChatError('Could not start chat. Please try again later.');
                                          }
                                      }}
                                      pickupDate={pickupDate}
                                      setPickupDate={setPickupDate}
                                      pickupTime={pickupTime}
                                      setPickupTime={setPickupTime}
                                      selectedAddress={selectedAddress}
                                      setSelectedAddress={setSelectedAddress}
                                      selectedLatLng={selectedLatLng}
                                      setSelectedLatLng={setSelectedLatLng}
                                  />
                                  {/* Guest booking section below pickup details */}
                                  {!user && (
                                      <>
                                          <button
                                              className="mt-4 w-full rounded bg-[#7e246c] px-4 py-2 font-semibold text-white transition hover:bg-[#6a1f5c]"
                                              onClick={() => {
                                                  setGuestBooking((prev) => ({
                                                      ...prev,
                                                      address: selectedAddress,
                                                      addressLatLng: selectedLatLng,
                                                      pickupDate,
                                                      pickupTime,
                                                  }));
                                                  setGuestModalOpen(true);
                                              }}
                                          >
                                              Book as Guest
                                          </button>
                                          <Dialog open={guestModalOpen} onOpenChange={setGuestModalOpen}>
                                              <DialogContent className="max-w-md">
                                                  <DialogHeader>
                                                      <DialogTitle>Book as Guest</DialogTitle>
                                                  </DialogHeader>
                                                  {/* Car Rate Details */}
                                                  <div className="mb-4">
                                                      <h3 className="mb-2 text-lg font-bold text-[#7e246c]">Rate Details</h3>
                                                      <table className="mb-2 w-full text-sm">
                                                          <tbody>
                                                              <tr>
                                                                  <td className="py-1 font-medium">With Driver</td>
                                                                  <td className="py-1 text-right font-bold text-[#7e246c]">
                                                                      {car.currency}{' '}
                                                                      {typeof car.withDriver === 'number' ? car.withDriver.toLocaleString() : 'N/A'}
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td className="py-1 font-medium">Without Driver</td>
                                                                  <td className="py-1 text-right font-bold text-[#7e246c]">
                                                                      {car.currency}{' '}
                                                                      {typeof car.rental === 'number' ? car.rental.toLocaleString() : 'N/A'}
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </div>
                                                  <form onSubmit={handleGuestBookingSubmit} className="flex flex-col gap-4">
                                                      <div className="mb-4 flex flex-col gap-4">
                                                          <div className="flex items-center gap-2">
                                                              <User className="h-4 w-4 text-[#7e246c]" />
                                                              <input
                                                                  type="text"
                                                                  name="name"
                                                                  value={guestBooking.name}
                                                                  onChange={handleGuestBookingChange}
                                                                  className="w-full rounded-lg border-2 border-[#7e246c] bg-white px-4 py-2 dark:bg-gray-900"
                                                                  placeholder="Your Name"
                                                                  required
                                                              />
                                                          </div>
                                                          <div className="flex items-center gap-2">
                                                              <Phone className="h-4 w-4 text-[#7e246c]" />
                                                              <input
                                                                  type="text"
                                                                  name="phone"
                                                                  value={guestBooking.phone}
                                                                  onChange={handleGuestBookingChange}
                                                                  className="w-full rounded-lg border-2 border-[#7e246c] bg-white px-4 py-2 dark:bg-gray-900"
                                                                  placeholder="Phone Number"
                                                                  required
                                                              />
                                                          </div>
                                                          <div className="flex items-center gap-2">
                                                              {guestBooking.refillTank ? (
                                                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                                              ) : (
                                                                  <XCircle className="h-4 w-4 text-red-500" />
                                                              )}
                                                              <span>
                                                                  Refill Tank:{' '}
                                                                  <span className={guestBooking.refillTank ? 'text-green-600' : 'text-red-500'}>
                                                                      {guestBooking.refillTank ? 'Yes' : 'No'}
                                                                  </span>
                                                              </span>
                                                          </div>
                                                      </div>
                                                      <div className="mt-2 rounded-2xl border-2 border-[#7e246c] bg-gradient-to-br from-[#f3e8ff] to-[#e0e7ff] p-6 shadow-lg dark:from-[#2d1a3a] dark:to-[#232946]">
                                                          <div className="mb-3 flex items-center gap-2">
                                                              <Car className="h-5 w-5 text-[#7e246c]" />
                                                              <span className="text-lg font-bold text-[#7e246c]">Booking Preview</span>
                                                          </div>
                                                          <div className="mb-1 flex items-center gap-2 text-base">
                                                              <User className="h-4 w-4 text-[#7e246c]" />
                                                              <span className="font-semibold">Name:</span> {guestBooking.name}
                                                          </div>
                                                          <div className="mb-1 flex items-center gap-2 text-base">
                                                              <Phone className="h-4 w-4 text-[#7e246c]" />
                                                              <span className="font-semibold">Phone:</span> {guestBooking.phone}
                                                          </div>
                                                          <div className="mb-1 flex items-center gap-2 text-base">
                                                              <FileText className="h-4 w-4 text-[#7e246c]" />
                                                              <span className="font-semibold">Note:</span> {guestBooking.note || 'None'}
                                                          </div>
                                                          <div className="mb-1 flex items-center gap-2 text-base">
                                                              <Calendar className="h-4 w-4 text-[#7e246c]" />
                                                              <span className="font-semibold">Pickup Date:</span>{' '}
                                                              {guestBooking.pickupDate || 'Not selected'}
                                                              <span className="ml-4 font-semibold">Time:</span>{' '}
                                                              {guestBooking.pickupTime || 'Not selected'}
                                                          </div>
                                                          <div className="mb-1 flex items-center gap-2 text-base">
                                                              <Calendar className="h-4 w-4 text-[#7e246c]" />
                                                              <span className="font-semibold">Number of Days:</span> {numberOfDays}
                                                          </div>
                                                          <div className="mb-1 flex items-center gap-2 text-base">
                                                              {guestBooking.refillTank ? (
                                                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                                              ) : (
                                                                  <XCircle className="h-4 w-4 text-red-500" />
                                                              )}
                                                              <span>
                                                                  Refill Tank:{' '}
                                                                  <span className={guestBooking.refillTank ? 'text-green-600' : 'text-red-500'}>
                                                                      {guestBooking.refillTank ? 'Yes' : 'No'}
                                                                  </span>
                                                              </span>
                                                          </div>
                                                          <div className="mb-1 flex items-center gap-2 text-base">
                                                              <MapPin className="h-4 w-4 text-[#7e246c]" />
                                                              <span>Address:</span>{' '}
                                                              <span className="truncate">{guestBooking.address || 'Not selected'}</span>
                                                          </div>
                                                          <div className="mt-4 flex items-center gap-2">
                                                              <span className="text-2xl font-extrabold text-[#7e246c]">
                                                                  {guestBooking.rentalType == 'with_driver' ? 'With Driver' : 'Without Driver'}
                                                              </span>
                                                          </div>
                                                          <div className="mt-4 flex items-center gap-2">
                                                              <span className="text-2xl font-extrabold text-[#7e246c]">
                                                                  {car.currency ?? 'PKR'} {guestDailyPrice * numberOfDays}
                                                              </span>
                                                          </div>
                                                      </div>
                                                      <button
                                                          type="submit"
                                                          className="rounded bg-[#7e246c] px-6 py-2 font-semibold text-white transition hover:bg-[#6a1f5c]"
                                                          disabled={guestBookingStatus === 'sending'}
                                                      >
                                                          {guestBookingStatus === 'sending' ? 'Booking...' : 'Book as Guest'}
                                                      </button>
                                                      {guestBookingStatus === 'success' && (
                                                          <div className="font-semibold text-green-600">Booking successful!</div>
                                                      )}
                                                      {guestBookingStatus === 'error' && (
                                                          <div className="font-semibold text-red-600">{guestBookingError}</div>
                                                      )}
                                                  </form>
                                              </DialogContent>
                                          </Dialog>
                                      </>
                                  )}
                              </>
                          )}
                      </div>
                  </div>
              </div>
          </div>

          {/* Floating Chat Widget */}
          {showChat && user && (
              <div className="fixed right-6 bottom-6 z-50 flex h-[500px] w-96 max-w-full flex-col rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
                  <div className="flex items-center justify-between rounded-t-xl bg-[#7e246c] px-4 py-2">
                      <span className="font-semibold text-white">Store Chat</span>
                      <button onClick={() => setShowChat(false)} className="text-xl font-bold text-white">
                          &times;
                      </button>
                  </div>
                  <div className="min-h-0 flex-1">
                      {chatError ? (
                          <div className="flex h-full items-center justify-center px-4 text-center text-red-400">{chatError}</div>
                      ) : typeof conversationId === 'number' ? (
                          <Chat conversationId={conversationId} currentUser={user} />
                      ) : (
                          <div className="flex h-full items-center justify-center text-gray-300">No conversation selected.</div>
                      )}
                  </div>
              </div>
          )}

          {car && <UserBookingsList userBookings={userBookings} car={car} />}
      </>
  );
}
