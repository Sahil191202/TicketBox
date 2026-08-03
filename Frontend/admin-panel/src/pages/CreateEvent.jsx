import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import EventForm from '../components/EventForm';
import { api, toPaise, toIso } from '../lib/api';

export default function CreateEvent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        slug: formData.slug,
        title: formData.title,
        description: formData.description || null,
        banner_key: null,
        price_paise: toPaise(formData.price),
        total_seats: formData.totalSeats,
        starts_at: toIso(formData.date),
        status: 'draft',
      };
      const response = await api.post('/admin/events', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Event created successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setTimeout(() => navigate('/events'), 2200);
    },
    onError: (err) => {
      const message =
        err.response?.data?.error ||
        err.response?.data?.details?.[0] ||
        'Failed to create event';
      toast.error(message);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold text-white mb-8">Create New Event</h1>
      <div className="glass-panel rounded-2xl p-8">
        <EventForm
          onSubmit={(data) => createMutation.mutateAsync(data)}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </motion.div>
  );
}
