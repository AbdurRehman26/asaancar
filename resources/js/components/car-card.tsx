import { Users, Fuel, Settings, Shield, Calendar, Thermometer, Navigation, Key, Car } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import ImageGalleryModal from './ImageGalleryModal';
import { Car as CarType } from '@/types';

// Helper for feature icons
const featureIcons: Record<string, React.ReactNode> = {
  seats: <Users className="h-5 w-5" />, // Seats
  fuelType: <Fuel className="h-5 w-5" />, // Fuel
  transmission: <Settings className="h-5 w-5" />, // Transmission
  type: <Car className="h-5 w-5" />, // Car Type
  mileage: <Shield className="h-5 w-5" />, // Mileage
  gps: <Navigation className="h-5 w-5" />, // GPS
  airConditioning: <Thermometer className="h-5 w-5" />, // AC
  minAge: <Key className="h-5 w-5" />, // Min age
};

const featureLabels: Record<string, string> = {
  seats: '',
  fuelType: '',
  transmission: '',
  type: '',
  mileage: '',
  gps: 'GPS',
  airConditioning: 'Air Conditioning',
  minAge: 'Minimum Age',
};

const CarCard = ({ car, hideBooking, showEditButton }: { car: CarType; hideBooking: boolean; showEditButton?: boolean }) => {
  const { user } = useAuth();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Get brand image path
  const getBrandImagePath = (brandName: string) => {
    return `/images/car-brands/${brandName.toLowerCase()}.png`;
  };

  // Get primary image with fallback logic (same as car detail page)
  const getPrimaryImage = () => {

    // 1. First try car's main image
    if (car?.image) {
      return car.image.startsWith('/') ? car.image : `/${car.image}`;
    }

    // 2. Then try car model image
    if (car?.car_model?.image) {
      return car.car_model.image.startsWith('/') ? car.car_model.image : `/${car.car_model.image}`;
    }

    // 3. Then try brand image
    if (car?.brand) {
      return getBrandImagePath(car.brand);
    }

    // 4. Final fallback to placeholder
    return '/images/car-placeholder.jpeg';
  };

  // Handle image error - fallback to car model image, then brand image, then placeholder
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    
    // Get or initialize the set of attempted URLs for this image element
    if (!target.dataset.attemptedUrls) {
      target.dataset.attemptedUrls = JSON.stringify([]);
    }
    const attemptedUrls = new Set(JSON.parse(target.dataset.attemptedUrls));
    
    // Helper function to normalize a path to absolute URL
    const normalizeToAbsoluteUrl = (path: string) => {
      if (path.startsWith('http')) {
        return path;
      }
      return new URL(path, window.location.origin).href;
    };
    
    // Helper function to check if URL has been attempted and add it to the set
    const tryUrl = (url: string) => {
      const absoluteUrl = normalizeToAbsoluteUrl(url);
      if (!attemptedUrls.has(absoluteUrl)) {
        attemptedUrls.add(absoluteUrl);
        target.dataset.attemptedUrls = JSON.stringify(Array.from(attemptedUrls));
        target.src = url;
        return true;
      }
      return false;
    };

    // First try car model image
    if (car?.car_model?.image) {
      const modelImagePath = car.car_model.image.startsWith('/') ? car.car_model.image : `/${car.car_model.image}`;
      if (tryUrl(modelImagePath)) {
        return;
      }
    }

    // Then try brand image
    const brandName = car?.brand;
    if (brandName && typeof brandName === 'string') {
      const brandImagePath = getBrandImagePath(brandName);
      if (tryUrl(brandImagePath)) {
        return;
      }
    }

    // Final fallback to placeholder (only if not already attempted)
    const placeholderPath = '/images/car-placeholder.jpeg';
    if (tryUrl(placeholderPath)) {
      return;
    }
    
    // If all fallbacks have been attempted, prevent further error handling
    target.onerror = null;
  };

  // Get features for display
  const features = [
    { key: 'seats', value: car.specifications?.seats },
    { key: 'fuelType', value: car.specifications?.fuelType },
    { key: 'transmission', value: car.specifications?.transmission },
    { key: 'type', value: car.specifications?.type },
  ];

  // Check if car has multiple images
  const hasMultipleImages = car?.images && car.images.length > 1;
  const allImages = car?.images && car.images.length > 0 ? car.images : [getPrimaryImage()];



  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-xl shadow-md border border-[#7e246c] p-6 flex flex-col items-center min-h-[420px] transition-all hover:shadow-lg">
      {/* Car Image */}
      <div
        className={`w-full bg-gray-50 dark:bg-gray-700 rounded-xl h-36 mb-4 overflow-hidden relative ${hasMultipleImages ? 'cursor-pointer' : ''}`}
        onClick={hasMultipleImages ? () => setIsImageModalOpen(true) : undefined}
      >
        {hasMultipleImages && (
          <div className="absolute top-2 right-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <span>📷</span>
            <span>{car.images?.length}</span>
          </div>
        )}
        <img
          src={getPrimaryImage()}
          alt={car.name}
          className="object-contain h-full w-full rounded-xl p-2"
          onError={handleImageError}
        />
        {hasMultipleImages && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              Click to view gallery
            </div>
          </div>
        )}
      </div>
      {/* Car Name & Subtitle */}
      <Link to={`/car-detail/${car.id}`} className="w-full text-center mb-2 hover:opacity-80 transition-opacity">
        <h3 className="font-bold text-lg text-[#7e246c] dark:text-white truncate overflow-hidden whitespace-nowrap cursor-pointer hover:underline">{car.name}</h3>
        {car.brand && (
          <div className="text-xs text-gray-500 dark:text-gray-300 font-semibold">{car.brand}</div>
        )}
      </Link>
      {/* Price */}
      <Link to={`/car-detail/${car.id}`} className="w-full text-center mb-2 hover:opacity-80 transition-opacity">
        <div className="text-2xl font-extrabold text-[#7e246c] dark:text-white cursor-pointer hover:underline">{car.price?.currency || 'PKR'} {car.price?.perDay?.withDriver ?? '--'}<span className="text-base font-medium text-[#7e246c] dark:text-white">/day</span></div>
        <div className="text-xs text-[#7e246c] dark:text-white font-medium">With driver</div>
        {car.price?.perDay?.withoutDriver && (
          <div className="text-xs text-gray-500 dark:text-gray-400">Without driver: {car.price.currency || 'PKR'} {car.price.perDay.withoutDriver}/day</div>
        )}
        {car.extraInfo && (
          <div className="text-xs text-gray-400 dark:text-gray-300 mt-1">{car.extraInfo}</div>
        )}
      </Link>
      {/* Features Grid */}
      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2 my-4">
        {features.map(
          (f) =>
            f.value && (
              <div key={f.key} className="flex items-center gap-2 text-sm text-black dark:text-white">
                {featureIcons[f.key]}
                <span>
                  {f.value} {featureLabels[f.key]}
                </span>
              </div>
            )
        )}
      </div>
      {/* Action Buttons */}
      <div className="mt-auto w-full space-y-2">
        {/* View Details Button - Always shown */}
        <Link
          to={`/car-detail/${car.id}`}
          className="w-full py-3 px-4 rounded-md font-medium bg-[#7e246c] text-white hover:bg-[#6a1f5c] transition-colors text-base shadow-sm flex items-center justify-center gap-2"
        >
          <Car className="h-5 w-5 mr-2 inline" /> View Details
        </Link>

        {/* Edit Button - Only shown when showEditButton is true */}
        {showEditButton && (
          <Link
            to={`/edit-car/${car.id}`}
            className="w-full py-2 px-4 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
          >
            <Settings className="h-4 w-4 mr-1 inline" /> Edit Car
          </Link>
        )}

        {/* Booking/Action Buttons - Only shown when not hiding booking */}
        {!hideBooking && (
          <>
            {user ? (
              <>
                <Link
                  to={`/car-detail/${car.id}`}
                  className="w-full py-3 px-4 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 transition-colors text-base shadow-sm flex items-center justify-center gap-2"
                >
                  <Calendar className="h-5 w-5 mr-2 inline" /> Request Booking
                </Link>
                <Link
                  to={`/car-detail/${car.id}/edit`}
                  className="w-full py-2 px-4 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
                >
                  <Car className="h-4 w-4 mr-1 inline" /> Add Offer
                </Link>
              </>
            ) : (
              <button
                disabled
                className="w-full py-3 px-4 rounded-md font-medium bg-gray-300 text-gray-500 cursor-not-allowed text-base shadow-sm flex items-center justify-center gap-2 dark:bg-gray-700 dark:text-gray-400"
              >
                <Calendar className="h-5 w-5 mr-2 inline" /> Please login to book
              </button>
            )}
          </>
        )}
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={allImages}
        carName={car.name}
      />
    </div>
  );
};

export default CarCard;
