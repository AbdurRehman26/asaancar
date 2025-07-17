import { useEffect, useState } from 'react';
import { Calendar, MapPin, Car } from 'lucide-react';
import Navbar from '../components/navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginModal from '@/pages/auth/login-modal';
import { apiFetch } from '@/lib/utils';
import { useAuth } from '@/components/AuthContext';
import Chat from '../components/chat';

type Booking = {
  id: number;
  car: {
    id: number;
    name: string;
    brand: string;
    model: string;
    year?: number;
    image?: string;
    currency?: string;
    store?: {
      id: number;
      name?: string;
      address?: string;
      phone?: string;
    };
  };
  start_date: string;
  end_date: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  total_price: number;
};

// Simple Pagination Component (copied from car-listing)
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) {
  return (
    <div className="flex justify-center items-center gap-2 my-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-900 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
      >Prev</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded font-semibold border ${page === currentPage ? 'bg-[#7e246c] text-white border-[#7e246c]' : 'border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-900 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c]'}`}
        >{page}</button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-900 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
      >Next</button>
    </div>
  );
}

export default function Bookings() {
  const { user, token } = useAuth();
  console.log('user:', user, 'token:', token);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      console.log('No user, skipping bookings fetch');
      return;
    }
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', String(page));
    params.append('per_page', String(pagination.per_page));
    apiFetch(`/api/bookings?${params.toString()}`)
      .then(async (res) => {
        console.log('Bookings API response:', res);
        if (!res.ok) {
          setError('Failed to fetch bookings');
          setBookings([]);
        } else {
          const data = await res.json();
          console.log('Bookings data:', data);
          setBookings(data.data || []);
          setPagination({
            current_page: data.current_page,
            last_page: data.last_page,
            per_page: data.per_page,
            total: data.total,
          });
        }
      })
      .catch((e) => {
        setError('Network error');
        console.error('Bookings fetch error:', e);
      })
      .finally(() => setLoading(false));
  }, [user, status, page, pagination.per_page]);

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

  // Message Store logic
  const handleOpenChat = async (storeId: number) => {
    setChatError(null);
    if (!user) {
      setShowChat(true);
      setConversationId(null);
      setChatError('Please log in to start a chat with the store.');
      return;
    }
    try {
      const res = await apiFetch('/api/chat/conversations');
      const data = await res.json();
      const conv = data.find((c: { type: string; store_id: number }) => c.type === 'store' && String(c.store_id) === String(storeId));
      if (conv) {
        setConversationId(conv.id);
        setShowChat(true);
        setChatError(null);
      } else {
        const createRes = await apiFetch('/api/chat/conversations', {
          method: 'POST',
          body: JSON.stringify({ type: 'store', store_id: storeId }),
        });
        const newConv = await createRes.json();
        if (newConv && newConv.id) {
          setConversationId(newConv.id);
          setShowChat(true);
          setChatError(null);
        } else {
          throw new Error('Failed to create conversation.');
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setShowChat(true);
        setConversationId(null);
        setChatError('Could not start chat. Please try again later. ' + e.message);
      } else {
        setShowChat(true);
        setConversationId(null);
        setChatError('Could not start chat. Please try again later. An unknown error occurred.');
      }
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
  console.log('Bookings data:', bookings);
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
        </DialogContent>
      </Dialog>

      {/* Floating Chat Widget */}
      {showChat && user && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-full h-[500px] bg-gray-900 rounded-xl shadow-2xl flex flex-col border border-gray-800">
          <div className="flex items-center justify-between px-4 py-2 bg-[#7e246c] rounded-t-xl">
            <span className="text-white font-semibold">Store Chat</span>
            <button onClick={() => setShowChat(false)} className="text-white text-xl font-bold">&times;</button>
          </div>
          <div className="flex-1 min-h-0">
            {chatError ? (
              <div className="flex items-center justify-center h-full text-red-400 text-center px-4">{chatError}</div>
            ) : typeof conversationId === 'number' ? (
              <Chat conversationId={conversationId} currentUser={user} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">No conversation selected.</div>
            )}
          </div>
        </div>
      )}
      <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 pt-28">
        {/* Navbar */}
        <Navbar 
          currentPage="bookings" 
          auth={{ user }}
          onLoginClick={() => setLoginOpen(true)}
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
            {/* Filter Controls */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                <select
                  className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                  value={status}
                  onChange={e => { setStatus(e.target.value); setPage(1); }}
                >
                  <option value="">All</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            {/* Pagination Controls (Top) */}
            {bookings.length > 0 && (
              <Pagination
                currentPage={page}
                totalPages={pagination.last_page}
                onPageChange={setPage}
              />
            )}
            {loading ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading bookings...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-600 dark:text-red-400">{error}</div>
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
              <>
                <div className="space-y-6">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition bg-white dark:bg-gray-800"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={booking.car?.image || '/images/car-placeholder.jpeg'} 
                            alt={booking.car?.name}
                            className="w-16 h-16 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {booking.car?.brand} {booking.car?.model}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'}
                                  {booking.end_date ? ' - ' + new Date(booking.end_date).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate max-w-32">
                                  {booking.car?.store?.address || 'N/A'}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Store: {booking.car?.store?.name || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                          <div className="text-lg font-bold text-[#7e246c] dark:text-white">
                            {booking.total_price ? `${booking.total_price} ${booking.car?.currency || ''}` : 'N/A'}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <a
                              href={`/car-detail/${booking.car?.id}`}
                              className="px-4 py-2 rounded-md bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition text-sm"
                              onClick={e => e.stopPropagation()}
                            >
                              View Details
                            </a>
                            <button
                              className="px-4 py-2 rounded-md bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition text-sm"
                              onClick={async e => {
                                e.stopPropagation();
                                if (booking.car?.store?.id) await handleOpenChat(booking.car.store.id);
                              }}
                              disabled={!booking.car?.store?.id}
                            >
                              Message
                            </button>
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
                {/* Pagination Controls (Bottom) */}
                <Pagination
                  currentPage={page}
                  totalPages={pagination.last_page}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 