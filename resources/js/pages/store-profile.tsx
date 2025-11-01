import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import CarCard from '../components/car-card';
import { Building2, Phone, MapPin, Calendar, Car } from 'lucide-react';
import { Car as CarType } from '@/types';
import ReactPaginate from 'react-paginate';

interface Store {
  id: number;
  name: string;
  store_username?: string;
  description?: string;
  logo_url?: string;
  city?: string;
  contact_phone?: string;
  address?: string;
  car_count?: number;
  created_at?: string;
}

export default function StoreProfilePage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<CarType[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(9);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/stores/${id}`);
        if (!response.ok) {
          throw new Error('Store not found');
        }
        const data = await response.json();
        setStore(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load store information');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStore();
    }
  }, [id]);

  // Fetch cars for this store
  useEffect(() => {
    if (!store || !store.id) return;

    const fetchCars = async () => {
      try {
        setCarsLoading(true);
        const params = new URLSearchParams();
        params.append('store_id', store.id.toString());
        params.append('page', currentPage.toString());
        params.append('per_page', perPage.toString());

        const response = await fetch(`/api/cars?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setCars(data.data || []);
          setTotalPages(data.last_page || 1);
        } else {
          console.error('Failed to fetch cars');
        }
      } catch (err) {
        console.error('Error fetching cars:', err);
      } finally {
        setCarsLoading(false);
      }
    };

    fetchCars();
  }, [store, currentPage, perPage]);

  if (loading) {
    return (
      <>
        <Navbar auth={{ user }} />
        <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7e246c] mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading store information...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !store) {
    return (
      <>
        <Navbar auth={{ user }} />
        <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Store Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'The store you are looking for does not exist.'}
              </p>
              <Link
                to="/cars"
                className="inline-block px-6 py-3 bg-[#7e246c] text-white font-semibold rounded-md hover:bg-[#6a1f5c] transition-colors"
              >
                Browse Cars
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar auth={{ user }} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-[#7e246c] to-[#9d2f87] dark:from-[#6a1f5c] dark:to-[#7e246c] pt-8 pb-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              {/* Store Logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-lg transform rotate-3 opacity-20"></div>
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.name}
                    className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover border-2 border-white shadow-lg"
                  />
                ) : (
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white/20 backdrop-blur-sm border-2 border-white shadow-lg flex items-center justify-center">
                    <Building2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                )}
              </div>

              {/* Store Info */}
              <div className="flex-1 text-center md:text-left">
                <Link to={`/cars?store_id=${store.id}`}>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-lg hover:opacity-90 transition-opacity cursor-pointer inline-block">
                    {store.name}
                  </h1>
                </Link>
                {store.store_username && (
                  <p className="text-white/90 text-xs md:text-sm mb-2">@{store.store_username}</p>
                )}
                {store.description && (
                  <p className="text-white/80 text-xs md:text-sm max-w-2xl mx-auto md:mx-0 leading-relaxed">
                    {store.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 mt-6 pb-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {store.car_count !== undefined && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#7e246c] to-[#9d2f87] flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-0.5">Total Cars</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{store.car_count}</p>
                  </div>
                </div>
              </div>
            )}

            {store.created_at && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#7e246c] to-[#9d2f87] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-0.5">Since</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{new Date(store.created_at).getFullYear()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {store.address && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-[#7e246c]/10 dark:bg-[#7e246c]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#7e246c]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Address</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{store.address}</p>
                    {store.city && (
                      <p className="text-gray-600 dark:text-gray-400 mt-0.5 text-xs font-medium">{store.city}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {store.contact_phone && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-[#7e246c]/10 dark:bg-[#7e246c]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#7e246c]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Phone</h3>
                    <a
                      href={`tel:${store.contact_phone}`}
                      className="text-[#7e246c] hover:text-[#6a1f5c] dark:text-[#9d2f87] dark:hover:text-[#7e246c] font-semibold text-sm transition-colors inline-flex items-center gap-1.5 group"
                    >
                      {store.contact_phone}
                      <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cars Listing Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available Cars
            </h2>

            {carsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7e246c] mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading cars...</p>
                </div>
              </div>
            ) : cars.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-100 dark:border-gray-700 text-center">
                <Car className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No cars available</h3>
                <p className="text-gray-600 dark:text-gray-400">This store doesn't have any cars listed yet.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                  {cars.map((car) => (
                    <CarCard key={car.id} car={car} hideBooking={true} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel="Next"
                      onPageChange={({ selected }) => setCurrentPage(selected + 1)}
                      pageRangeDisplayed={2}
                      marginPagesDisplayed={2}
                      pageCount={totalPages}
                      previousLabel="Previous"
                      forcePage={Math.max(0, currentPage - 1)}
                      containerClassName="flex flex-wrap gap-2 items-center justify-center"
                      pageClassName=""
                      pageLinkClassName="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-[#7e246c] hover:text-white hover:border-[#7e246c] transition-colors cursor-pointer"
                      previousClassName=""
                      previousLinkClassName="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-[#7e246c] hover:text-white hover:border-[#7e246c] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      nextClassName=""
                      nextLinkClassName="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-[#7e246c] hover:text-white hover:border-[#7e246c] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      activeClassName=""
                      activeLinkClassName="bg-[#7e246c] text-white border-[#7e246c]"
                      disabledClassName="opacity-50 cursor-not-allowed"
                      breakClassName="px-3 py-2 text-gray-700 dark:text-gray-300"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

