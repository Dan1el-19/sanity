import React, { useState } from 'react';
import { ArrowLeft, Save, Calendar, Type } from 'lucide-react';
import WeekScheduleEditor from './WeekScheduleEditor';
import MonthAssignmentPanel from './MonthAssignmentPanel';
import {
  createSchedulePreset,
  updateSchedulePreset,
  WEEKDAYS,
  type SchedulePreset,
} from '../../lib/services/schedulesService';

export type EditorProps = {
  preset?: SchedulePreset;
  onBack: () => void;
  onSave: () => void;
};

/**
 * Schedule Editor. Handles creating and updating schedule presets.
 * Validates preset name and coordinates saving via the schedules service.
 */
const Editor: React.FC<EditorProps> = ({ preset, onBack, onSave }) => {
  const [schedule, setSchedule] = useState<Omit<SchedulePreset, '$id' | 'createdAt' | 'updatedAt'>>({
    name: preset?.name || '',
    monday: preset?.monday || [],
    tuesday: preset?.tuesday || [],
    wednesday: preset?.wednesday || [],
    thursday: preset?.thursday || [],
    friday: preset?.friday || [],
    saturday: preset?.saturday || [],
    sunday: preset?.sunday || [],
    assignedMonths: preset?.assignedMonths || [],
  });

  const [showMonthPanel, setShowMonthPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      // Validate name
      const trimmed = (schedule.name || '').trim();
      if (trimmed.length === 0) {
        setNameError('Podaj nazwę presetu');
        setSaving(false);
        return;
      }
      if (trimmed.length > 128) {
        setNameError('Nazwa może mieć maks. 128 znaków');
        setSaving(false);
        return;
      }
      setNameError(null);
      
      if (preset?.$id) {
        // Update existing preset
        await updateSchedulePreset(preset.$id, { ...schedule, name: trimmed });
      } else {
        // Create new preset
        await createSchedulePreset({ ...schedule, name: trimmed });
      }
      
      onSave();
    } catch (err) {
      alert('Błąd podczas zapisywania grafiku');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleMonthsAssign = (months: string[]) => {
    setSchedule(prev => ({
      ...prev,
      assignedMonths: months,
    }));
  };

  const totalSlots = WEEKDAYS.reduce((sum, day) => sum + schedule[day].length, 0);

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
              {preset ? 'Edytuj grafik' : 'Nowy grafik'}
            </h1>
            <p className="text-base-content/60 mt-1">
              Zaznacz dostępne godziny dla każdego dnia tygodnia
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowMonthPanel(true)}
            className="btn btn-ghost gap-2"
          >
            <Calendar className="w-5 h-5" />
            Przypisz miesiące
            {schedule.assignedMonths.length > 0 && (
              <span className="badge badge-primary badge-sm">
                {schedule.assignedMonths.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || totalSlots === 0 || !schedule.name?.trim()}
            className="btn btn-primary gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Zapisywanie...' : 'Zapisz'}
          </button>
        </div>
      </div>

  {/* Preset name + Stats Bar */}
  <div className="space-y-5">
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text flex items-center gap-2 text-base-content/80">
              <Type className="w-4 h-4" />
              Nazwa presetu
            </span>
            <span className="label-text-alt text-base-content/50">max 128 znaków</span>
          </div>
          <input
            type="text"
            placeholder="Np. Grafik wakacyjny 2025"
            className={`input input-bordered w-full ${nameError ? 'input-error' : ''}`}
            value={schedule.name || ''}
            maxLength={128}
            onChange={(e) => setSchedule(prev => ({ ...prev, name: e.target.value }))}
          />
          {nameError && (
            <div className="label">
              <span className="label-text-alt text-error">{nameError}</span>
            </div>
          )}
        </label>

  <div className="mt-5 sm:mt-6 stats shadow-sm bg-base-100 border border-base-300 w-full">
        <div className="stat">
          <div className="stat-title">Łącznie slotów</div>
          <div className="stat-value text-primary">{totalSlots}</div>
          <div className="stat-desc">w całym tygodniu</div>
        </div>
        <div className="stat">
          <div className="stat-title">Przypisane miesiące</div>
          <div className="stat-value text-secondary">{schedule.assignedMonths.length}</div>
          <div className="stat-desc">
            {schedule.assignedMonths.length === 0 ? 'brak przypisań' : 'aktywnych'}
          </div>
        </div>
        </div>
      </div>

      {/* Editor */}
      <WeekScheduleEditor
        schedule={schedule}
        onScheduleChange={setSchedule}
      />

      {/* Month Assignment Panel */}
      {showMonthPanel && (
        <MonthAssignmentPanel
          assignedMonths={schedule.assignedMonths}
          onAssign={handleMonthsAssign}
          onClose={() => setShowMonthPanel(false)}
        />
      )}
    </div>
  );
};

export default Editor;
