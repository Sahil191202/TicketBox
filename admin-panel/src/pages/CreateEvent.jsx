import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import EventForm from '../components/EventForm';

export default function CreateEvent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Mock API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: Math.random(), ...data });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast.success('Event created successfully');
      queryClient.invalidateQueries(['events']);
      navigate('/events');
    },
    onError: () => {
      toast.error('Failed to create event');
    }
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
