import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import CarCard from '../components/car-card';
import UniversalCarFilter, { CarFiltersType } from '../components/universal-car-filter';
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
  images?: string[];
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
  type ListingFilters = {
    brand_id: string;
    type_id: string;
    store_id: string;
    transmission: string;
    fuel_type: string;
    min_seats: string;
    max_price: string;
    city_id: string;
    pickup_location?: string;
    pickup_date?: string;
    pickup_time?: string;
    dropoff_date?: string;
    same_location?: string;
  };

  const getFiltersFromQuery = useCallback((search: string): ListingFilters => {
    const queryParams = new URLSearchParams(search);
    return {
      brand_id: queryParams.get('brand_id') || '',
      type_id: queryParams.get('type_id') || '',
      store_id: queryParams.get('store_id') || '',
      transmission: queryParams.get('transmission') || '',
      fuel_type: queryParams.get('fuel_type') || '',
      min_seats: queryParams.get('min_seats') || '',
      max_price: queryParams.get('max_price') || '',
      city_id: queryParams.get('city_id') || '',
      pickup_location: queryParams.get('pickup_location') || '',
      pickup_date: queryParams.get('pickup_date') || '',
      pickup_time: queryParams.get('pickup_time') || '',
      dropoff_date: queryParams.get('dropoff_date') || '',
      same_location: queryParams.get('same_location') || '',
    };
  }, []);

  const [filters, setFilters] = useState<ListingFilters>(() => getFiltersFromQuery(window.location.search));
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
  }, [location.search, getFiltersFromQuery]);

  // Update URL when filters or page change
  const updateUrl = useCallback((newFilters: typeof filters, page = currentPage) => {
    const urlParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    urlParams.set('page', String(page));
    navigate({ search: urlParams.toString() }, { replace: true });
  }, [currentPage, navigate]);

  // On initial mount, fetch with filters from URL
  useEffect(() => {
    setLoading(true);
    // Get page from URL or default to 1
    const urlParams = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(urlParams.get('page') || '1');
    setCurrentPage(pageFromUrl);

    const initialParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) initialParams.append(key, value);
    });
    initialParams.append('per_page', perPageState.toString());
    initialParams.append('page', pageFromUrl.toString());
    apiFetch(`/api/customer/cars?${initialParams.toString()}`)
      .then(async res => {
        const data = await res.json();
        setCars(data.data);
        setTotalPages(data.last_page);
        setPerPageState(data.per_page);
      })
      .finally(() => setLoading(false));
  }, [location.search, perPageState, filters]);

  // When page changes, update URL and fetch
  useEffect(() => {
    // Skip the initial load since it's handled by the first useEffect
    if (currentPage === 1) return;

    // Update URL without triggering the updateUrl dependency
    const urlParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    urlParams.set('page', String(currentPage));
    navigate({ search: urlParams.toString() }, { replace: true });

    setLoading(true);
    const apiParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) apiParams.append(key, value);
    });
    apiParams.append('per_page', perPageState.toString());
    apiParams.append('page', currentPage.toString());
    apiFetch(`/api/customer/cars?${apiParams.toString()}`)
      .then(async res => {
        const data = await res.json();
        setCars(data.data);
        setTotalPages(data.last_page);
        setPerPageState(data.per_page);
      })
      .finally(() => setLoading(false));
  }, [currentPage, filters, perPageState, navigate]);

  // Handle filter changes and immediately update URL
  const handleFilterChange = useCallback((newFilters: CarFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
    updateUrl(newFilters, 1);
  }, [updateUrl]);

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
          <UniversalCarFilter
            onSearch={handleFilterChange}
            initialFilters={filters}
            loading={loading}
          />
          {/* Top Pagination */}
          {totalPages > 1 && (
            <div className="w-full overflow-x-auto mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {cars.length} cars
                </div>
              </div>
              <ReactPaginate
                key={`top-pagination-${totalPages}-${currentPage}`}
                breakLabel={"..."}
                nextLabel={"Next"}
                onPageChange={(selected) => setCurrentPage(selected.selected + 1)}
                pageRangeDisplayed={isMobile ? 1 : 2}
                marginPagesDisplayed={isMobile ? 1 : 2}
                pageCount={totalPages}
                previousLabel={"Prev"}
                forcePage={Math.max(0, currentPage - 1)}
                containerClassName="flex flex-wrap sm:flex-nowrap justify-center items-center gap-2 min-w-fit"
                pageClassName=""
                pageLinkClassName="px-3 py-1 rounded font-semibold border border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c] cursor-pointer"
                previousClassName=""
                previousLinkClassName="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c] cursor-pointer"
                nextClassName=""
                nextLinkClassName="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c] cursor-pointer"
                breakClassName=""
                breakLinkClassName="px-2 text-gray-400 cursor-pointer"
                activeLinkClassName="bg-[#7e246c] text-purple-200 border-[#7e246c] cursor-pointer font-bold"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
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
                {totalPages > 1 && (
                  <div className="w-full overflow-x-auto mt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {cars.length} cars
                      </div>
                    </div>
                    <ReactPaginate
                      key={`bottom-pagination-${totalPages}-${currentPage}`}
                      breakLabel={"..."}
                      nextLabel={"Next"}
                      onPageChange={(selected) => setCurrentPage(selected.selected + 1)}
                      pageRangeDisplayed={isMobile ? 1 : 2}
                      marginPagesDisplayed={isMobile ? 1 : 2}
                      pageCount={totalPages}
                      previousLabel={"Prev"}
                      forcePage={Math.max(0, currentPage - 1)}
                      containerClassName="flex flex-wrap sm:flex-nowrap justify-center items-center gap-2 min-w-fit"
                      pageClassName=""
                      pageLinkClassName="px-3 py-1 rounded font-semibold border border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c] cursor-pointer"
                      previousClassName=""
                      previousLinkClassName="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c] cursor-pointer"
                      nextClassName=""
                      nextLinkClassName="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c] cursor-pointer"
                      breakClassName=""
                      breakLinkClassName="px-2 text-gray-400 cursor-pointer"
                      activeLinkClassName="bg-[#7e246c] text-purple-200 border-[#7e246c] cursor-pointer font-bold"
                      disabledClassName="opacity-50 cursor-not-allowed"
                    />
                  </div>
                )}
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
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requirements</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-400">
                  <li>• Valid driver's license</li>
                  <li>• Minimum age: 18 years</li>
                  <li>• Clean driving record</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-400">
                  <li>• 24/7 customer support</li>
                  <li>• Live chat available</li>
                </ul>
              </div>
            </div>
            {/* City Availability Notice */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Currently available in Karachi only. We'll be expanding to other cities soon!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
