import '../app.css';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDays,
  RefreshCcw,
  CheckCircle2,
  Hourglass,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
// Usunięto nieużywane importy z @sanity/ui
import {
  fetchAppointments,
  type Appointment,
} from '../lib/services/appointmentsCloudFunction';
import List from '../components/appointments/List';
import Detail from '../components/appointments/Detail';
import StatusFilter from '../components/appointments/StatusFilter';
import LoadingSkeleton from '../components/appointments/LoadingSkeleton';
import ErrorPanel from '../components/appointments/ErrorPanel';
import AuthGuard from '../components/AuthGuard';

const STATUS_FILTERS = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'pending', label: 'Oczekujące' },
  { value: 'confirmed', label: 'Potwierdzone' },
  { value: 'cancelled', label: 'Anulowane' },
] as const;

const formatPolishDate = (rawDate: string) => {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const QUERY_PARAM_KEY = 'appointmentId';

const getAppointmentIdFromLocation = () => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const id = params.get(QUERY_PARAM_KEY);
  return id && id.trim().length > 0 ? id : null;
};

const updateUrlWithAppointmentId = (id: string | null) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (id) {
    url.searchParams.set(QUERY_PARAM_KEY, id);
  } else {
    url.searchParams.delete(QUERY_PARAM_KEY);
  }
  window.history.pushState({}, '', url.toString());
};

const ACTION_GROUPS = [
  {
    key: 'primary',
    title: 'Zarządzanie',
    containerClass: 'border-secondary/25 bg-secondary/10',
    labelClass: 'text-secondary font-semibold',
    buttons: [
      { key: 'confirm', label: 'Potwierdź', className: 'btn btn-sm w-full justify-center btn-success text-success-content font-semibold' },
      { key: 'cancel', label: 'Anuluj', className: 'btn btn-sm w-full justify-center btn-error text-error-content font-semibold' },
      { key: 'reschedule', label: 'Przełóż', className: 'btn btn-sm w-full justify-center btn-tuned-blue text-warning-content font-semibold' },
    ],
  },
  {
    key: 'secondary',
    title: 'Administracyjne',
    containerClass: 'border-neutral-500/40 bg-neutral-500/10',
    labelClass: 'text-secondary font-semibold',
    buttons: [
      { key: 'payment', label: 'Płatność', className: 'btn btn-sm w-full justify-center btn-accent text-accent-content font-semibold' },
      { key: 'notes', label: 'Dodaj notatki', className: 'btn btn-sm w-full justify-center btn-neutral text-neutral-content font-semibold' },
    ],
  },
  {
    key: 'destructive',
    title: 'Historia i archiwizacja',
    containerClass: 'border-neutral-500/40 bg-neutral-500/10',
    labelClass: 'text-neutral-400 font-semibold',
    buttons: [
      { key: 'history', label: 'Historia zmian', className: 'btn btn-sm w-full justify-center btn-outline btn-neutral font-semibold' },
      { key: 'archive', label: 'Archiwizuj', className: 'btn btn-sm w-full justify-center btn-neutral text-neutral-content font-semibold' },
    ],
  },
];

// Env vars will be read inside the component to allow hot-reload updates in Studio

const AppointmentsToolContent: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toolInitialized, setToolInitialized] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(() => getAppointmentIdFromLocation());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      setSelectedAppointmentId(getAppointmentIdFromLocation());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!toolInitialized) return;
    setSelectedAppointmentId(getAppointmentIdFromLocation());
  }, [toolInitialized]);

  const statusButtonClass = (active: boolean) =>
    [
      'btn btn-sm rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100',
      active
        ? 'btn-primary border-primary text-primary-content shadow-sm'
        : 'btn-ghost border-base-300 bg-base-100/80 text-base-content/70 hover:text-base-content hover:border-primary/40 hover:bg-base-100',
    ].join(' ');

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'all') return appointments;
    return appointments.filter((a) => a.service.status === statusFilter);
  }, [appointments, statusFilter]);

  const selectedAppointment = useMemo(() => {
    if (!selectedAppointmentId) return null;
    return appointments.find((appointment) => appointment.id === selectedAppointmentId) || null;
  }, [appointments, selectedAppointmentId]);

  const handleSelectAppointment = useCallback((appointmentId: string) => {
    updateUrlWithAppointmentId(appointmentId);
    setSelectedAppointmentId(appointmentId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    updateUrlWithAppointmentId(null);
    setSelectedAppointmentId(null);
  }, []);

  const resolveStatusTone = useCallback((status: string) => {
    const toneMap: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
      confirmed: { label: 'Potwierdzone', icon: <CheckCircle2 className="w-4 h-4" />, classes: 'badge-success' },
      pending: { label: 'Oczekujące', icon: <Hourglass className="w-4 h-4" />, classes: 'badge-warning' },
      cancelled: { label: 'Anulowane', icon: <XCircle className="w-4 h-4" />, classes: 'badge-error' },
    };

    return toneMap[status] || { label: status, icon: null, classes: 'badge-ghost' };
  }, []);

  const isDetailOpen = Boolean(selectedAppointmentId);

  // ...usunięto lokalną logikę listContent...

  // ...usunięto lokalną logikę detailPanel...
  const detailPanel = (
    <Detail
      appointment={selectedAppointment}
      isDetailOpen={isDetailOpen}
      onClose={handleCloseDetail}
      formatPolishDate={formatPolishDate}
      resolveStatusTone={resolveStatusTone}
      actionGroups={ACTION_GROUPS}
    />
  );

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

  // Ręczne odświeżenie danych (pomija cache)
  const reload = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        setError(null);
        const response = await fetchAppointments(
          statusFilter !== 'all' ? { status: statusFilter } : undefined,
          false // useCache = false - wymuś pobieranie z API przy manualnym odświeżeniu
        );

        if (!response.success) {
          setError(response.error || 'Błąd pobierania danych');
          setAppointments([]);
          return;
        }

        setAppointments(response.data.appointments);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Wystąpił nieznany błąd');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }, 350); // slight delay for UX / skeleton
  };

  const listView = (
    <div className="fade-in space-y-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-base-content">
            <CalendarDays className="w-7 h-7 -translate-y-[2px]" /> Rezerwacje
          </h2>
          <button
            type="button"
            onClick={reload}
            className="btn btn-sm gap-2 rounded-full border border-base-300 bg-base-100/90 text-base-content/80 hover:text-base-content hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
            title="Pobierz najnowsze dane"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Odśwież</span>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-base-content/60">
            Status wizyty
          </span>
          <StatusFilter
            filters={[...STATUS_FILTERS]}
            active={statusFilter}
            onChange={setStatusFilter}
            buttonClass={statusButtonClass}
          />
        </div>
      </div>
      <List
        appointments={filteredAppointments}
        statusFilter={statusFilter}
        selectedAppointmentId={selectedAppointmentId}
        onSelectAppointment={handleSelectAppointment}
        resolveStatusTone={resolveStatusTone}
        formatPolishDate={formatPolishDate}
      />
    </div>
  );

  const detailView = (
    <div className="fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCloseDetail}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl sm:text-2xl font-semibold text-base-content">Szczegóły wizyty</h2>
        </div>
        <button
          type="button"
          onClick={reload}
          className="btn btn-sm gap-2 rounded-full border border-base-300 bg-base-100/90 text-base-content/80 hover:text-base-content hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
          title="Pobierz najnowsze dane"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Odśwież</span>
        </button>
      </div>
      {detailPanel}
    </div>
  );

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
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorPanel error={error} onReload={reload} />;
  }

  return (
    <div className="p-4 sm:p-6 bg-base-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {isDetailOpen ? detailView : listView}
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