import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Tag } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorPanel from './ErrorPanel';
import {
  fetchSchedulePresets,
  deleteSchedulePreset,
  formatMonthLabel,
  type SchedulePreset,
  WEEKDAY_LABELS,
  WEEKDAYS,
} from '../../lib/services/schedulesService';

export type ListProps = {
  onCreateNew: () => void;
  onEdit: (preset: SchedulePreset) => void;
};

const List: React.FC<ListProps> = ({ onCreateNew, onEdit }) => {
  const [presets, setPresets] = useState<SchedulePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPresets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSchedulePresets();
      setPresets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten grafik?')) return;

    try {
      await deleteSchedulePreset(id);
      await loadPresets();
    } catch (err) {
      alert('Błąd podczas usuwania grafiku');
      console.error(err);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorPanel error={error} onReload={loadPresets} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Grafiki pracy</h1>
          <p className="text-base-content/60 mt-1">Zarządzaj szablonami grafików dla różnych miesięcy</p>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="btn btn-primary gap-2"
        >
          <Plus className="w-5 h-5" />
          Nowy grafik
        </button>
      </div>

      {/* List */}
      {presets.length === 0 ? (
        <div className="text-center py-14 sm:py-20">
          <Calendar className="w-14 h-14 sm:w-16 sm:h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold text-base-content mb-2">Brak grafików</h3>
          <p className="text-base-content/60 mb-6">Rozpocznij od utworzenia pierwszego szablonu grafiku</p>
          <button
            type="button"
            onClick={onCreateNew}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-5 h-5" />
            Utwórz pierwszy grafik
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          {presets.map(preset => {
            const totalSlots = WEEKDAYS.reduce((sum, day) => sum + preset[day].length, 0);
            
            return (
              <div
                key={preset.$id}
                className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow border border-base-300"
              >
                <div className="card-body">
                  {/* Title Section */}
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-primary shrink-0" />
                        <h3 className="card-title text-lg truncate" title={preset.name || `Grafik #${preset.$id?.slice(-6)}`}>
                          {preset.name && preset.name.trim().length > 0 ? preset.name : `Grafik #${preset.$id?.slice(-6)}`}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-base-content/60 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ID: {preset.$id?.slice(-8)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(preset)}
                        className="btn btn-sm btn-ghost gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edytuj
                      </button>
                      <button
                        type="button"
                        onClick={() => preset.$id && handleDelete(preset.$id)}
                        className="btn btn-sm btn-ghost text-error gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Usuń
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-base-content/70">Łącznie slotów:</span>
                      <span className="font-semibold text-primary text-lg">{totalSlots}</span>
                    </div>
                    
                    {/* Week Summary */}
                    <div className="grid grid-cols-7 gap-1 pt-2">
                      {WEEKDAYS.map(day => (
                        <div key={day} className="text-center">
                          <div className="text-[10px] text-base-content/50 uppercase mb-0.5">
                            {WEEKDAY_LABELS[day].slice(0, 2)}
                          </div>
                          <div className={`text-xs font-bold ${preset[day].length > 0 ? 'text-primary' : 'text-base-content/30'}`}>
                            {preset[day].length}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Months */}
                  {preset.assignedMonths && preset.assignedMonths.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-base-content/60 mb-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Przypisane miesiące:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {preset.assignedMonths.slice(0, 3).map(month => (
                          <span
                            key={month}
                            className="badge badge-primary badge-sm"
                          >
                            {formatMonthLabel(month)}
                          </span>
                        ))}
                        {preset.assignedMonths.length > 3 && (
                          <span className="badge badge-ghost badge-sm">
                            +{preset.assignedMonths.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions moved to header for better mobile UX */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default List;
