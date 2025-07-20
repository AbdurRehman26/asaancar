import React from 'react';
import { CheckCircle } from 'lucide-react';

interface UserBookingsListProps {
  userBookings: any[];
  car: any;
}

const UserBookingsList: React.FC<UserBookingsListProps> = ({ userBookings, car }) => {
  if (!userBookings || userBookings.length === 0) return null;
  return (
    <div className="max-w-4xl w-full mx-auto mt-12 bg-white dark:bg-gray-800/80 rounded-2xl shadow-lg p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#7e246c] dark:text-white mb-6 text-center">Your Bookings for this Car</h2>
      {userBookings.map(userBooking => (
        <div key={userBooking.id} className="rounded-xl border border-[#7e246c] bg-[#7e246c]/5 dark:bg-[#7e246c]/10 p-6 mb-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="text-green-600 dark:text-green-400" />
            <span className="font-semibold text-[#7e246c] dark:text-white">You have already booked this car</span>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-200">Status: <span className="font-bold">{userBooking.status}</span></div>
          <div className="text-sm text-gray-700 dark:text-gray-200">Pickup Date: <span className="font-bold">{userBooking.pickup_date ? new Date(userBooking.pickup_date).toLocaleDateString() : 'N/A'}</span></div>
          <div className="text-sm text-gray-700 dark:text-gray-200">Pickup Time: <span className="font-bold">{userBooking.pickup_time || 'N/A'}</span></div>
          <div className="text-sm text-gray-700 dark:text-gray-200">Pickup Location: <span className="font-bold">{userBooking.pickup_location || 'N/A'}</span></div>
          <div className="text-sm text-gray-700 dark:text-gray-200">Number of Days: <span className="font-bold">{userBooking.number_of_days || 1}</span></div>
          <div className="text-sm text-gray-700 dark:text-gray-200">Rental Type: <span className="font-bold">{userBooking.rental_type === 'with_driver' ? 'With Driver' : 'Without Driver'}</span></div>
          <div className="text-sm text-gray-700 dark:text-gray-200">Refill: <span className="font-bold">{userBooking.refill_tank ? 'Refill included' : '40 PKR / Km'}</span></div>
          <div className="text-sm text-gray-700 dark:text-gray-200">Total: <span className="font-bold">{typeof userBooking.total_price === 'number' ? userBooking.total_price.toLocaleString() : userBooking.total_price} {car.currency}</span></div>
          <div className="text-sm text-gray-700 dark:text-gray-200">Notes: <span className="font-normal">{userBooking.notes ? userBooking.notes : 'None'}</span></div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Booking ID: {userBooking.id}</div>
        </div>
      ))}
    </div>
  );
};

export default UserBookingsList; 