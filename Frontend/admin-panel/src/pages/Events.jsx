import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api, toRupees } from '../lib/api';

const PAGE_SIZE = 10;

export default function Events() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: eventsData, isLoading, isError, error } = useQuery({
    queryKey: ['events', page],
    queryFn: async () => {
      const response = await api.get('/admin/events', {
        params: { page, limit: PAGE_SIZE },
      });
      return response.data;
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const path =
        status === 'published'
          ? `/admin/events/${id}/unpublish`
          : `/admin/events/${id}/publish`;
      const response = await api.patch(path);
      return response.data;
    },
    onSuccess: (event) => {
      toast.success(
        event.status === 'published' ? 'Event published' : 'Event unpublished'
      );
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update status');
    },
  });

  const events = eventsData?.data ?? [];
  const pagination = eventsData?.pagination ?? { page: 1, total: 0, total_pages: 1 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Events Management</h1>
        <Link
          to="/events/create"
          className="inline-flex items-center px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(124,58,237,0.4)] text-sm font-bold text-white bg-gradient-to-r from-electricViolet to-hotPink hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electricViolet focus:ring-offset-deepPurple transition-all"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Create Event
        </Link>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-electricViolet animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-64 text-hotPink">
            {error.response?.data?.error || 'Failed to load events. Is the API running on :4000?'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Price (₹)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Total Seats
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No events yet. Create your first one.
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{event.title}</div>
                        <div className="text-sm text-gray-400">{event.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        ₹{toRupees(event.price_paise).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {event.total_seats}
                        <span className="text-gray-500"> ({event.seats_left} left)</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                            event.status === 'published'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {event.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(event.starts_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() =>
                              togglePublishMutation.mutate({
                                id: event.id,
                                status: event.status,
                              })
                            }
                            disabled={togglePublishMutation.isPending}
                            className="text-gray-400 hover:text-electricViolet transition-colors disabled:opacity-50"
                            title={
                              event.status === 'published' ? 'Unpublish' : 'Publish'
                            }
                          >
                            {event.status === 'published' ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                          <Link
                            to={`/events/${event.id}/edit`}
                            className="text-gray-400 hover:text-hotPink transition-colors"
                          >
                            <Edit2 className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="bg-white/5 px-6 py-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page{' '}
                <span className="font-medium text-white">{pagination.page}</span> of{' '}
                <span className="font-medium text-white">
                  {pagination.total_pages || 1}
                </span>{' '}
                ·{' '}
                <span className="font-medium text-white">{pagination.total}</span>{' '}
                total
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded-lg border border-white/10 text-sm font-medium text-gray-400 hover:bg-white/5 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (pagination.total_pages || 1)}
                  className="px-3 py-1 rounded-lg border border-white/10 text-sm font-medium text-gray-400 hover:bg-white/5 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
