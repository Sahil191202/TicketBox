import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Ticket } from 'lucide-react';
import { slugify } from '../lib/api';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase kebab-case (e.g. my-event)'),
  description: z.string().optional(),
  price: z
    .number({ invalid_type_error: 'Price is required' })
    .min(0, 'Price must be 0 or more'),
  totalSeats: z
    .number({ invalid_type_error: 'Total seats is required' })
    .int('Must be a whole number')
    .min(1, 'Must have at least 1 seat'),
  date: z.string().min(1, 'Date and time is required'),
  banner: z.any().optional(),
});

export default function EventForm({ initialData, onSubmit, isSubmitting, isEdit = false }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || {
      title: '',
      slug: '',
      description: '',
      price: '',
      totalSeats: '',
      date: '',
    },
  });

  const titleValue = watch('title');

  useEffect(() => {
    if (!slugTouched && titleValue) {
      setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, slugTouched, setValue]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } catch {
      // Parent shows toast
    }
  };

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex justify-center">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-[-10%] animate-ticket-fly text-primary-container"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.5 + Math.random()}s`,
                transform: `scale(${0.5 + Math.random()})`,
              }}
            >
              <Ticket size={48} />
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-2">
          <div className="sm:col-span-2 opacity-0 animate-slide-up delay-100">
            <label htmlFor="title" className="input-label">Event Title</label>
            <input id="title" type="text" {...register('title')} className="input-field" />
            {errors.title && <p className="mt-1 text-sm text-error">{errors.title.message}</p>}
          </div>

          <div className="sm:col-span-2 opacity-0 animate-slide-up delay-100">
            <label htmlFor="slug" className="input-label">Slug</label>
            <input
              id="slug"
              type="text"
              {...register('slug', { onChange: () => setSlugTouched(true) })}
              className="input-field font-code-ticket"
              placeholder="my-event-slug"
            />
            {errors.slug && <p className="mt-1 text-sm text-error">{errors.slug.message}</p>}
          </div>

          <div className="sm:col-span-2 opacity-0 animate-slide-up delay-200">
            <label htmlFor="description" className="input-label">Description</label>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className="input-field !h-auto py-3"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error">{errors.description.message}</p>
            )}
          </div>

          <div className="opacity-0 animate-slide-up delay-300">
            <label htmlFor="price" className="input-label">Price (₹)</label>
            <input
              id="price"
              type="number"
              step="1"
              min="0"
              {...register('price', { valueAsNumber: true })}
              className="input-field"
            />
            {errors.price && <p className="mt-1 text-sm text-error">{errors.price.message}</p>}
          </div>

          <div className="opacity-0 animate-slide-up delay-300">
            <label htmlFor="totalSeats" className="input-label">Total Seats</label>
            <input
              id="totalSeats"
              type="number"
              min="1"
              {...register('totalSeats', { valueAsNumber: true })}
              className="input-field"
            />
            {errors.totalSeats && (
              <p className="mt-1 text-sm text-error">{errors.totalSeats.message}</p>
            )}
          </div>

          <div className="opacity-0 animate-slide-up delay-400">
            <label htmlFor="date" className="input-label">Start Date & Time</label>
            <input
              id="date"
              type="datetime-local"
              {...register('date')}
              className="input-field"
            />
            {errors.date && <p className="mt-1 text-sm text-error">{errors.date.message}</p>}
          </div>

          <div className="opacity-0 animate-slide-up delay-400">
            <span className="input-label">Banner Image</span>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-outline-variant rounded-xl hover:border-primary-container/50 transition-colors bg-surface-container-low">
              <div className="space-y-1 text-center">
                <span className="material-symbols-outlined mx-auto text-[40px] text-on-surface-variant">upload</span>
                <div className="flex text-sm text-on-surface-variant justify-center">
                  <label
                    htmlFor="banner"
                    className="relative cursor-pointer font-medium text-primary hover:text-surface-tint"
                  >
                    <span>Upload a file</span>
                    <input
                      id="banner"
                      type="file"
                      className="sr-only"
                      {...register('banner')}
                      accept="image/jpeg, image/png"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-on-surface-variant">PNG, JPG up to 5MB · S3 upload comes Day 5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-sm pt-lg border-t border-outline-variant opacity-0 animate-slide-up delay-500">
          <button type="button" onClick={() => window.history.back()} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary !rounded-lg">
            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Event'}
          </button>
        </div>
      </form>
    </>
  );
}
