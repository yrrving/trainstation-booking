import { useState } from 'react';
import type { BookingMode, CreateWishRequest } from '../../types';
import { wishesAPI } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

interface WishFormProps {
  locationId: string;
  mode: BookingMode;
  modeLabel: string;
  optionId?: string;
  optionLabel?: string;
  onCancel: () => void;
  onSubmitted: () => void;
}

export default function WishForm({
  locationId,
  mode,
  modeLabel,
  optionId,
  optionLabel,
  onCancel,
  onSubmitted,
}: WishFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.username ?? '',
    email: '',
    phone: '',
    desired_time: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.email && !formData.phone) {
      setError('Du måste ange minst e-post eller telefon');
      return;
    }

    setSubmitting(true);
    try {
      const request: CreateWishRequest = {
        location_id: locationId,
        mode,
        option_id: optionId,
        option_label: optionLabel,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        desired_time: formData.desired_time,
        message: formData.message || undefined,
      };
      await wishesAPI.create(request);
      onSubmitted();
    } catch (err: any) {
      setError(err.message || 'Något gick fel');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-semibold mb-1 text-gray-100">Skicka önskemål</h2>
      <p className="text-sm text-gray-400 mb-4">
        Passar ingen befintlig tid? Beskriv vad du önskar så återkommer personalen till dig.
      </p>

      <div className="bg-blue-900/40 border border-blue-800 rounded-lg p-3 mb-6 text-sm text-blue-200">
        {modeLabel}
        {optionLabel ? <> · {optionLabel}</> : null}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Namn <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Önskad dag och tid <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.desired_time}
            onChange={(e) => setFormData({ ...formData, desired_time: e.target.value })}
            placeholder="t.ex. tisdagar efter 15, eller fredag 14 juni kl 13–16"
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">E-post</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Meddelande</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={3}
            placeholder="Berätta gärna mer om vad du vill göra"
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <p className="text-xs text-gray-500">
          <span className="text-red-400">*</span> Du måste ange minst e-post eller telefon så vi kan svara.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md font-medium transition"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition disabled:opacity-50"
          >
            {submitting ? 'Skickar...' : 'Skicka önskemål'}
          </button>
        </div>
      </form>
    </div>
  );
}
