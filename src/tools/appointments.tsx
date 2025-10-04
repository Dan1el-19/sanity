import '../app.css';
import React, { useState, useEffect, useMemo } from 'react';
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
  Database,
} from 'lucide-react';
import { Card, Text, Flex, Stack, Button } from '@sanity/ui';
import { 
  fetchAppointments, 
  clearCache, 
  getCacheStats,
  type Appointment 
} from '../lib/services/appointmentsCloudFunction';
import AuthGuard from '../components/AuthGuard';

// Env vars will be read inside the component to allow hot-reload updates in Studio

const AppointmentsToolContent: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cacheInfo, setCacheInfo] = useState<{ size: number; keys: string[] }>({ size: 0, keys: [] });
  const [toolInitialized, setToolInitialized] = useState(false);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'all') return appointments;
    return appointments.filter((a) => a.service.status === statusFilter);
  }, [appointments, statusFilter]);

  // Initialize tool only after component is mounted
  useEffect(() => {
    console.log('[AppointmentsTool] Component mounted, initializing...');
    setToolInitialized(true);
  }, []);

  // Pobierz dane z Cloud Function (z cache)
  useEffect(() => {
    // Don't fetch data until tool is properly initialized
    if (!toolInitialized) {
      console.log('[AppointmentsTool] Tool not yet initialized, skipping data fetch');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Wywołaj Cloud Function z cache enabled (domyślnie)
        const response = await fetchAppointments(
          statusFilter !== 'all' ? { status: statusFilter } : undefined,
          true // useCache = true
        );

        if (!response.success) {
          setError(response.error || 'Błąd pobierania danych');
          setAppointments([]);
          return;
        }

        setAppointments(response.data.appointments);
        
        // Aktualizuj info o cache
        setCacheInfo(getCacheStats());
      } catch (err) {
        console.error('Błąd pobierania terminów:', err);
        setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter, toolInitialized]);

  // Odśwież dane (z cache)
  // Odśwież dane (z cache)
  const reload = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        setError(null);
        const response = await fetchAppointments(
          statusFilter !== 'all' ? { status: statusFilter } : undefined,
          true // useCache = true - użyje cache jeśli jest świeży
        );

        if (!response.success) {
          setError(response.error || 'Błąd pobierania danych');
          setAppointments([]);
          return;
        }

        setAppointments(response.data.appointments);
        setCacheInfo(getCacheStats());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Wystąpił nieznany błąd');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }, 350); // slight delay for UX / skeleton
  };

  // Wymuś odświeżenie (bypass cache)
  const forceRefresh = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        setError(null);
        console.log('[Force Refresh] Pomijam cache, pobieram świeże dane');
        const response = await fetchAppointments(
          statusFilter !== 'all' ? { status: statusFilter } : undefined,
          false // useCache = false - wymuś pobieranie z API
        );

        if (!response.success) {
          setError(response.error || 'Błąd pobierania danych');
          setAppointments([]);
          return;
        }

        setAppointments(response.data.appointments);
        setCacheInfo(getCacheStats());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Wystąpił nieznany błąd');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  // Wyczyść cały cache
  const handleClearCache = () => {
    clearCache();
    setCacheInfo(getCacheStats());
    console.log('[Cache] Cache wyczyszczony');
  };

  // Don't render anything until tool is properly initialized
  if (!toolInitialized) {
    return (
      <div className="p-6 bg-base-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg mb-4"></div>
              <p className="text-base-content/70">Initializing tool...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="divider divider-horizontal mx-0" />
            <button 
              onClick={reload} 
              className="btn btn-xs sm:btn-sm btn-ghost" 
              title="Odśwież (z cache)"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <button 
              onClick={forceRefresh} 
              className="btn btn-xs sm:btn-sm btn-ghost" 
              title="Wymuś odświeżenie (pomija cache)"
            >
              <Database className="w-4 h-4" />
            </button>
            {cacheInfo.size > 0 && (
              <button 
                onClick={handleClearCache} 
                className="btn btn-xs sm:btn-sm btn-ghost text-warning" 
                title={`Wyczyść cache (${cacheInfo.size} wpisów)`}
              >
                <XCircle className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">{cacheInfo.size}</span>
              </button>
            )}
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
              const st = statusTone[appointment.service.status] || { label: appointment.service.status, icon: null, classes: 'badge-ghost' };
              return (
                <div
                  key={appointment.id}
                  className="card bg-base-200 border border-base-300 hover:border-primary/60 transition-colors shadow-sm hover:shadow-md relative"
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
                        <span className="font-medium">{appointment.schedule.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-secondary" />
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
                              <StickyNote className="w-3.5 h-3.5" /> Notatki klienta
                            </div>
                            <p className="bg-base-200 rounded-md p-2 text-xs leading-relaxed max-h-28 overflow-y-auto">
                              {appointment.notes.user}
                            </p>
                          </div>
                        )}
                        {appointment.notes.admin && (
                          <div>
                            <div className="flex items-center gap-2 mb-1 text-xs font-medium uppercase tracking-wide text-base-content/70">
                              <ShieldAlert className="w-3.5 h-3.5" /> Notatki administracyjne
                            </div>
                            <p className="bg-base-200 rounded-md p-2 text-xs leading-relaxed border border-base-300 max-h-28 overflow-y-auto">
                              {appointment.notes.admin}
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

// Main component with Auth Guard - no auth status bar, just protection
const AppointmentsTool: React.FC = () => {
  return (
    <AuthGuard toolName="Appointments" requireAuth={true} showAuthStatus={false}>
      <AppointmentsToolContent />
    </AuthGuard>
  );
};

export default AppointmentsTool;