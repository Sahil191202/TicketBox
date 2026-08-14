import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, toRupees } from '../lib/api';
import { useDebouncedValue } from '../lib/useDebouncedValue';

const PAGE_SIZE = 10;

export default function Events() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const search = useDebouncedValue(q.trim(), 300);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const { data: eventsData, isLoading, isError, error } = useQuery({
    queryKey: ['events', page, search, status],
    queryFn: async () => {
      const response = await api.get('/admin/events', {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(search ? { q: search } : {}),
          ...(status ? { status } : {}),
        },
      });
      return response.data;
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, status: eventStatus }) => {
      const path =
        eventStatus === 'published'
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

  const rangeLabel = useMemo(() => {
    if (!pagination.total) return 'Showing 0 entries';
    const start = (pagination.page - 1) * PAGE_SIZE + 1;
    const end = Math.min(pagination.page * PAGE_SIZE, pagination.total);
    return `Showing ${start} to ${end} of ${pagination.total} entries`;
  }, [pagination]);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-md mb-lg">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">
            Events Management
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Create, publish, and manage event listings.
          </p>
        </div>
        <div className="flex gap-sm">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setShowFilters((v) => !v)}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filter
          </button>
          <Link to="/events/create" className="btn-primary !rounded-lg !py-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Event
          </Link>
        </div>
      </div>

      <div className="mb-md">
        <div className="relative flex items-center input-glow rounded-full border border-outline-variant bg-surface-container-lowest max-w-xl">
          <span className="material-symbols-outlined text-on-surface-variant absolute left-sm text-[20px]">
            search
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full h-[40px] pl-[40px] pr-md rounded-full bg-transparent text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant/60 focus:outline-none"
            placeholder="Search events by title or slug..."
            autoComplete="off"
          />
        </div>
      </div>

      {showFilters && (
        <div className="border border-outline-variant rounded-xl p-md bg-surface-container-lowest flex flex-wrap gap-md mb-md">
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="h-[40px] px-md rounded-lg border-[1.5px] border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:border-primary focus:ring-0 appearance-none cursor-pointer"
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      )}

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
        ) : events.length === 0 ? (
          <div className="p-xl flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-[32px]">calendar_today</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
              No events found
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[300px]">
              {search || status
                ? 'Try a different search or clear filters.'
                : 'Create your first event to get started.'}
            </p>
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
                            label === 'Actions' || label === 'Price' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="h-[48px] border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-md">
                        <div className="font-body-sm text-body-sm font-medium text-on-surface">
                          {event.title}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          {event.slug}
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
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-md py-sm border-t border-outline-variant">
              <p className="font-body-sm text-body-sm text-on-surface-variant">{rangeLabel}</p>
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
                  className="h-[32px] min-w-[32px] px-sm rounded-lg bg-primary-container text-on-primary font-bold font-body-sm text-body-sm"
                >
                  {pagination.page}
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
