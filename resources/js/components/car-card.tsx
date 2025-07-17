import { Users, Fuel, Settings, Shield, Calendar, Thermometer, Navigation, Key } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';

// Define Car interface
interface Car {
  id: string | number;
  name: string;
  image?: string;
  specifications?: {
    seats?: number;
    fuelType?: string;
    transmission?: string;
  };
  features?: string[];
  minAge?: number;
  price?: {
    perDay?: {
      withoutDriver?: number;
      withDriver?: number;
    };
  };
  extraInfo?: string;
}

// Helper for feature icons
const featureIcons: Record<string, React.ReactNode> = {
  seats: <Users className="h-5 w-5" />, // Seats
  fuelType: <Fuel className="h-5 w-5" />, // Fuel
  transmission: <Settings className="h-5 w-5" />, // Transmission
  mileage: <Shield className="h-5 w-5" />, // Mileage
  gps: <Navigation className="h-5 w-5" />, // GPS
  airConditioning: <Thermometer className="h-5 w-5" />, // AC
  minAge: <Key className="h-5 w-5" />, // Min age
};

const featureLabels: Record<string, string> = {
  seats: 'seats',
  fuelType: '',
  transmission: '',
  mileage: '',
  gps: 'GPS',
  airConditioning: 'Air Conditioning',
  minAge: 'Minimum age',
};

const CarCard = ({ car, hideBooking }: { car: Car; hideBooking: boolean }) => {
  const { user } = useAuth();
  // Features to show (customize as needed)
  const features = [
    { key: 'seats', value: car.specifications?.seats },
    { key: 'fuelType', value: car.specifications?.fuelType },
    { key: 'transmission', value: car.specifications?.transmission },
    { key: 'gps', value: car.features?.includes('GPS') ? 'Yes' : null },
    { key: 'airConditioning', value: car.features?.includes('Air Conditioning') ? 'Yes' : null },
    { key: 'minAge', value: car.minAge || 21 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-xl shadow-md border border-[#7e246c] p-6 flex flex-col items-center min-h-[420px] transition-all hover:shadow-lg">
      {/* Car Image */}
      <Link to={`/car-detail/${car.id}`} className="block w-full bg-gray-50 dark:bg-gray-700 rounded-xl h-36 mb-4 overflow-hidden">
        <img
          src={car.image || '/images/car-placeholder.jpeg'}
          alt={car.name}
          className="object-contain h-full w-full rounded-xl"
          onError={e => (e.currentTarget.src = '/images/car-placeholder.jpeg')}
        />
      </Link>
      {/* Car Name & Subtitle */}
      <div className="w-full text-center mb-2">
        <h3 className="font-bold text-lg text-[#7e246c] dark:text-white">{car.name}</h3>
        <div className="text-xs text-gray-500 dark:text-gray-300">or similar</div>
      </div>
      {/* Price */}
      <div className="w-full text-center mb-2">
        <div className="text-2xl font-extrabold text-[#7e246c] dark:text-white">€{car.price?.perDay?.withoutDriver ?? '--'}<span className="text-base font-medium text-[#7e246c] dark:text-white">/day</span></div>
        {car.price?.perDay?.withDriver && (
          <div className="text-xs text-[#7e246c] dark:text-white">With driver: €{car.price.perDay.withDriver}/day</div>
        )}
        {car.extraInfo && (
          <div className="text-xs text-gray-400 dark:text-gray-300 mt-1">{car.extraInfo}</div>
        )}
      </div>
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
      {/* Request Booking Button */}
      {!hideBooking && (user ? (
        <Link
          to={`/car-detail/${car.id}`}
          className="mt-auto w-full py-3 px-4 rounded-md font-medium bg-[#7e246c] text-white hover:bg-[#6a1f5c] transition-colors text-base shadow-sm flex items-center justify-center gap-2"
        >
          <Calendar className="h-5 w-5 mr-2 inline" /> Request Booking
        </Link>
      ) : (
        <button
          disabled
          className="mt-auto w-full py-3 px-4 rounded-md font-medium bg-gray-300 text-gray-500 cursor-not-allowed text-base shadow-sm flex items-center justify-center gap-2 dark:bg-gray-700 dark:text-gray-400"
        >
          <Calendar className="h-5 w-5 mr-2 inline" /> Please login to book
        </button>
      ))}
    </div>
  );
};

export default CarCard; 