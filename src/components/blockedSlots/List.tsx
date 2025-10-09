import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Ban, RefreshCcw } from 'lucide-react';
import LoadingSkeleton from '../LoadingSkeleton';
import ErrorPanel from '../ErrorPanel';
import {
  fetchBlockedSlots,
  deleteBlockedSlot,
  toggleBlockedSlotStatus,
  formatDateRange,
  type BlockedSlot,
} from '../../lib/services/blockedSlotsService';

/**
 * Blocked slots list view. Loads blocked slots and renders actions for
 * toggling, editing and deleting individual block periods.
 */
export type ListProps = {
  onCreateNew: () => void;
  onEdit: (slot: BlockedSlot) => void;
};

const List: React.FC<ListProps> = ({ onCreateNew, onEdit }) => {
  const [slots, setSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadSlots = async (useCache: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBlockedSlots(useCache);
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load without cache on mount (refreshKey ensures fresh mount after save)
    loadSlots(false);
  }, []);

  const handleRefresh = () => {
    // Force refresh without cache
    loadSlots(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę blokadę?')) return;

    try {
      await deleteBlockedSlot(id);
      await loadSlots(false); // Reload without cache after delete
    } catch (err) {
      alert('Błąd podczas usuwania blokady');
      console.error(err);
    }
  };

  const handleToggleStatus = async (slot: BlockedSlot) => {
    if (!slot.$id) return;

    try {
      setToggling(slot.$id);
      await toggleBlockedSlotStatus(slot.$id, slot.isActive);
      
      // Zaktualizuj lokalnie stan bez przeładowania całej listy
      setSlots(prevSlots => 
        prevSlots.map(s => 
          s.$id === slot.$id ? { ...s, isActive: !s.isActive } : s
        )
      );
    } catch (err) {
      alert('Błąd podczas zmiany statusu blokady');
      console.error(err);
      // W przypadku błędu przeładuj listę, aby zsynchronizować stan
      await loadSlots(false);
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <LoadingSkeleton variant="list" itemCount={3} />;
  if (error) return <ErrorPanel error={error} onReload={handleRefresh} title="Błąd ładowania blokad" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Blokady terminów</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="btn btn-ghost gap-2 border border-base-300 bg-base-100/90 text-base-content/80 hover:text-base-content hover:border-primary/40 hover:bg-base-100"
            title="Pobierz najnowsze dane"
          >
            <RefreshCcw className="w-5 h-5" />
            Odśwież
          </button>
          <button
            type="button"
            onClick={onCreateNew}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-5 h-5" />
            Nowa blokada
          </button>
        </div>
      </div>

      {/* List */}
      {slots.length === 0 ? (
        <div className="text-center py-14 sm:py-20">
          <Ban className="w-14 h-14 sm:w-16 sm:h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold text-base-content mb-2">Brak blokad</h3>
          <button
            type="button"
            onClick={onCreateNew}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-5 h-5" />
            Utwórz pierwszą blokadę
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          {slots.map(slot => {
            const dateRange = formatDateRange(slot.startDate, slot.endDate);
            
            return (
              <div
                key={slot.$id}
                className={`card bg-base-200 shadow-md hover:shadow-xl transition-all duration-300 border ${
                  slot.isActive ? 'border-error/30' : 'border-base-300'
                }`}
              >
                <div className="card-body">
                  {/* Title Section */}
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Ban className={`w-5 h-5 shrink-0 transition-colors duration-300 ${slot.isActive ? 'text-error' : 'text-base-content/30'}`} />
                        <h3 className="font-semibold text-base truncate" title={slot.reason || 'Blokada terminów'}>
                          {slot.reason && slot.reason.trim() ? slot.reason : 'Blokada terminów'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-base-content/60 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ID: {slot.$id?.slice(-8)}</span>
                      </div>
                    </div>
                    
                    {/* Status Toggle */}
                    <div className="form-control">
                      <label className="label cursor-pointer gap-2">
                        <input
                          type="checkbox"
                          className={`toggle toggle-error toggle-sm transition-opacity duration-200 ${toggling === slot.$id ? 'opacity-50' : 'opacity-100'}`}
                          checked={slot.isActive}
                          onChange={() => handleToggleStatus(slot)}
                          disabled={toggling === slot.$id}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Calendar className="w-4 h-4 text-base-content/60 shrink-0" />
                      <span className="text-base-content/70">Data:</span>
                      <span className="font-medium">{dateRange}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Clock className="w-4 h-4 text-base-content/60 shrink-0" />
                      <span className="text-base-content/70">Godziny:</span>
                      <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`badge transition-all duration-300 ${slot.isActive ? 'badge-error' : 'badge-ghost'} gap-1`}>
                      {slot.isActive ? 'Aktywna' : 'Nieaktywna'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(slot)}
                      className="btn btn-sm btn-ghost gap-2 flex-1 sm:flex-none"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edytuj</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => slot.$id && handleDelete(slot.$id)}
                      className="btn btn-sm btn-ghost text-error gap-2 flex-1 sm:flex-none"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Usuń</span>
                    </button>
                  </div>
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
