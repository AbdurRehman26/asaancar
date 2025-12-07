import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car as CarIcon } from 'lucide-react';
import CarCard from '../components/car-card';
import UniversalCarFilter from '../components/universal-car-filter';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { apiFetch } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginModal from '@/pages/auth/login-modal';
import { useAuth } from '@/components/AuthContext';
import ReactPaginate from 'react-paginate';
import { Car } from '@/types';

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
    min_price: string;
    max_price: string;
    tag_ids: number[];
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
      min_price: queryParams.get('min_price') || '',
      max_price: queryParams.get('max_price') || '',
      tag_ids: queryParams.get('tag_ids') ? queryParams.get('tag_ids')!.split(',').map(Number) : [],
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

  // Function to update URL parameters
  const updateURLParams = useCallback((newFilters: ListingFilters, page: number = 1) => {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    // Add pagination params
    params.set('page', page.toString());
    params.set('per_page', perPageState.toString());
    
    // Update URL without triggering a page reload
    navigate(`/cars?${params.toString()}`, { replace: true });
  }, [navigate, perPageState]);

  // Sync filters/page with URL on load
  useEffect(() => {
    setFilters(getFiltersFromQuery(location.search));
  }, [location.search, getFiltersFromQuery]);

  // Fetch cars on component mount
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const initialParams = new URLSearchParams();
        initialParams.append('per_page', perPageState.toString());
        initialParams.append('page', currentPage.toString());
        
        // Add filters to params
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                initialParams.append(key, value.join(','));
              }
            } else {
              initialParams.append(key, value.toString());
            }
          }
        });

        const response = await apiFetch(`/api/cars?${initialParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setCars(data.data || []);
          setTotalPages(data.last_page || 1);
          setPerPageState(data.per_page || 9);
        } else {
          console.error('Failed to fetch cars');
        }
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [filters, currentPage, perPageState]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<ListingFilters>) => {
    // Update state
    setFilters(newFilters as ListingFilters);
    setCurrentPage(1);
    updateURLParams(newFilters as ListingFilters, 1);
    
    // Trigger immediate search with the new filters
    setLoading(true);
    const params = new URLSearchParams();

    // Add other filters using the newFilters directly
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else {
          params.append(key, value.toString());
        }
      }
    });

    params.append('page', '1');
    params.append('per_page', perPageState.toString());

    fetch(`/api/cars?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setCars(data.data || []);
        setTotalPages(data.last_page || 1);
      })
      .catch(error => {
        console.error('Error fetching cars:', error);
        setCars([]);
      })
      .finally(() => setLoading(false));
  }, [perPageState, updateURLParams]);

  // Handle pagination changes
  const handlePageChange = useCallback((selected: { selected: number }) => {
    const newPage = selected.selected + 1;
    setCurrentPage(newPage);
    updateURLParams(filters, newPage);
  }, [filters, updateURLParams]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const defaultFilters: ListingFilters = {
      brand_id: '',
      type_id: '',
      store_id: '',
      transmission: '',
      fuel_type: '',
      min_seats: '',
      min_price: '',
      max_price: '',
      tag_ids: [],
      pickup_location: '',
      pickup_date: '',
      pickup_time: '',
      dropoff_date: '',
      same_location: '',
    };
    setFilters(defaultFilters);
    setCurrentPage(1);
    updateURLParams(defaultFilters, 1);
  }, [updateURLParams]);

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
            onClearFilters={handleClearFilters}
            initialFilters={filters}
            loading={loading}
          />
          
          {/* City Availability Notice */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Currently available in Karachi only. We'll be expanding to other cities soon!
              </span>
            </div>
          </div>
          
          {/* Top Pagination */}
          {totalPages > 1 && (
            <div className="w-full overflow-x-auto mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
              <ReactPaginate
                key={`top-pagination-${totalPages}-${currentPage}`}
                breakLabel={"..."}
                nextLabel={"Next"}
                onPageChange={handlePageChange}
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
                <CarIcon className="h-16 w-16 text-gray-400 dark:text-neutral-500 mx-auto mb-4" />
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
                    </div>
                    <ReactPaginate
                      key={`bottom-pagination-${totalPages}-${currentPage}`}
                      breakLabel={"..."}
                      nextLabel={"Next"}
                      onPageChange={handlePageChange}
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
