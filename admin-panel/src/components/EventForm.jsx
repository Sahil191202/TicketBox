import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Ticket, Upload } from 'lucide-react';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number({ invalid_type_error: 'Price is required' }).min(0, 'Price must be positive'),
  totalSeats: z.number({ invalid_type_error: 'Total seats is required' }).min(1, 'Must have at least 1 seat'),
  date: z.string().min(1, 'Date and time is required'),
  banner: z.any().optional(),
});

export default function EventForm({ initialData, onSubmit, isSubmitting }) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      price: '',
      totalSeats: '',
      date: '',
    },
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex justify-center">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-[-10%] animate-ticket-fly text-electricViolet"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.5 + Math.random()}s`,
                transform: `scale(${0.5 + Math.random()})`
              }}
            >
              <Ticket size={48} className="drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 text-gray-200">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          
          <div className="sm:col-span-2 opacity-0 animate-slide-up delay-100">
            <label htmlFor="title" className="block text-sm font-medium">Event Title</label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                {...register('title')}
                className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:ring-electricViolet focus:border-electricViolet transition-colors"
              />
              {errors.title && <p className="mt-1 text-sm text-hotPink">{errors.title.message}</p>}
            </div>
          </div>

          <div className="sm:col-span-2 opacity-0 animate-slide-up delay-200">
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <div className="mt-1">
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:ring-electricViolet focus:border-electricViolet transition-colors"
              />
              {errors.description && <p className="mt-1 text-sm text-hotPink">{errors.description.message}</p>}
            </div>
          </div>

          <div className="opacity-0 animate-slide-up delay-300">
            <label htmlFor="price" className="block text-sm font-medium">Price (₹)</label>
            <div className="mt-1">
              <input
                type="number"
                id="price"
                {...register('price', { valueAsNumber: true })}
                className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:ring-electricViolet focus:border-electricViolet transition-colors"
              />
              {errors.price && <p className="mt-1 text-sm text-hotPink">{errors.price.message}</p>}
            </div>
          </div>

          <div className="opacity-0 animate-slide-up delay-300">
            <label htmlFor="totalSeats" className="block text-sm font-medium">Total Seats</label>
            <div className="mt-1">
              <input
                type="number"
                id="totalSeats"
                {...register('totalSeats', { valueAsNumber: true })}
                className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:ring-electricViolet focus:border-electricViolet transition-colors"
              />
              {errors.totalSeats && <p className="mt-1 text-sm text-hotPink">{errors.totalSeats.message}</p>}
            </div>
          </div>

          <div className="opacity-0 animate-slide-up delay-400">
            <label htmlFor="date" className="block text-sm font-medium">Start Date & Time</label>
            <div className="mt-1">
              <input
                type="datetime-local"
                id="date"
                {...register('date')}
                className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:ring-electricViolet focus:border-electricViolet transition-colors [color-scheme:dark]"
              />
              {errors.date && <p className="mt-1 text-sm text-hotPink">{errors.date.message}</p>}
            </div>
          </div>

          <div className="opacity-0 animate-slide-up delay-400">
            <label className="block text-sm font-medium">Banner Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-xl hover:border-electricViolet/50 transition-colors bg-white/5">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-400">
                  <label htmlFor="banner" className="relative cursor-pointer rounded-md font-medium text-electricViolet hover:text-hotPink focus-within:outline-none">
                    <span>Upload a file</span>
                    <input id="banner" type="file" className="sr-only" {...register('banner')} accept="image/jpeg, image/png" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-6 border-t border-white/10 opacity-0 animate-slide-up delay-500">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="py-2 px-4 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center items-center py-2 px-6 rounded-xl shadow-[0_0_15px_rgba(124,58,237,0.4)] text-sm font-bold text-white bg-gradient-to-r from-electricViolet to-hotPink hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electricViolet focus:ring-offset-deepPurple transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              'Save Event'
            )}
          </button>
        </div>
      </form>
    </>
  );
}
