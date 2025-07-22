import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { Fuel } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import Navbar from '../components/navbar';
import { apiFetch } from '@/lib/utils';
import Chat from '../components/chat';
import BookingForm from '../components/BookingForm';
import UserBookingsList from '../components/UserBookingsList';
import GoogleMap from '../components/GoogleMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { StandaloneSearchBox } from '@react-google-maps/api';

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
  const searchBoxRef = React.useRef<google.maps.places.SearchBox | null>(null);

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

  // Geocode address to lat/lng
  const geocodeAddress = (address: string) => {
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const loc = results[0].geometry.location;
        setSelectedLatLng({ lat: loc.lat(), lng: loc.lng() });
        setSelectedAddress(results[0].formatted_address || address);
      }
    });
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
  return (
    <>
      <div className="min-h-screen bg-neutral-50 mt-17 dark:bg-gray-900">
        {/* Navbar */}
        <Navbar auth={{ user }} />
        <div className="py-10 px-2 md:px-8">
          <div className="text-xs text-gray-400 dark:text-neutral-400 mb-2">Car ID: {carId}</div>
          <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800/80 rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
            {/* Left: Car Image & Rate Details */}
            <div className="md:w-1/2 p-8 flex flex-col gap-8">
              <div className="flex justify-center items-center">
                <img src={car.image || '/images/car-placeholder.jpeg'} alt={car.name} className="h-56 object-contain rounded-xl bg-gray-50 dark:bg-neutral-800" />
              </div>
              <a href="/cars" className="text-2xl font-bold text-[#7e246c] dark:text-white text-center block hover:text-[#6a1f5c] dark:hover:text-gray-200 transition">{car.name}</a>
              {/* Address Selection Modal */}
              <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Select Address</DialogTitle>
                  </DialogHeader>
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
                    onClick={() => setAddressModalOpen(false)}
                  >
                    Save Address
                  </button>
                </DialogContent>
              </Dialog>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-[#7e246c] dark:text-white mb-4">Rate Details</h3>
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
              <div className="flex items-start gap-3 mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="w-5 h-5 rounded-full bg-[#7e246c] flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Kindly note that the Fuel Charges and Overtime will be applied based on the mileage of the car and extra hours of the services (if any). Your final invoice will be generated after adding the Fuel and Overtime charges at the end of your reservation. For more details please read the <a href="#" className="underline text-[#7e246c] dark:text-white">Fuel and Overtime charges and terms of use</a>.
                </span>
              </div>
            </div>
            {/* Right: BookingForm, Price, Optional Service */}
            <div className="md:w-1/2 p-8 flex flex-col gap-8 bg-white dark:bg-gray-800/80 border-l border-gray-100 dark:border-neutral-800">
              {car && (
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
                />
              )}
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

    {car && <UserBookingsList userBookings={userBookings} car={car} />}
    </>
  );
}
