import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Fuel } from 'lucide-react';

interface BookingFormProps {
  car: any;
  user: any;
  onBooking: (data: any) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: string | null;
  userBookings: any[];
}

const BookingForm: React.FC<BookingFormProps> = ({ car, user, onBooking, loading, error, success, userBookings }) => {
  const [pickupAddress, setPickupAddress] = useState('Werdener Str. 87, 40233 Düsseldorf, Germany');
  const [pickupTime, setPickupTime] = useState('23:30');
  const [pickupDate, setPickupDate] = useState('2025-07-13');
  const [refillTank, setRefillTank] = useState(false);
  const [selectedRentalType, setSelectedRentalType] = useState<'withDriver' | 'withoutDriver'>('withoutDriver');
  const [notes, setNotes] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  const dailyPrice = selectedRentalType === 'withDriver'
    ? (car && typeof car.withDriver === 'number' ? car.withDriver : 0)
    : (car && typeof car.rental === 'number' ? car.rental : 0);
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
    await onBooking({
      car_id: car.id,
      pickup_location: pickupAddress,
      pickup_time: pickupTime,
      pickup_date: pickupDate,
      rental_type: selectedRentalType === 'withDriver' ? 'with_driver' : 'without_driver',
      refill_tank: refillTank,
      number_of_days: numberOfDays,
      total_price: totalAmount,
      notes,
      car_offer_id: car.offer && typeof (car.offer as any).id === 'number' ? (car.offer as any).id : null,
    });
    setButtonLoading(false);
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
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-4 border border-[#7e246c]/30">
              <input
                type="text"
                value={pickupAddress}
                onChange={e => setPickupAddress(e.target.value)}
                className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition"
                placeholder="Pick-up address"
              />
              <div className="flex flex-col gap-4 sm:flex-row">
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
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-lg border-2 border-[#7e246c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] transition mt-2"
                placeholder="Notes (optional)"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
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
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Loading...
                </span>
              ) : (
                userBookings.length > 0 ? 'Create Another Booking' : 'Confirm Booking'
              )}
            </button>
            {validationError && <div className="text-red-600 mt-2 font-semibold">{validationError}</div>}
            {error && <div className="text-red-600 mt-2 font-semibold">{error}</div>}
            {success && <div className="text-green-600 mt-2 font-semibold text-center">{success}</div>}
          </>
        ) : (
          <button disabled className="w-full py-3 rounded-md bg-gray-300 text-gray-500 cursor-not-allowed font-semibold text-base shadow-sm flex items-center justify-center gap-2 dark:bg-gray-700 dark:text-gray-400">
            Please login to book
          </button>
        )}
      </div>
    </form>
  );
};

export default BookingForm; 