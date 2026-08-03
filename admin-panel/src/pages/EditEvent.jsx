import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import EventForm from '../components/EventForm';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch event data
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      // Mock API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id,
            title: 'Summer Music Festival',
            description: 'A great music festival in the summer.',
            price: 1500,
            totalSeats: 500,
            date: '2026-08-15T18:00',
          });
        }, 800);
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // Mock API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id, ...data });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast.success('Event updated successfully');
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['event', id]);
      navigate('/events');
    },
    onError: () => {
      toast.error('Failed to update event');
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold text-white mb-8">Edit Event</h1>
      <div className="glass-panel rounded-2xl p-8">
        <EventForm 
          initialData={event}
          onSubmit={(data) => updateMutation.mutateAsync(data)} 
          isSubmitting={updateMutation.isPending} 
        />
      </div>
    </motion.div>
  );
}
