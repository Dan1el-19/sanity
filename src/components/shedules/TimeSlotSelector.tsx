import React from 'react';

export type TimeSlotSelectorProps = {
  time: string;
  isSelected: boolean;
  onToggle: () => void;
};

/**
 * Individual time slot button used by the WeekScheduleEditor grid.
 * Handles selection state and keyboard/mouse interaction.
 */
const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ time, isSelected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`
      px-2.5 py-2 text-xs sm:text-sm font-medium rounded-md border transition-all duration-150 w-full
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1
      ${isSelected 
        ? 'bg-primary text-primary-content border-primary shadow-sm' 
        : 'bg-base-100 text-base-content/70 border-base-300 hover:border-primary/40 hover:bg-primary/10'
      }
    `}
    aria-pressed={isSelected}
  >
    {time}
  </button>
);

export default TimeSlotSelector;
