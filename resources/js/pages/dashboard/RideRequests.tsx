import { useAuth } from '@/components/AuthContext';
import RideRequestCard, { RideRequest } from '@/components/RideRequestCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/contexts/ToastContext';
import { apiFetch } from '@/lib/utils';
import { MapPin, Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RideRequestsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success: showSuccess, error: showError } = useToast();
    const [requests, setRequests] = useState<RideRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();

            if (searchTerm) {
                params.append('start_location', searchTerm);
            }

            const response = await apiFetch(`/api/customer/ride-requests/my-requests?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch ride requests');
            }

            const data = await response.json();
            setRequests(data.data || []);
        } catch (fetchError) {
            setError(fetchError instanceof Error ? fetchError.message : 'Failed to load ride requests');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        void fetchRequests();
    }, [fetchRequests]);

    const handleDelete = async () => {
        if (!requestToDelete) {
            return;
        }

        setDeleting(true);

        try {
            const response = await apiFetch(`/api/customer/ride-requests/${requestToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete ride request');
            }

            setRequests((current) => current.filter((request) => request.id !== requestToDelete));
            setDeleteDialogOpen(false);
            setRequestToDelete(null);
            showSuccess('Ride Request Deleted', 'The ride request has been removed.');
        } catch (deleteError) {
            showError('Delete Failed', deleteError instanceof Error ? deleteError.message : 'Failed to delete ride request');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-[#7e246c] dark:text-white">Your Ride Requests</h1>
                <Link
                    to="/dashboard/ride-requests/create"
                    className="flex items-center gap-2 rounded-lg bg-[#7e246c] px-4 py-2 text-white transition-colors hover:bg-[#6a1f5c]"
                >
                    <Plus className="h-5 w-5" />
                    Add a Ride Request
                </Link>
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by start location..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            {error ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            ) : null}

            {loading ? (
                <div className="py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#7e246c] border-t-transparent"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
                    <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">No ride requests found yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {requests.map((request) => (
                        <RideRequestCard
                            key={request.id}
                            request={request}
                            onClick={() => navigate(`/ride-requests/${request.id}`)}
                            onEdit={user?.id === request.user?.id ? () => navigate(`/dashboard/ride-requests/${request.id}/edit`) : undefined}
                            onDelete={
                                user?.id === request.user?.id
                                    ? () => {
                                          setRequestToDelete(request.id);
                                          setDeleteDialogOpen(true);
                                      }
                                    : undefined
                            }
                        />
                    ))}
                </div>
            )}

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Ride Request</DialogTitle>
                        <DialogDescription>This action will permanently remove the ride request.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={deleting}
                            onClick={handleDelete}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-70"
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
