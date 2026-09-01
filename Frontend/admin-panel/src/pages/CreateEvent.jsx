import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.details?.[0] ||
          'Failed to create event'
      );
    },
  });

  return (
    <div>
      <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-lg">Create New Event</h1>
      <div className="admin-card p-xl">
        <EventForm
          onSubmit={(data) => createMutation.mutateAsync(data)}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  );
}
