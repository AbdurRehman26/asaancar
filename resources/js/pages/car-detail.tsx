import React, { useState, useEffect, useState as useReactState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { apiFetch } from '@/lib/utils';
import Chat from '../components/chat';
import BookingForm from '../components/BookingForm';
import UserBookingsList from '../components/UserBookingsList';
import GoogleMap from '../components/GoogleMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { StandaloneSearchBox } from '@react-google-maps/api';
import { Car } from 'lucide-react';
import ImageGalleryModal from '../components/ImageGalleryModal';

interface Car {
  id: number;
  name: string;
  image?: string;
  images?: string[];
  brand?: string;
  carModel?: {
    id: number;
    name: string;
    slug: string;
    image?: string;
  };
  specifications?: {
    seats?: number;
    fuelType?: string;
    transmission?: string;
    type?: string;
  };
  features?: string[];
  minAge?: number;
  currency?: string;
  rental?: number;
  withDriver?: number;
  baseFare?: number;
  fuel?: number;
  overtime?: number;
  store_id?: number;
  store?: {
    id: number;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    rating?: number;
    reviews?: number;
    description?: string;
    logo_url?: string;
  };
  price?: {
    perDay?: {
      withoutDriver?: number;
      withDriver?: number;
    };
    currency?: string;
  };
  withoutDriver?: number;
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
  const { id: carId } = useParams<{ id: string }>();
  const { success: showSuccess, error: showError } = useToast();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedLatLng, setSelectedLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [rentalType, setRentalType] = useState<'without_driver' | 'with_driver'>('without_driver');
  const [refillTank, setRefillTank] = useState(false);

  // Inquiry state
  const [inquiry, setInquiry] = useReactState({ name: '', contact: '', message: '' });
  const [inquiryStatus, setInquiryStatus] = useReactState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [inquiryError, setInquiryError] = useReactState<string | null>(null);

  // Address modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const searchBoxRef = React.useRef<google.maps.places.SearchBox | null>(null);

  // Get brand image path
  const getBrandImagePath = (brandName: string) => {
    return `/images/car-brands/${brandName.toLowerCase()}.png`;
  };

  // Get primary image with fallback logic
  const getPrimaryImage = () => {
    // 1. First try car's main image
    if (car?.image) {
      return car.image.startsWith('/') ? car.image : `/${car.image}`;
    }

    // 2. Then try car model image
    if (car?.carModel?.image) {
      return car.carModel.image.startsWith('/') ? car.carModel.image : `/${car.carModel.image}`;
    }

    // 3. Then try brand image
    if (car?.brand) {
      return getBrandImagePath(car.brand);
    }

    // 4. Final fallback to placeholder
    return '/images/car-placeholder.jpeg';
  };

  // Check if car has multiple images
  const hasMultipleImages = car?.images && car.images.length > 1;
  const allImages = car?.images && car.images.length > 0 ? car.images : [getPrimaryImage()];

  // Handle image error - fallback to car model image, then brand image, then placeholder
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;

    // First try car model image
    if (car?.carModel?.image && target.src !== car.carModel.image) {
      const modelImagePath = car.carModel.image.startsWith('/') ? car.carModel.image : `/${car.carModel.image}`;
      target.src = modelImagePath;
      return;
    }

    // Then try brand image
    const brandName = car?.brand;
    if (brandName && typeof brandName === 'string') {
      const brandImagePath = getBrandImagePath(brandName);
      if (target.src !== brandImagePath) {
        target.src = brandImagePath;
        return;
      }
    }

    // Final fallback to placeholder
    target.src = '/images/car-placeholder.jpeg';
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId]);

  // Set default rental type based on available pricing (prefer without_driver if both available)
  useEffect(() => {
    if (car) {
      // Prefer without_driver if available, otherwise use with_driver
      if (car.rental && typeof car.rental === 'number' && car.rental > 0) {
        setRentalType('without_driver');
      }
      // If only withDriver price is available, use that
      else if (car.withDriver && car.withDriver > 0) {
        setRentalType('with_driver');
      }
    }
  }, [car]);

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
                    contact_info: inquiry.contact, // Fixed: backend expects contact_info, not email
                    message: inquiry.message,
                    store_id: car.store_id || null,
                    car_details: car ? { id: car.id, name: car.name } : null,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setInquiryStatus('error');
                setInquiryError(data.message || 'Failed to send inquiry.');
                showError('Inquiry Failed', data.message || 'Failed to send inquiry. Please try again.');

                // Clear error message after 5 seconds
                setTimeout(() => {
                    setInquiryStatus('idle');
                    setInquiryError(null);
                }, 5000);
            } else {
                setInquiryStatus('success');
                setInquiry({ name: '', contact: '', message: '' });
                showSuccess('Inquiry Sent', 'Your inquiry has been sent successfully to the store owner!');

                // Clear success message after 5 seconds
                setTimeout(() => {
                    setInquiryStatus('idle');
                }, 5000);
            }
        } catch {
            setInquiryStatus('error');
            setInquiryError('Network error.');
            showError('Network Error', 'Unable to send inquiry. Please check your internet connection and try again.');

            // Clear error message after 5 seconds
            setTimeout(() => {
                setInquiryStatus('idle');
                setInquiryError(null);
            }, 5000);
        }
    };

  return (
      <>
          <div className="mt-17 min-h-screen bg-neutral-50 dark:bg-gray-900">
              {/* Navbar */}
              <Navbar auth={{ user }} />
              <div className="px-2 py-10 md:px-8">
                  <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-lg md:flex-row dark:bg-gray-800/80">
                      {/* Left: Car Image & Rate Details */}
                      <div className="flex flex-col gap-8 p-8 md:w-1/2">
                          <div
                              className={`flex items-center justify-center relative ${hasMultipleImages ? 'cursor-pointer' : ''}`}
                              onClick={hasMultipleImages ? () => setIsImageModalOpen(true) : undefined}
                          >
                              {hasMultipleImages && (
                                  <div className="absolute top-4 right-4 z-10 bg-black/70 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                      <span>📷</span>
                                      <span>{car.images?.length}</span>
                                  </div>
                              )}
                              <img
                                  src={getPrimaryImage()}
                                  alt={car.name}
                                  className="h-56 rounded-xl bg-gray-50 object-contain p-4 dark:bg-neutral-800"
                                  onError={handleImageError}
                              />
                              {hasMultipleImages && (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                      <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                                          Click to view gallery
                                      </div>
                                  </div>
                              )}
                          </div>
                          <h1 className="block text-center text-2xl font-bold text-[#7e246c] dark:text-white">
                              {car.name}
                          </h1>

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
                                          <th className="pb-3">Hours/Day</th>
                                          <th className="pb-3 text-right">Amount</th>
                                      </tr>
                                  </thead>
                                  <tbody className="text-gray-700 dark:text-gray-300">
                                      {car.withDriver && car.withDriver > 0 && (
                                          <tr className="border-b border-gray-100 dark:border-gray-800">
                                              <td className="py-3 text-center font-semibold">10 hrs/day</td>
                                              <td className="py-3 text-right font-bold text-[#7e246c] dark:text-white">
                                                  {car.currency || 'PKR'} {Math.round(car.withDriver).toLocaleString()}
                                              </td>
                                          </tr>
                                      )}
                                      {car.rental && typeof car.rental === 'number' && car.rental > 0 && (
                                          <tr>
                                              <td className="py-3 text-center font-semibold">24 hrs/day</td>
                                              <td className="py-3 text-right font-bold text-[#7e246c] dark:text-white">
                                                  {car.currency || 'PKR'} {Math.round(car.rental).toLocaleString()}
                                              </td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                          <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                              <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#7e246c]">
                                  <span className="text-xs font-bold text-white">i</span>
                              </div>
                              <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                  Additional terms and conditions including fuel charges, overtime rates, and other service details will be discussed verbally
                                  with the store owner upon booking confirmation. Please contact the store directly for any specific requirements or questions.
                              </span>
                          </div>

                          {/* Store Information */}
                          {car?.store && (
                              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
                                  <h3 className="mb-4 text-lg font-bold text-[#7e246c] dark:text-white">Store Information</h3>
                                  <div className="space-y-3">
                                      <div>
                                          <h4 className="font-semibold text-gray-900 dark:text-white">{car.store.name}</h4>
                                          {car.store.description && (
                                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{car.store.description}</p>
                                          )}
                                      </div>
                                      {car.store.address && (
                                          <div className="flex items-start gap-2">
                                              <span className="text-[#7e246c] mt-0.5">📍</span>
                                              <span className="text-sm text-gray-600 dark:text-gray-300">{car.store.address}</span>
                                          </div>
                                      )}
                                      {car.store.phone && (
                                          <div className="flex items-center gap-2">
                                              <span className="text-[#7e246c]">📞</span>
                                              <span className="text-sm text-gray-600 dark:text-gray-300">{car.store.phone}</span>
                                          </div>
                                      )}
                                      {car.store.rating && (
                                          <div className="flex items-center gap-2">
                                              <span className="text-[#7e246c]">⭐</span>
                                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                                  {car.store.rating}/5 ({car.store.reviews} reviews)
                                              </span>
                                          </div>
                                      )}
                                  </div>
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
                                                  showError('Booking Failed', err.message || 'Failed to create booking. Please try again.');
                                              } else {
                                                  setSuccess('Booking successful!');
                                                  showSuccess('Booking Successful', 'Your booking request has been sent successfully!');
                                                  await fetchCarAndBooking();
                                              }
                                          } catch {
                                              setError('Network error');
                                              showError('Network Error', 'Unable to connect. Please check your internet connection and try again.');
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
                                      refillTank={refillTank}
                                      setRefillTank={setRefillTank}
                                  />

                                  {/* Send an Inquiry to Store Owner - Only show when user is not logged in */}
                                  {!user && (
                                      <div className="rounded-xl border border-[#7e246c]/30 bg-white p-6 shadow dark:bg-gray-900">
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

          {/* Image Gallery Modal */}
          <ImageGalleryModal
            isOpen={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            images={allImages}
            carName={car?.name || 'Car'}
          />
      <Footer />
      </>
  );
}
