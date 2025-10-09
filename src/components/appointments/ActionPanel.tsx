import React from 'react';

/**
 * ActionPanel displays grouped action buttons used in the appointment detail view.
 * Groups and button labels come from the parent so this remains a stateless renderer.
 */
export type ActionPanelProps = {
  actionGroups: ReadonlyArray<{
    key: string;
    title: string;
    containerClass: string;
    labelClass: string;
    buttons: ReadonlyArray<{
      key: string;
      label: string;
      className: string;
    }>;
  }>;
};

const ActionPanel: React.FC<ActionPanelProps> = ({ actionGroups }) => (
  <div className="rounded-2xl border border-base-300 bg-base-100/90 shadow-sm">
    <div className="border-b border-base-300 px-4 py-3 sm:px-5 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Panel akcji</p>
        <p className="text-base font-semibold text-base-content">Zarządzanie wizytą</p>
      </div>
    </div>
    <div className="px-4 py-4 sm:px-5 sm:py-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actionGroups.map(({ key, title, containerClass, labelClass, buttons }) => (
          <div
            key={key}
            className={`rounded-xl border px-4 py-3 sm:px-5 sm:py-4 space-y-3 ${containerClass}`}
          >
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>{title}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {buttons.map(({ key: actionKey, label, className }) => (
                <button key={actionKey} type="button" className={`${className} shadow-sm`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ActionPanel;
