import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import EventForm from '../components/EventForm';
import { api, toPaise, toRupees, toIso, toDatetimeLocal } from '../lib/api';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await api.get('/admin/events', {
        params: { page: 1, limit: 100 },
      });
      const found = response.data.data.find((e) => String(e.id) === String(id));
      if (!found) throw new Error('Event not found');
      return {
        title: found.title,
        slug: found.slug,
        description: found.description || '',
        price: toRupees(found.price_paise),
        totalSeats: found.total_seats,
        date: toDatetimeLocal(found.starts_at),
      };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        slug: formData.slug,
        title: formData.title,
        description: formData.description || null,
        price_paise: toPaise(formData.price),
        total_seats: formData.totalSeats,
        starts_at: toIso(formData.date),
      };
      const response = await api.patch(`/admin/events/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Event updated successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      setTimeout(() => navigate('/events'), 2200);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.details?.[0] ||
          'Failed to update event'
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-primary-container animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="admin-card p-xl text-center text-error">Event not found.</div>
    );
  }

  return (
    <div>
      <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-lg">Edit Event</h1>
      <div className="admin-card p-xl">
        <EventForm
          initialData={event}
          isEdit
          onSubmit={(data) => updateMutation.mutateAsync(data)}
          isSubmitting={updateMutation.isPending}
        />
      </div>
    </div>
  );
}
