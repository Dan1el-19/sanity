import React, { useState } from 'react';
import { Copy, CheckSquare, Eraser } from 'lucide-react';
import TimeSlotSelector from './TimeSlotSelector';
import { WEEKDAYS, WEEKDAY_LABELS, TIME_SLOTS, type WeekDay, type SchedulePreset } from '../../lib/services/schedulesService';

export type WeekScheduleEditorProps = {
  schedule: Omit<SchedulePreset, '$id' | 'createdAt' | 'updatedAt'>;
  onScheduleChange: (schedule: Omit<SchedulePreset, '$id' | 'createdAt' | 'updatedAt'>) => void;
};

/**
 * WeekScheduleEditor provides a compact UI to toggle available time slots per weekday.
 * Designed mobile-first with a horizontal day selector and time grid.
 */
const WeekScheduleEditor: React.FC<WeekScheduleEditorProps> = ({ schedule, onScheduleChange }) => {
  // Mobile-first: edit one day at a time with a horizontal day selector
  const [activeDay, setActiveDay] = useState<WeekDay>('monday');
  const toggleTimeSlot = (day: WeekDay, time: string) => {
    const daySchedule = schedule[day];
    const newDaySchedule = daySchedule.includes(time)
      ? daySchedule.filter(t => t !== time)
      : [...daySchedule, time].sort();
    
    onScheduleChange({
      ...schedule,
      [day]: newDaySchedule,
    });
  };

  const toggleAllSlotsInDay = (day: WeekDay) => {
    const allSelected = TIME_SLOTS.every(time => schedule[day].includes(time));
    onScheduleChange({
      ...schedule,
      [day]: allSelected ? [] : [...TIME_SLOTS],
    });
  };

  const copyDayToAll = (sourceDay: WeekDay) => {
    const sourceDaySchedule = schedule[sourceDay];
    const newSchedule = { ...schedule };
    WEEKDAYS.forEach(day => {
      newSchedule[day] = [...sourceDaySchedule];
    });
    onScheduleChange(newSchedule);
  };

  const clearDay = (day: WeekDay) => {
    onScheduleChange({
      ...schedule,
      [day]: [],
    });
  };

  return (
    <div className="space-y-6">
      {/* Day selector (horizontal, scrollable) */}
      <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {WEEKDAYS.map(day => {
            const isActive = activeDay === day;
            const count = schedule[day].length;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`px-3 py-2 rounded-md border text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-primary-content border-primary shadow'
                    : 'bg-base-100 text-base-content border-base-300 hover:border-primary/40 hover:bg-primary/10'
                }`}
                aria-pressed={isActive}
              >
                <span className="font-medium">{WEEKDAY_LABELS[day]}</span>
                <span className={`ml-2 inline-flex items-center justify-center text-xs px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-primary-content/20' : 'bg-base-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active day actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-base-content/70">
          Edytujesz: <span className="font-semibold">{WEEKDAY_LABELS[activeDay]}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggleAllSlotsInDay(activeDay)}
            className="btn btn-sm btn-ghost gap-2"
            title="Zaznacz/odznacz wszystkie sloty w dniu"
          >
            <CheckSquare className="w-4 h-4" />
            Wszystkie
          </button>
          <button
            type="button"
            onClick={() => clearDay(activeDay)}
            className="btn btn-sm btn-ghost gap-2"
            title="Wyczyść wybrany dzień"
          >
            <Eraser className="w-4 h-4" />
            Wyczyść dzień
          </button>
          <button
            type="button"
            onClick={() => copyDayToAll(activeDay)}
            className="btn btn-sm btn-ghost gap-2"
            title="Skopiuj sloty z tego dnia do wszystkich dni tygodnia"
          >
            <Copy className="w-4 h-4" />
            Kopiuj do wszystkich
          </button>
        </div>
      </div>

      {/* Time grid for active day */}
      <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-3">
        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
          {TIME_SLOTS.map(time => (
            <div key={time} className="flex">
              <TimeSlotSelector
                time={time}
                isSelected={schedule[activeDay].includes(time)}
                onToggle={() => toggleTimeSlot(activeDay, time)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-base-200 rounded-lg p-4 border border-base-300">
        <h3 className="text-sm font-semibold text-base-content/80 mb-3">Podsumowanie</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center">
              <div className="text-xs text-base-content/60 mb-1">{WEEKDAY_LABELS[day]}</div>
              <div className="text-lg font-bold text-primary">{schedule[day].length}</div>
              <div className="text-xs text-base-content/50">slotów</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekScheduleEditor;
