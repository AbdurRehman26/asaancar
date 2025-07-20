import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import CarCard from '../components/car-card';
import CarFilters from '../components/car-filters';
import Navbar from '../components/navbar';
import { apiFetch } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginModal from '@/pages/auth/login-modal';
import { useAuth } from '@/components/AuthContext';
import ReactPaginate from 'react-paginate';

// Define Car interface for use in this file
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

function useResponsivePagination() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function CarListing() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Helper to parse query params
  function getFiltersFromQuery(search: string) {
    const params = new URLSearchParams(search);
    return {
      brand_id: params.get('brand_id') || '',
      type_id: params.get('type_id') || '',
      store_id: params.get('store_id') || '',
      transmission: params.get('transmission') || '',
      fuel_type: params.get('fuel_type') || '',
      min_seats: params.get('min_seats') || '',
      max_price: params.get('max_price') || '',
    };
  }

  const [filters, setFilters] = useState(() => getFiltersFromQuery(window.location.search));
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPageState, setPerPageState] = useState(9);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const isMobile = useResponsivePagination();

  // Sync filters/page with URL on load
  useEffect(() => {
    setFilters(getFiltersFromQuery(location.search));
  }, [location.search]);

  // Update URL when filters or page change
  const updateUrl = (newFilters: typeof filters, page = currentPage) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', String(page));
    navigate({ search: params.toString() }, { replace: true });
  };

  // On initial mount, fetch with filters from URL
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    params.append('per_page', perPageState.toString());
    params.append('page', currentPage.toString());
    apiFetch(`/api/cars?${params.toString()}`)
      .then(async res => {
        const data = await res.json();
        setCars(data.data);
        setTotalPages(data.last_page);
        setPerPageState(data.per_page);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When page changes, update URL and fetch
  useEffect(() => {
    if (currentPage !== 1) {
      updateUrl(filters, currentPage);
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('per_page', perPageState.toString());
      params.append('page', currentPage.toString());
      apiFetch(`/api/cars?${params.toString()}`)
        .then(async res => {
          const data = await res.json();
          setCars(data.data);
          setTotalPages(data.last_page);
          setPerPageState(data.per_page);
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = async () => {
    setLoading(true);
    setCurrentPage(1); // Always reset to first page on search
    updateUrl(filters, 1);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('per_page', perPageState.toString());
      params.append('page', '1');
      const res = await apiFetch(`/api/cars?${params.toString()}`);
      const data = await res.json();
      setCars(data.data);
      setTotalPages(data.last_page);
      setPerPageState(data.per_page);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 pt-20">
        {/* Navbar */}
        <Navbar
          currentPage="cars"
          auth={{ user }}
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
            handleSearch={handleSearch}
            loading={loading}
          />
          {/* Top Pagination */}
          <div className="w-full overflow-x-auto">
            <ReactPaginate
              breakLabel={"..."}
              nextLabel={"Next"}
              onPageChange={(selected) => setCurrentPage(selected.selected + 1)}
              pageRangeDisplayed={isMobile ? 1 : 2}
              marginPagesDisplayed={isMobile ? 1 : 2}
              pageCount={totalPages}
              previousLabel={"Prev"}
              forcePage={currentPage - 1}
              containerClassName="flex flex-wrap sm:flex-nowrap justify-center items-center gap-2 my-6 min-w-fit"
              pageClassName=""
              pageLinkClassName="px-3 py-1 rounded font-semibold border border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c]"
              previousClassName=""
              previousLinkClassName="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
              nextClassName=""
              nextLinkClassName="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
              breakClassName=""
              breakLinkClassName="px-2 text-gray-400"
              activeLinkClassName="bg-[#7e246c] text-white border-[#7e246c]"
              disabledClassName="opacity-50 cursor-not-allowed"
            />
          </div>
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
                    <CarCard key={car.id} car={car} hideBooking />
                  ))}
                </div>
                {/* Bottom Pagination */}
                <ReactPaginate
                  breakLabel={"..."}
                  nextLabel={"Next"}
                  onPageChange={(selected) => setCurrentPage(selected.selected + 1)}
                  pageRangeDisplayed={2}
                  marginPagesDisplayed={2}
                  pageCount={totalPages}
                  previousLabel={"Prev"}
                  forcePage={currentPage - 1}
                  containerClassName="flex justify-center items-center gap-2 my-6"
                  pageClassName=""
                  pageLinkClassName="px-3 py-1 rounded font-semibold border border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c]"
                  previousClassName=""
                  previousLinkClassName="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
                  nextClassName=""
                  nextLinkClassName="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
                  breakClassName=""
                  breakLinkClassName="px-2 text-gray-400"
                  activeLinkClassName="bg-[#7e246c] text-white border-[#7e246c]"
                  disabledClassName="opacity-50 cursor-not-allowed"
                />
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
    </>
  );
}
