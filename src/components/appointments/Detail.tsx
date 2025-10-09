import React from 'react';
import {
  CalendarDays,
  ShoppingBag,
  CircleDollarSign,
  Mail,
  UsersRound,
  Database,
} from 'lucide-react';
import { Appointment } from '../../lib/services/appointmentsCloudFunction';
import ActionPanel from './ActionPanel';

/**
 * Detail view for a single appointment.
 * Shows appointment metadata, notes and available action groups.
 * This component expects already-formatted helpers (date formatter, status resolver)
 * to be passed in via props so it remains a presentational component.
 */
export type DetailProps = {
  appointment: Appointment | null;
  isDetailOpen: boolean;
  onClose: () => void;
  formatPolishDate: (rawDate: string) => string;
  resolveStatusTone: (status: string) => { label: string; icon: React.ReactNode; classes: string };
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

const Detail: React.FC<DetailProps> = ({
  appointment,
  isDetailOpen,
  onClose,
  formatPolishDate,
  resolveStatusTone,
  actionGroups,
}) => {
  if (!isDetailOpen) {
    return (
      <div className="card bg-base-200 border border-dashed border-base-300 shadow-none">
        <div className="card-body text-center space-y-3">
          <UsersRound className="w-10 h-10 mx-auto text-base-content/40" />
          <h3 className="text-base font-semibold text-base-content">Wybierz wizytę</h3>
          <p className="text-sm text-base-content/70">
            Kliknij dowolną kartę wizyty, aby zobaczyć szczegóły i dostępne akcje.
          </p>
        </div>
      </div>
    );
  }
  if (!appointment) {
    return (
      <div className="card bg-warning/10 border border-warning">
        <div className="card-body space-y-3">
          <h3 className="text-base font-semibold text-warning">Nie znaleziono wizyty</h3>
          <p className="text-sm text-warning/80">
            Wybrany identyfikator nie znajduje się na liście. Odśwież dane lub wybierz inną wizytę.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm self-start"
          >
            Wróć do listy
          </button>
        </div>
      </div>
    );
  }
  const statusTone = resolveStatusTone(appointment.service.status);
  return (
    <div className="card bg-base-200 border border-base-300 shadow-md">
      <div className="card-body space-y-2 p-5">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-base-content/60">ID wizyty</p>
            <p className="font-mono text-sm text-base-content/80">{appointment.id}</p>
          </div>
          <h3 className="text-xl font-semibold text-base-content flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-primary" />
            {appointment.client.fullName}
          </h3>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-base-content">{formatPolishDate(appointment.schedule.date)} | {appointment.schedule.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-base-content">{appointment.service.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center text-success">
              <CircleDollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-base-content">{appointment.pricing.final} PLN</p>
              {appointment.pricing.base !== appointment.pricing.final && (
                <p className="text-xs text-base-content/60 line-through">{appointment.pricing.base} PLN</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-base-content">{appointment.client.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className={`badge ${statusTone.classes} gap-1`}>{statusTone.icon}{statusTone.label}</div>
            </div>
          </div>
        </div>
        {(appointment.notes.user || appointment.notes.admin) && (
          <div className="space-y-4">
            {appointment.notes.user && (
              <div className="p-3 rounded-lg bg-base-100 border border-base-300">
                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60 mb-2">Notatki klienta</p>
                <p className="text-sm leading-relaxed text-base-content/80 whitespace-pre-wrap">
                  {appointment.notes.user}
                </p>
              </div>
            )}
            {appointment.notes.admin && (
              <div className="p-3 rounded-lg bg-base-100 border border-base-300">
                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60 mb-2">Notatki administracyjne</p>
                <p className="text-sm leading-relaxed text-base-content/80 whitespace-pre-wrap">
                  {appointment.notes.admin}
                </p>
              </div>
            )}
          </div>
        )}
        <ActionPanel actionGroups={actionGroups} />
      </div>
    </div>
  );
};

export default Detail;
