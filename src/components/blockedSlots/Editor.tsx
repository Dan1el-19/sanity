import React, { useState } from 'react';
import { ArrowLeft, Save, Calendar, Clock, MessageSquare, ToggleLeft } from 'lucide-react';
import {
  createBlockedSlot,
  updateBlockedSlot,
  type BlockedSlot,
} from '../../lib/services/blockedSlotsService';

export type EditorProps = {
  slot?: BlockedSlot;
  onBack: () => void;
  onSave: () => void;
};

// Generate time slots with 30-minute intervals (8:00 to 21:00)
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 8; hour <= 21; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 21) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

/**
 * Blocked slot editor. Validates date/time ranges and submits create/update
 * requests to the blockedSlots service.
 */
const Editor: React.FC<EditorProps> = ({ slot, onBack, onSave }) => {
  const [formData, setFormData] = useState<Omit<BlockedSlot, '$id' | 'createdAt' | 'updatedAt'>>({
    startDate: slot?.startDate || '',
    endDate: slot?.endDate || '',
    startTime: slot?.startTime || '',
    endTime: slot?.endTime || '',
    reason: slot?.reason || undefined,
    isActive: slot?.isActive ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Data rozpoczęcia jest wymagana';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Data zakończenia jest wymagana';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Godzina rozpoczęcia jest wymagana';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'Godzina zakończenia jest wymagana';
    }
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia';
    }
    if (formData.reason && formData.reason.length > 120) {
      newErrors.reason = 'Powód może mieć maksymalnie 120 znaków';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      if (slot?.$id) {
        // Update existing slot
        await updateBlockedSlot(slot.$id, formData);
      } else {
        // Create new slot
        await createBlockedSlot(formData);
      }
      
      onSave();
    } catch (err) {
      alert('Błąd podczas zapisywania blokady');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-ghost btn-circle"
            aria-label="Wróć"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
              {slot ? 'Edytuj blokadę' : 'Nowa blokada'}
            </h1>
            <p className="text-base-content/60 mt-1">
              Zdefiniuj okres i godziny niedostępności terminów
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Zapisywanie...' : 'Zapisz blokadę'}
        </button>
      </div>

      {/* Form */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <div className="space-y-6">
            {/* Status Toggle */}
            <div className="form-control">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ToggleLeft className="w-5 h-5 text-base-content/60" />
                  <label className="label-text font-medium">
                    Status blokady
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-base-content/60">
                    {formData.isActive ? 'Aktywna' : 'Nieaktywna'}
                  </span>
                  <input
                    type="checkbox"
                    className="toggle toggle-error"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                </div>
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Tylko aktywne blokady będą widoczne w systemie rezerwacji
                </span>
              </label>
            </div>

            <div className="divider"></div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data rozpoczęcia *
                  </span>
                </label>
                <input
                  type="date"
                  className={`input input-bordered w-full ${errors.startDate ? 'input-error' : ''}`}
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
                {errors.startDate && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.startDate}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data zakończenia *
                  </span>
                </label>
                <input
                  type="date"
                  className={`input input-bordered w-full ${errors.endDate ? 'input-error' : ''}`}
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate}
                />
                {errors.endDate && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.endDate}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Godzina rozpoczęcia *
                  </span>
                </label>
                <select
                  className={`select select-bordered w-full ${errors.startTime ? 'select-error' : ''}`}
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                >
                  <option value="">Wybierz godzinę</option>
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.startTime && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.startTime}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Godzina zakończenia *
                  </span>
                </label>
                <select
                  className={`select select-bordered w-full ${errors.endTime ? 'select-error' : ''}`}
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                >
                  <option value="">Wybierz godzinę</option>
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.endTime && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.endTime}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="form-control">
              <label className="label justify-between">
                <span className="label-text flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Powód blokady (opcjonalnie)
                </span>
                <span className="label-text-alt text-base-content/60">
                  {(formData.reason || '').length}/120
                </span>
              </label>
              <textarea
                className={`textarea textarea-bordered h-24 w-full ${errors.reason ? 'textarea-error' : ''}`}
                placeholder="np. Urlop, szkolenie, konserwacja..."
                value={formData.reason || ''}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                maxLength={120}
              />
              {errors.reason && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.reason}</span>
                </label>
              )}
            </div>

            {/* Summary */}
            <div className="alert alert-info">
              <div className="flex flex-col gap-1 text-sm w-full">
                <div className="font-semibold">Podsumowanie blokady:</div>
                <div>
                  Status: <span className="font-medium">{formData.isActive ? 'Aktywna' : 'Nieaktywna'}</span>
                </div>
                {formData.startDate && formData.endDate && (
                  <div className="break-words">
                    Data: <span className="font-medium">
                      {new Date(formData.startDate).toLocaleDateString('pl-PL')} - {new Date(formData.endDate).toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                )}
                {formData.startTime && formData.endTime && (
                  <div>
                    Godziny: <span className="font-medium">{formData.startTime} - {formData.endTime}</span>
                  </div>
                )}
                {formData.reason && formData.reason.trim() && (
                  <div className="break-words">
                    Powód: <span className="font-medium">{formData.reason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
