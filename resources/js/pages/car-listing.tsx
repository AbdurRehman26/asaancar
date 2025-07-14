import { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import CarCard from '../components/car-card';
import CarFilters from '../components/car-filters';
import Navbar from '../components/navbar';
import { apiFetch } from '@/lib/utils';
import DarkModeToggle from '../components/ui/dark-mode-toggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginModal from '@/pages/auth/login-modal';
import RegisterModal from '@/pages/auth/register-modal';
import { useAuth } from '@/components/AuthContext';

// Simple Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) {
  return (
    <div className="flex justify-center items-center gap-2 my-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
      >Prev</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded font-semibold border ${page === currentPage ? 'bg-[#7e246c] text-white border-[#7e246c]' : 'border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c]'}`}
        >{page}</button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
      >Next</button>
    </div>
  );
}

export default function CarListing() {
  const { user, login } = useAuth();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [duration, setDuration] = useState('hourly');
  const [filters, setFilters] = useState({
    brand_id: '',
    type_id: '',
    store_id: '',
    transmission: '',
    fuel_type: '',
    min_seats: '',
    max_price: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPageState, setPerPageState] = useState(9);
  const [totalCount, setTotalCount] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/cars?per_page=${perPageState}&page=${currentPage}`)
      .then(async res => {
        const data = await res.json();
        setCars(data.data);
        setTotalPages(data.last_page);
        setPerPageState(data.per_page);
        setTotalCount(data.total);
      })
      .finally(() => setLoading(false));
  }, [currentPage, perPageState]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Build query string from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('per_page', perPageState.toString());
      params.append('page', currentPage.toString());
      const res = await apiFetch(`/api/cars?${params.toString()}`);
      const data = await res.json();
      setCars(data.data);
      setTotalPages(data.last_page);
      setPerPageState(data.per_page);
      setTotalCount(data.total);
    } catch (error) {
      // ...
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (carId: number) => {
    // ... existing booking logic ...
  };

  const clearFilters = () => {
    setFilters({
      brand_id: '',
      type_id: '',
      store_id: '',
      transmission: '',
      fuel_type: '',
      min_seats: '',
      max_price: ''
    });
    setCurrentPage(1);
    // Optionally re-fetch cars with cleared filters
    handleSearch();
  };

  // Handler for login modal
  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) setLoginOpen(false);
  };

  return (
    <>
      <title>Car Listings - AsaanCar</title>

      {/* Modals */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log in to your account</DialogTitle>
          </DialogHeader>
          <LoginModal canResetPassword={true} onSuccess={() => setLoginOpen(false)} />
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
          currentPage="cars" 
          auth={{ user }}
          onLoginClick={() => setLoginOpen(true)}
          onRegisterClick={() => setRegisterOpen(true)}
        />

        {/* Page Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Available Cars</h1>
            <p className="text-base text-gray-500 dark:text-neutral-400 font-medium">Find the perfect car for your journey. Modern, clean, and easy booking experience.</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
          <CarFilters
            filters={filters}
            setFilters={setFilters}
            duration={duration}
            setDuration={setDuration}
            bookingDate={bookingDate}
            setBookingDate={setBookingDate}
            bookingTime={bookingTime}
            setBookingTime={setBookingTime}
            handleSearch={handleSearch}
            clearFilters={clearFilters}
            loading={loading}
          />
          {/* Top Pagination */}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>

        {/* Car Listings */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
          <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-neutral-800 shadow-lg p-6 md:p-10">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-neutral-400">Searching for cars...</p>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-400 dark:text-neutral-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No cars available</h3>
                <p className="text-gray-600 dark:text-neutral-400">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                  {cars.map((car) => (
                    <CarCard key={car.id} car={car} duration={duration} handleBooking={handleBooking} />
                  ))}
                </div>
                {/* Bottom Pagination */}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-800/80 border-t border-gray-100 dark:border-neutral-800 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Information</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-400">
                  <li>• Minimum booking duration: 1 day</li>
                  <li>• Free cancellation up to 24 hours before</li>
                  <li>• Insurance included in all rentals</li>
                  <li>• 24/7 roadside assistance</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requirements</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-400">
                  <li>• Valid driver's license</li>
                  <li>• Credit card for deposit</li>
                  <li>• Minimum age: 21 years</li>
                  <li>• Clean driving record</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-400">
                  <li>• 24/7 customer support</li>
                  <li>• Emergency roadside assistance</li>
                  <li>• Live chat available</li>
                  <li>• Phone support: +1-800-CARS</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Dark Mode Toggle */}
      <DarkModeToggle />
    </>
  );
}
