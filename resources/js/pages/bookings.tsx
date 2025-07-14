import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Car } from 'lucide-react';
import Navbar from '../components/navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginModal from '@/pages/auth/login-modal';
import RegisterModal from '@/pages/auth/register-modal';
import { apiFetch } from '@/lib/utils';
import { useAuth } from '@/components/AuthContext';

type Booking = {
  id: number;
  car: {
    name: string;
    image: string;
  };
  pickup_date: string;
  pickup_time: string;
  pickup_address: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  total_amount: number;
  currency: string;
};

export default function Bookings() {
  const { user, token } = useAuth();
  console.log('user:', user, 'token:', token);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      console.log('No user, skipping bookings fetch');
      return;
    }
    setLoading(true);
    apiFetch('/api/bookings')
      .then(async (res) => {
        console.log('Bookings API response:', res);
        if (!res.ok) {
          setError('Failed to fetch bookings');
          setBookings([]);
        } else {
          const data = await res.json();
          console.log('Bookings data:', data);
          setBookings(data.data || data); // handle both paginated and array
        }
      })
      .catch((e) => {
        setError('Network error');
        console.error('Bookings fetch error:', e);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  if (!user) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log in to your account</DialogTitle>
          </DialogHeader>
          <LoginModal canResetPassword={true} />
        </DialogContent>
      </Dialog>
    );
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
          currentPage="bookings" 
          auth={{ user }}
          onLoginClick={() => setLoginOpen(true)}
          onRegisterClick={() => setRegisterOpen(true)}
        />

        {/* Page Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Bookings</h1>
            <p className="text-base text-gray-500 dark:text-gray-300 font-medium">View and manage your car rental bookings.</p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
          <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 shadow-lg p-6 md:p-10">
            {loading ? (
              <div className="text-center py-12">Loading bookings...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">{error}</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">You haven't made any bookings yet.</p>
                <a 
                  href="/cars" 
                  className="inline-flex items-center gap-2 bg-[#7e246c] text-white font-semibold px-6 py-3 rounded-md hover:bg-[#6a1f5c] transition"
                >
                  <Car className="h-5 w-5" />
                  Browse Cars
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={booking.car.image || '/images/car-placeholder.jpeg'} 
                          alt={booking.car.name}
                          className="w-16 h-16 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{booking.car.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(booking.pickup_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{booking.pickup_time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate max-w-32">{booking.pickup_address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                        <div className="text-lg font-bold text-[#7e246c] dark:text-white">
                          {booking.currency} {typeof booking.total_amount === 'number' ? booking.total_amount.toLocaleString() : 'N/A'}
                        </div>
                        <div className="flex gap-2">
                          <button className="text-sm text-[#7e246c] dark:text-white hover:underline">
                            View Details
                          </button>
                          <a href={`/chat?booking=${booking.id}`} className="text-sm text-primary hover:underline">Message</a>
                          {booking.status === 'pending' && (
                            <button className="text-sm text-red-600 dark:text-red-400 hover:underline">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 