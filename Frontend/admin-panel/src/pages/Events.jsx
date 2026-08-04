import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    <div>
      <div className="flex flex-wrap justify-between items-center gap-md mb-lg">
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
          Events Management
        </h1>
        <Link to="/events/create" className="btn-primary !rounded-lg !py-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Event
        </Link>
      </div>

      <div className="rounded-xl border border-outline-variant overflow-hidden bg-surface-container-lowest">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-primary-container animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-64 text-error font-body-sm text-body-sm">
            {error.response?.data?.error ||
              'Failed to load events. Is the API running on :4000?'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    {['Event Title', 'Price', 'Seats', 'Status', 'Start Date', 'Actions'].map(
                      (label) => (
                        <th
                          key={label}
                          className={`px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider whitespace-nowrap ${
                            label === 'Actions' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-md py-xl text-center text-on-surface-variant font-body-sm text-body-sm">
                        No events yet. Create your first one.
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr
                        key={event.id}
                        className="h-[48px] border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors"
                      >
                        <td className="px-md">
                          <div className="font-body-sm text-body-sm font-medium text-on-surface">
                            {event.title}
                          </div>
                        </td>
                        <td className="px-md font-code-ticket text-code-ticket text-on-surface text-right">
                          ₹{toRupees(event.price_paise).toLocaleString('en-IN')}
                        </td>
                        <td className="px-md font-body-sm text-body-sm text-on-surface-variant">
                          {event.total_seats}
                          <span className="text-on-surface-variant/70"> · {event.seats_left} left</span>
                        </td>
                        <td className="px-md">
                          <span
                            className={
                              event.status === 'published' ? 'badge-published' : 'badge-draft'
                            }
                          >
                            {event.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-md font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                          {new Date(event.starts_at).toLocaleString()}
                        </td>
                        <td className="px-md text-right">
                          <div className="flex justify-end gap-xs">
                            <button
                              type="button"
                              onClick={() =>
                                togglePublishMutation.mutate({
                                  id: event.id,
                                  status: event.status,
                                })
                              }
                              disabled={togglePublishMutation.isPending}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-50"
                              title={
                                event.status === 'published' ? 'Unpublish' : 'Publish'
                              }
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {event.status === 'published' ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                            <Link
                              to={`/events/${event.id}/edit`}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-md py-sm border-t border-outline-variant">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Showing page {pagination.page} of {pagination.total_pages || 1} ·{' '}
                {pagination.total} entries
              </p>
              <div className="flex gap-xs">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-[32px] min-w-[32px] px-sm rounded-lg border border-outline-variant font-body-sm text-body-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (pagination.total_pages || 1)}
                  className="h-[32px] min-w-[32px] px-sm rounded-lg border border-outline-variant font-body-sm text-body-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
