import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

// Mock data for Day 2
const MOCK_EVENTS = [
  { id: 1, title: 'Summer Music Festival', price: 1500, totalSeats: 500, status: 'published', date: '2026-08-15T18:00:00Z' },
  { id: 2, title: 'Tech Conference 2026', price: 2500, totalSeats: 200, status: 'draft', date: '2026-09-10T09:00:00Z' },
  { id: 3, title: 'Comedy Night', price: 800, totalSeats: 150, status: 'published', date: '2026-08-20T20:00:00Z' },
];

export default function Events() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', page],
    queryFn: async () => {
      // Mock API call for now to show dummy events
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: MOCK_EVENTS,
            total: 3,
            page,
            totalPages: 1
          });
        }, 800);
      });
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      // Mock API call
      return new Promise((resolve) => {
        setTimeout(() => resolve({ id, newStatus }), 500);
      });
    },
    onSuccess: (data) => {
      // Update mock data locally for demonstration
      const eventIndex = MOCK_EVENTS.findIndex(e => e.id === data.id);
      if (eventIndex > -1) MOCK_EVENTS[eventIndex].status = data.newStatus;
      queryClient.invalidateQueries(['events']);
    }
  });

  const handleToggleStatus = (event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    togglePublishMutation.mutate({ id: event.id, newStatus });
  };

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
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Event Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Price (₹)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {eventsData?.data?.map((event) => (
                  <tr key={event.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{event.title}</div>
                      <div className="text-sm text-gray-400">{event.totalSeats} seats</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      ₹{event.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        event.status === 'published' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {event.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-4">
                        <button 
                          onClick={() => handleToggleStatus(event)}
                          className="text-gray-400 hover:text-electricViolet transition-colors"
                          title={event.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {event.status === 'published' ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        <Link to={`/events/${event.id}/edit`} className="text-gray-400 hover:text-hotPink transition-colors">
                          <Edit2 className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="bg-white/5 px-6 py-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">{eventsData?.data?.length || 0}</span> of <span className="font-medium text-white">{eventsData?.total || 0}</span> results
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-lg border border-white/10 text-sm font-medium text-gray-400 hover:bg-white/5 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={!eventsData?.data?.length || eventsData?.data?.length < 10}
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
