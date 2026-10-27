import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

const ReviewForm = ({ productId, onSuccess }) => {
  const { t } = useTranslation();

  const reviewSchema = z.object({
    rating: z.number().min(1, t('Veuillez donner une note')).max(5),
    title: z.string().min(3, t('Le titre doit contenir au moins 3 caractères')),
    text: z.string().min(20, t('L\'avis doit contenir au moins 20 caractères')),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      text: ''
    }
  });

  const rating = watch('rating');

  const onSubmit = async (data) => {
    // In a real app, this would POST to /reviews with auth token
    // The CDC states: impossible to leave review without delivered order on this SKU
    // We would handle this API side (return 403 if not authorized)
    console.log('Submit review:', data);
    await new Promise(r => setTimeout(r, 1000));
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">{t('Note')} *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setValue('rating', star, { shouldValidate: true })}
              className="p-1 focus:outline-none"
            >
              <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300 dark:text-gray-700 hover:text-yellow-400'}`} />
            </button>
          ))}
        </div>
        {errors.rating && <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">{t('Titre de l\'avis')} *</label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
          placeholder={t('Résumé de votre avis')}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
      </div>

      {/* Text */}
      <div>
        <label htmlFor="text" className="block text-sm font-medium mb-2">{t('Votre avis détaillé')} *</label>
        <textarea
          id="text"
          rows="4"
          {...register('text')}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none"
          placeholder={t('Partagez votre expérience (min. 20 caractères)')}
        ></textarea>
        {errors.text && <p className="mt-1 text-sm text-red-500">{errors.text.message}</p>}
      </div>

      {/* Notice about Verification */}
      <div className="text-sm text-gray-500">
        <p>{t('Seuls les clients ayant acheté cet article peuvent laisser un avis. Votre avis sera marqué comme "Achat vérifié".')}</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-full disabled:opacity-50"
      >
        {isSubmitting ? t('Envoi en cours...') : t('Publier l\'avis')}
      </button>
    </form>
  );
};

export default ReviewForm;
