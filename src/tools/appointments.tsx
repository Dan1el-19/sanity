import '../app.css';
import React, { useState, useEffect, useMemo } from 'react';
import { databases } from '../lib/appwrite';
import { Models } from 'appwrite';
import {
  CalendarDays,
  Clock,
  Mail,
  ShoppingBag,
  CircleDollarSign,
  StickyNote,
  ShieldAlert,
  RefreshCcw,
  UsersRound,
  CheckCircle2,
  Hourglass,
  XCircle,
} from 'lucide-react';
import { Card, Text, Flex, Stack, Button } from '@sanity/ui';

interface AppointmentData {
  date: string;
  time: string;
  clientEmail: string;
  status: string;
  basePrice: number;
  serviceType: string;
  firstName: string;
  lastName: string;
  userNotes: string;
  adminNotes: string;
}

type Appointment = Models.Document & AppointmentData;

// Env vars will be read inside the component to allow hot-reload updates in Studio

const AppointmentsTool: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const DATABASE_ID = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
  const COLLECTION_ID = process.env.SANITY_STUDIO_APPWRITE_APPOINTMENTS_COLLECTION_ID;

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'all') return appointments;
    return appointments.filter((a) => a.status === statusFilter);
  }, [appointments, statusFilter]);

  // Pobierz dane z Appwrite
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!DATABASE_ID || !COLLECTION_ID) {
        setError('Brak wymaganych zmiennych środowiskowych Appwrite (DATABASE_ID / COLLECTION_ID)');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await databases.listDocuments<Appointment>(DATABASE_ID, COLLECTION_ID);
        setAppointments(response.documents);
      } catch (error) {
        console.error('Błąd pobierania terminów:', error);
        setError(error instanceof Error ? error.message : 'Wystąpił nieznany błąd');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [DATABASE_ID, COLLECTION_ID]);

  const reload = () => {
    setLoading(true);
    setTimeout(() => {
      // Force re-run of effect by updating a dummy state or just re-fetch inline
      (async () => {
        if (!DATABASE_ID || !COLLECTION_ID) {
          setError('Brak wymaganych zmiennych środowiskowych Appwrite (DATABASE_ID / COLLECTION_ID)');
          setLoading(false);
          return;
        }
        try {
          setError(null);
          const response = await databases.listDocuments<Appointment>(DATABASE_ID, COLLECTION_ID);
          setAppointments(response.documents);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Wystąpił nieznany błąd');
        } finally {
          setLoading(false);
        }
      })();
    }, 350); // slight delay for UX / skeleton
  };

  if (loading) {
    return (
      <div className="p-6 bg-base-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-base-content">
              <CalendarDays className="w-6 h-6" /> Terminy
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card bg-base-200 shadow-sm animate-pulse border border-base-300">
                <div className="card-body space-y-4">
                  <div className="h-5 w-1/2 bg-base-300 rounded" />
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 bg-base-300 rounded" />
                    <div className="h-3 w-2/3 bg-base-300 rounded" />
                    <div className="h-3 w-1/2 bg-base-300 rounded" />
                  </div>
                  <div className="h-10 w-full bg-base-300 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-base-200 min-h-screen">
        <div className="max-w-xl mx-auto">
          <Card padding={5} radius={3} tone="critical" shadow={1}>
            <Stack space={4}>
              <Flex align="center" gap={3}>
                <ShieldAlert className="w-6 h-6 text-error" />
                <Text size={3} weight="semibold">Błąd ładowania terminów</Text>
              </Flex>
              <Text size={2}>{error}</Text>
              <Button mode="ghost" tone="critical" onClick={reload} icon={RefreshCcw as any} text="Spróbuj ponownie" />
            </Stack>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-base-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-base-content">
              <CalendarDays className="w-7 h-7" /> Rezerwacje
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`btn btn-xs sm:btn-sm capitalize ${
                  statusFilter === s ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {s === 'all' && 'Wszystkie'}
                {s === 'pending' && 'Oczekujące'}
                {s === 'confirmed' && 'Potwierdzone'}
                {s === 'cancelled' && 'Anulowane'}
              </button>
            ))}
            <button onClick={reload} className="btn btn-xs sm:btn-sm btn-ghost" title="Odśwież">
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-4 text-base-content/70">
              <UsersRound className="w-12 h-12" />
              <p className="text-lg font-medium">Brak terminów do wyświetlenia</p>
              {statusFilter !== 'all' && (
                <p className="text-sm">Zmień filtr aby zobaczyć inne wyniki.</p>
              )}
            </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAppointments.map((appointment) => {
              const statusTone: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
                confirmed: { label: 'Potwierdzone', icon: <CheckCircle2 className="w-4 h-4" />, classes: 'badge-success' },
                pending: { label: 'Oczekujące', icon: <Hourglass className="w-4 h-4" />, classes: 'badge-warning' },
                cancelled: { label: 'Anulowane', icon: <XCircle className="w-4 h-4" />, classes: 'badge-error' },
              };
              const st = statusTone[appointment.status] || { label: appointment.status, icon: null, classes: 'badge-ghost' };
              return (
                <div
                  key={appointment.$id}
                  className="card bg-base-200 border border-base-300 hover:border-primary/60 transition-colors shadow-sm hover:shadow-md relative"
                >
                  <div className="card-body p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="card-title text-base-content text-lg leading-tight">
                          {appointment.firstName} {appointment.lastName}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-base-content/60">
                          <span>ID:</span>
                          <span className="font-mono truncate max-w-[140px]" title={appointment.$id}>{appointment.$id}</span>
                        </div>
                      </div>
                      <div className={`badge ${st.classes} gap-1 whitespace-nowrap`}>{st.icon}{st.label}</div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span className="font-medium">{appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-accent" />
                        <span className="truncate" title={appointment.clientEmail}>{appointment.clientEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-info" />
                        <span>Terapia: {appointment.serviceType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CircleDollarSign className="w-4 h-4 text-success" />
                        <span className="font-semibold">{appointment.basePrice} PLN</span>
                      </div>
                    </div>

                    {(appointment.userNotes || appointment.adminNotes) && (
                      <div className="mt-2 space-y-3">
                        {appointment.userNotes && (
                          <div>
                            <div className="flex items-center gap-2 mb-1 text-xs font-medium uppercase tracking-wide text-base-content/70">
                              <StickyNote className="w-3.5 h-3.5" /> Notatki klienta
                            </div>
                            <p className="bg-base-200 rounded-md p-2 text-xs leading-relaxed max-h-28 overflow-y-auto">
                              {appointment.userNotes}
                            </p>
                          </div>
                        )}
                        {appointment.adminNotes && (
                          <div>
                            <div className="flex items-center gap-2 mb-1 text-xs font-medium uppercase tracking-wide text-base-content/70">
                              <ShieldAlert className="w-3.5 h-3.5" /> Notatki administracyjne
                            </div>
                            <p className="bg-base-200 rounded-md p-2 text-xs leading-relaxed border border-base-300 max-h-28 overflow-y-auto">
                              {appointment.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="card-actions justify-end mt-auto">
                      <button onClick={reload} className="btn btn-ghost btn-xs gap-1">
                        <RefreshCcw className="w-3.5 h-3.5" /> Odśwież
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsTool;