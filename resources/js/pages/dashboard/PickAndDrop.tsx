import { useState, useEffect } from 'react';
import { Plus, MapPin, Search, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { apiFetch } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import PickAndDropCard, { PickAndDropService } from '@/components/PickAndDropCard';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function PickAndDropPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success: showSuccess, error: showError } = useToast();
    const [services, setServices] = useState<PickAndDropService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        driver_gender: '',
        min_spaces: '',
        departure_date: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage] = useState(12);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, searchTerm, user, currentPage]);

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            // Check if user is admin
            const isAdmin = user && Array.isArray(user.roles) && user.roles.includes('admin');

            // Build query parameters
            const params = new URLSearchParams();
            if (searchTerm) {
                params.append('start_location', searchTerm);
            }
            if (filters.driver_gender) {
                params.append('driver_gender', filters.driver_gender);
            }
            if (filters.min_spaces) {
                params.append('min_spaces', filters.min_spaces);
            }
            if (filters.departure_date) {
                params.append('departure_date', filters.departure_date);
            }
            params.append('page', currentPage.toString());
            params.append('per_page', perPage.toString());

            // If not admin, only fetch user's own services
            if (!isAdmin) {
                const response = await apiFetch(`/api/customer/pick-and-drop/my-services?${params.toString()}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch your services');
                }
                const data = await response.json();
                setServices(data.data || []);
                setTotalPages(data.meta?.last_page || 1);
            } else {
                // Admin can see all services
                const response = await apiFetch(`/api/pick-and-drop?${params.toString()}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch services');
                }
                const data = await response.json();
                setServices(data.data || []);
                setTotalPages(data.meta?.last_page || 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyServices = async () => {
        if (!user) return;
        setCurrentPage(1);
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('page', '1');
            params.append('per_page', perPage.toString());

            const response = await apiFetch(`/api/customer/pick-and-drop/my-services?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch your services');
            }
            const data = await response.json();
            setServices(data.data || []);
            setTotalPages(data.meta?.last_page || 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load your services');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setServiceToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!serviceToDelete) return;

        setDeleting(true);
        try {
            const response = await apiFetch(`/api/customer/pick-and-drop/${serviceToDelete}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete service');
            }
            setServices(services.filter(s => s.id !== serviceToDelete));
            setDeleteDialogOpen(false);
            setServiceToDelete(null);
            showSuccess('Service Deleted', 'The pick & drop service has been successfully deleted.');
        } catch (err) {
            showError('Delete Failed', err instanceof Error ? err.message : 'Failed to delete service');
        } finally {
            setDeleting(false);
        }
    };


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#7e246c] dark:text-white">Pick & Drop Services</h1>
                {user && (
                    <Link
                        to="/dashboard/pick-and-drop/create"
                        className="flex items-center gap-2 px-4 py-2 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add Service
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by location..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <select
                        value={filters.driver_gender}
                        onChange={(e) => {
                            setFilters({ ...filters, driver_gender: e.target.value });
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Genders</option>
                        <option value="male">Male Driver</option>
                        <option value="female">Female Driver</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Min Spaces"
                        value={filters.min_spaces}
                        onChange={(e) => {
                            setFilters({ ...filters, min_spaces: e.target.value });
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                    />
                    <input
                        type="date"
                        value={filters.departure_date}
                        onChange={(e) => {
                            setFilters({ ...filters, departure_date: e.target.value });
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                    />
                    {user && Array.isArray(user.roles) && user.roles.includes('admin') && (
                        <button
                            onClick={() => {
                                setCurrentPage(1);
                                fetchMyServices();
                            }}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            My Services
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : services.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No pick and drop services found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <PickAndDropCard
                            key={service.id}
                            service={service}
                            onClick={() => navigate(`/pick-and-drop/${service.id}`)}
                            onEdit={user && service.user && user.id === service.user.id
                                ? () => navigate(`/dashboard/pick-and-drop/${service.id}/edit`)
                                : undefined
                            }
                            onDelete={user && service.user && user.id === service.user.id
                                ? () => handleDeleteClick(service.id)
                                : undefined
                            }
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && services.length > 0 && totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:text-[#7e246c]"
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded font-semibold border ${page === currentPage
                                ? 'bg-[#7e246c] text-white border-[#7e246c]'
                                : 'border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c]'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:text-[#7e246c]"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                Delete Pick & Drop Service
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                            Are you sure you want to delete this pick & drop service? This action cannot be undone and will permanently remove the service from the system.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setServiceToDelete(null);
                            }}
                            disabled={deleting}
                            className="border-gray-300 dark:border-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? 'Deleting...' : 'Delete Service'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

