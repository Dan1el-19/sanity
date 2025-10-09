import React from 'react';
import { UsersRound, CalendarDays, ShoppingBag, CircleDollarSign, Mail } from 'lucide-react';
import { Appointment } from '../../lib/services/appointmentsCloudFunction';

/**
 * Appointment list component. Renders card grid of appointments with
 * accessible keyboard handlers and selection support.
 */
export type ListProps = {
  appointments: Appointment[];
  statusFilter: string;
  selectedAppointmentId: string | null;
  onSelectAppointment: (id: string) => void;
  resolveStatusTone: (status: string) => { label: string; icon: React.ReactNode; classes: string };
  formatPolishDate: (rawDate: string) => string;
};

const List: React.FC<ListProps> = ({
  appointments,
  statusFilter,
  selectedAppointmentId,
  onSelectAppointment,
  resolveStatusTone,
  formatPolishDate,
}) => {
  if (appointments.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-4 text-base-content/70">
        <UsersRound className="w-12 h-12" />
        <p className="text-lg font-medium">Brak terminów do wyświetlenia</p>
        {statusFilter !== 'all' && (
          <p className="text-sm">Zmień filtr aby zobaczyć inne wyniki.</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {appointments.map((appointment) => {
        const st = resolveStatusTone(appointment.service.status);
        const formattedDate = formatPolishDate(appointment.schedule.date);
        const isSelected = selectedAppointmentId === appointment.id;

        return (
          <div
            key={appointment.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => onSelectAppointment(appointment.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectAppointment(appointment.id);
              }
            }}
            className={`card bg-base-200 border border-base-300 transition-colors shadow-sm relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 hover:border-primary/60 hover:shadow-md ${
              isSelected ? 'border-primary shadow-md ring-2 ring-primary/40' : ''
            }`}
          >
            <div className="card-body p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="card-title text-base-content text-lg leading-tight">
                    {appointment.client.fullName}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-base-content/60">
                    <span>ID:</span>
                    <span className="font-mono truncate max-w-[140px]" title={appointment.id}>{appointment.id}</span>
                  </div>
                </div>
                <div className={`badge ${st.classes} gap-1 whitespace-nowrap`}>{st.icon}{st.label}</div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span className="font-medium">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 inline-block text-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <span>{appointment.schedule.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent" />
                  <span className="truncate" title={appointment.client.email}>{appointment.client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-info" />
                  <span>Terapia: {appointment.service.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="w-4 h-4 text-success" />
                  <span className="font-semibold">{appointment.pricing.final} PLN</span>
                  {appointment.pricing.base !== appointment.pricing.final && (
                    <span className="text-xs line-through opacity-60">{appointment.pricing.base} PLN</span>
                  )}
                </div>
              </div>

              {(appointment.notes.user || appointment.notes.admin) && (
                <div className="mt-2 space-y-3">
                  {appointment.notes.user && (
                    <div>
                      <div className="flex items-center gap-2 mb-1 text-xs font-medium uppercase tracking-wide text-base-content/70">
                        Notatki klienta
                      </div>
                      <p className="bg-base-200 rounded-md p-2 text-xs leading-relaxed max-h-28 overflow-y-auto">
                        {appointment.notes.user}
                      </p>
                    </div>
                  )}
                  {appointment.notes.admin && (
                    <div>
                      <div className="flex items-center gap-2 mb-1 text-xs font-medium uppercase tracking-wide text-base-content/70">
                        Notatki administracyjne
                      </div>
                      <p className="bg-base-200 rounded-md p-2 text-xs leading-relaxed border border-base-300 max-h-28 overflow-y-auto">
                        {appointment.notes.admin}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default List;
