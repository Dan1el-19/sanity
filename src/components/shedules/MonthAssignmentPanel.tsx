import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { generateMonthsList, formatMonthLabel } from '../../lib/services/schedulesService';

export type MonthAssignmentPanelProps = {
  assignedMonths: string[];
  onAssign: (months: string[]) => void;
  onClose: () => void;
};

const MonthAssignmentPanel: React.FC<MonthAssignmentPanelProps> = ({ assignedMonths, onAssign, onClose }) => {
  const [selectedMonths, setSelectedMonths] = useState<string[]>(assignedMonths);
  const availableMonths = generateMonthsList();

  const toggleMonth = (month: string) => {
    setSelectedMonths(prev =>
      prev.includes(month)
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const handleSave = () => {
    onAssign(selectedMonths);
    onClose();
  };

  // Group months by year
  const monthsByYear = availableMonths.reduce((acc, month) => {
    const year = month.split('-')[1];
    if (!acc[year]) acc[year] = [];
    acc[year].push(month);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-base-content">Przypisz miesiące</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {Object.entries(monthsByYear).map(([year, months]) => (
              <div key={year}>
                <h3 className="text-lg font-semibold text-base-content mb-3">{year}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {months.map(month => {
                    const isSelected = selectedMonths.includes(month);
                    return (
                      <button
                        key={month}
                        type="button"
                        onClick={() => toggleMonth(month)}
                        className={`
                          relative px-4 py-3 rounded-lg border-2 transition-all duration-150
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                          ${isSelected
                            ? 'bg-primary text-primary-content border-primary shadow-md'
                            : 'bg-base-100 text-base-content border-base-300 hover:border-primary/40 hover:bg-primary/10'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{formatMonthLabel(month)}</span>
                          {isSelected && <Check className="w-4 h-4 ml-2" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-base-300 bg-base-200">
          <div className="text-sm text-base-content/70">
            Wybrano: <span className="font-semibold text-primary">{selectedMonths.length}</span> {selectedMonths.length === 1 ? 'miesiąc' : 'miesięcy'}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary"
            >
              Zapisz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthAssignmentPanel;
