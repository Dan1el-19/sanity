import React from 'react';

/**
 * StatusFilter renders a group of buttons to filter appointments by status.
 * It exposes a simple onChange callback and keeps markup accessible via role/group.
 */
export type StatusFilterProps = {
  filters: Array<{ value: string; label: string }>;
  active: string;
  onChange: (value: string) => void;
  buttonClass: (active: boolean) => string;
};

const StatusFilter: React.FC<StatusFilterProps> = ({ filters, active, onChange, buttonClass }) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Filtruj wizyty według statusu">
    {filters.map(({ value, label }) => (
      <button
        type="button"
        key={value}
        onClick={() => onChange(value)}
        aria-pressed={active === value}
        className={`${buttonClass(active === value)} capitalize w-full`}
      >
        {label}
      </button>
    ))}
  </div>
);

export default StatusFilter;
