import React, { useEffect, useMemo, useState } from "react";
import { api, getCurrentUser } from "../lib/api";
import { Calendar, momentLocalizer, Views, Resource } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import MultiSelect from "../components/MultiSelect";
import SingleSelect from "../components/SingleSelect";
import TimePicker from "../components/TimePicker";
import CalendarInput from "../components/Calendar";
import ConfirmationModal from "../components/ConfirmationModal";
import WarningModal from "../components/WarningModal";
import LoadingSpinner from "../components/LoadingSpinner";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar as any);

type EventItem = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resourceId: number; // doctorId
};

export default function Schedule() {
  const user = getCurrentUser();
  const clinicId = user?.clinicId;
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [isPastAppointment, setIsPastAppointment] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [form, setForm] = useState<{ title: string; doctorId: number | null; patientId: number | null; date: string; start: string; end: string; cost: number; notes: string }>({
    title: "",
    doctorId: null,
    patientId: null,
    date: "",
    start: "10:00",
    end: "11:00",
    cost: 0,
    notes: ""
  });
  const scrollToTime = useMemo(() => new Date(1970, 1, 1, 8, 0, 0), []);
  const minTime = useMemo(() => new Date(1970, 1, 1, 7, 0, 0), []);
  const maxTime = useMemo(() => new Date(1970, 1, 1, 21, 30, 0), []);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [defaultSelectionSet, setDefaultSelectionSet] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { if (clinicId) load(); }, [selectedDoctorIds, clinicId]);


  async function load(silent = false) {
    if (!clinicId) return;
    if (!silent) setLoading(true);
    try {
      const { data: doctors } = await api.get("/doctors", { params: { clinicId } });
      setAllDoctors(doctors);
    
    // Set default doctor selection based on user role (only once)
    if (!defaultSelectionSet && doctors.length > 0) {
      const user = getCurrentUser();
      if (user) {
        if (user.role === "doctor") {
          // Find the doctor record for this user
          const doctorForUser = doctors.find((d: any) => d.userId === user.id);
          if (doctorForUser) {
            setSelectedDoctorIds([doctorForUser.id]);
          }
        } else if (user.role === "admin") {
          // Select all doctors for admin
          setSelectedDoctorIds(doctors.map((d: any) => d.id));
        }
      }
      setDefaultSelectionSet(true);
    }
    
    const visibleDoctorIds = selectedDoctorIds.length ? selectedDoctorIds : doctors.map((d: any) => d.id);
    setResources(doctors.filter((d: any) => visibleDoctorIds.includes(d.id)).map((d: any) => ({ resourceId: d.id, resourceTitle: d.name })) as Resource[]);
    const { data: appts } = await api.get("/appointments", { params: { clinicId } });
    setAllAppointments(appts);
    setEvents(appts.filter((a: any) => (selectedDoctorIds.length ? selectedDoctorIds.includes(a.doctorId) : true)).map((a: any) => ({
      id: a.id,
      title: a.title,
      start: new Date(a.start),
      end: new Date(a.end),
      resourceId: a.doctorId
    })));
      const { data: pts } = await api.get("/patients", { params: { clinicId } });
      setPatients(pts);
    } finally {
      if (!silent) setLoading(false);
    }
    
  }

  const draggableAccessor = useMemo(() => {
    return (event: EventItem) => {
      // lock past appointments
      return event.end > new Date();
    };
  }, []);

  async function onEventDrop({ event, start, end, resourceId }: any) {
    // block dragging into past
    if (end < new Date()) return;
    
    // Optimistic update - update UI immediately
    setEvents(prevEvents => 
      prevEvents.map(e => 
        e.id === event.id 
          ? { ...e, start, end, resourceId }
          : e
      )
    );
    
    // Sync with server in background
    try {
      await api.patch(`/appointments/${event.id}`, {
        start,
        end,
        doctorId: resourceId
      });
      // Update allAppointments to keep it in sync
      setAllAppointments(prev => 
        prev.map(a => 
          a.id === event.id 
            ? { ...a, start: start.toISOString(), end: end.toISOString(), doctorId: resourceId }
            : a
        )
      );
    } catch (error) {
      // Revert on error
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === event.id 
            ? { ...e, start: new Date(event.start), end: new Date(event.end), resourceId: event.resourceId }
            : e
        )
      );
      console.error("Failed to update appointment:", error);
      // Show error to user
      setWarningMessage("Failed to update appointment. Please try again.");
      setShowWarning(true);
    }
  }

  async function onEventResize({ event, start, end }: any) {
    if (end < new Date()) return;
    
    // Optimistic update - update UI immediately
    setEvents(prevEvents => 
      prevEvents.map(e => 
        e.id === event.id 
          ? { ...e, start, end }
          : e
      )
    );
    
    // Sync with server in background
    try {
      await api.patch(`/appointments/${event.id}`, { start, end });
      // Update allAppointments to keep it in sync
      setAllAppointments(prev => 
        prev.map(a => 
          a.id === event.id 
            ? { ...a, start: start.toISOString(), end: end.toISOString() }
            : a
        )
      );
    } catch (error) {
      // Revert on error
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === event.id 
            ? { ...e, start: new Date(event.start), end: new Date(event.end) }
            : e
        )
      );
      console.error("Failed to resize appointment:", error);
      // Show error to user
      setWarningMessage("Failed to resize appointment. Please try again.");
      setShowWarning(true);
    }
  }

  function onSelectSlot(slot: any) {
    const { start, end, resourceId } = slot;
    // Check if the selected slot is in the past
    if (end < new Date()) {
      setWarningMessage("You cannot create appointments in the past!");
      setShowWarning(true);
      return;
    }
    const date = moment(start).format("YYYY-MM-DD");
    const st = moment(start).format("HH:mm");
    const en = moment(end).format("HH:mm");
    setForm({ title: "", doctorId: resourceId || null, patientId: null, date, start: st, end: en, cost: 0, notes: "" });
    setEditingAppointmentId(null);
    setIsPastAppointment(false);
    setShowModal(true);
  }

  function handleEditAppointment(event: any) {
    const appointment = allAppointments.find((a: any) => a.id === event.id);
    if (!appointment) return;
    
    const appointmentEnd = new Date(appointment.end);
    const isPast = appointmentEnd < new Date();
    
    // Don't allow editing past appointments
    if (isPast) {
      setWarningMessage("You cannot edit past appointments!");
      setShowWarning(true);
      return;
    }
    
    const startDate = new Date(appointment.start);
    const endDate = new Date(appointment.end);
    setForm({
      title: appointment.title || "",
      doctorId: appointment.doctorId,
      patientId: appointment.patientId || null,
      date: moment(startDate).format("YYYY-MM-DD"),
      start: moment(startDate).format("HH:mm"),
      end: moment(endDate).format("HH:mm"),
      cost: appointment.cost || 0,
      notes: appointment.notes || ""
    });
    setEditingAppointmentId(appointment.id);
    setIsPastAppointment(isPast);
    setShowModal(true);
  }

  async function handleSaveAppointment() {
    if (!form.title || !form.date || !form.start || !form.end || !form.doctorId) {
      setWarningMessage("Fill in required fields");
      setShowWarning(true);
      return;
    }
    const start = new Date(`${form.date}T${form.start}:00`);
    const end = new Date(`${form.date}T${form.end}:00`);

    // Check if end time is before start time
    if (end < start) {
      setWarningMessage("End time cannot be before start time!");
      setShowWarning(true);
      return;
    }
    
    // Check if creating an appointment in the past
    if (!editingAppointmentId && end < new Date()) {
      setWarningMessage("You cannot create appointments in the past!");
      setShowWarning(true);
      return;
    }
    
    // Don't allow editing past appointments
    if (editingAppointmentId && isPastAppointment) {
      setWarningMessage("You cannot edit past appointments!");
      setShowWarning(true);
      return;
    }
    
    // Check if updating an appointment to a past time
    if (editingAppointmentId && end < new Date()) {
      setWarningMessage("You cannot update appointments to a past time!");
      setShowWarning(true);
      return;
    }

    
    if (editingAppointmentId) {
      // Update existing appointment
      await api.patch(`/appointments/${editingAppointmentId}`, {
        doctorId: form.doctorId,
        patientId: form.patientId,
        title: form.title,
        start,
        end,
        cost: form.cost,
        notes: form.notes
      });
    } else {
      // Create new appointment
      if (!clinicId) return;
      await api.post("/appointments", {
        clinicId,
        doctorId: form.doctorId,
        patientId: form.patientId,
        title: form.title,
        start,
        end,
        cost: form.cost,
        notes: form.notes
      });
    }
    
    setShowModal(false);
    setEditingAppointmentId(null);
    setIsPastAppointment(false);
    setForm({ title: "", doctorId: null, patientId: null, date: "", start: "10:00", end: "11:00", cost: 0, notes: "" });
    await load();
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl lg:text-4xl font-semibold text-center mb-4 lg:mb-8">Appointments</h1>
      <div className="card space-y-3" style={{ background: 'transparent' }}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex-1">
            <MultiSelect
              items={allDoctors.map((d: any) => ({ id: d.id, name: d.name, color: d.color }))}
              selectedIds={selectedDoctorIds}
              onSelectionChange={setSelectedDoctorIds}
              searchPlaceholder="Search for a doctor..."
              label="Doctors"
            />
          </div>
          <button className="btn w-full lg:w-auto" onClick={() => setShowModal(true)}>Add Appointment</button>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
          <div className="text-sm text-slate-400">Select day</div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="px-2 py-2 rounded-lg border border-slate-700" onClick={() => setCurrentDate(prev => moment(prev).subtract(1, "day").toDate())}><ChevronLeft size={16} /></button>
            <div className="relative flex-1 sm:flex-none">
              <CalendarInput
                value={moment(currentDate).format("YYYY-MM-DD")}
                onChange={(value) => setCurrentDate(moment(value, "YYYY-MM-DD").toDate())}
                placeholder="Select day"
                allowPastDates={true}
              />
            </div>
            <button className="px-2 py-2 rounded-lg border border-slate-700" onClick={() => setCurrentDate(prev => moment(prev).add(1, "day").toDate())}><ChevronRight size={16} /></button>
          </div>
        </div>
        <DnDCalendar
          localizer={localizer}
          events={events}
          date={currentDate}
          onNavigate={(d: Date) => setCurrentDate(d)}
          resources={resources as any}
          resourceIdAccessor="resourceId"
          resourceTitleAccessor="resourceTitle"
          defaultView={Views.DAY}
          views={[Views.DAY, Views.WORK_WEEK, Views.WEEK, Views.MONTH]}
          step={15}
          timeslots={4}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          draggableAccessor={draggableAccessor as any}
          resizable
          selectable
          onSelectSlot={onSelectSlot}
          onSelectEvent={handleEditAppointment}
          scrollToTime={scrollToTime}
          min={minTime}
          max={maxTime}
          eventPropGetter={(event) => {
            const doc = allDoctors.find(d => d.id === (event as any).resourceId);
            const bg = doc?.color || "#7c3aed";
            return {
              style: {
                backgroundColor: bg
              }
            };
          }}
          style={{ height: "78vh" }}
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card w-full max-w-2xl mx-4">
            <div className="text-lg font-semibold mb-4">
              {editingAppointmentId ? "Edit Appointment" : "Appointment Details"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-slate-400">Title <span className="text-red-500">*</span></label>
                <input 
                  className="input" 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  disabled={isPastAppointment}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-400">Doctor <span className="text-red-500">*</span></label>
                <select 
                  className="input" 
                  value={form.doctorId ?? ""} 
                  onChange={e => setForm({ ...form, doctorId: Number(e.target.value) })}
                  disabled={isPastAppointment}
                >
                  <option value="" disabled>Select doctor</option>
                  {allDoctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-400">Patient</label>
                <SingleSelect
                  items={patients.map((p: any) => ({ 
                    id: p.id, 
                    name: `${p.firstName} ${p.lastName}` 
                  }))}
                  selectedId={form.patientId}
                  onSelectionChange={(id) => setForm({ ...form, patientId: id })}
                  placeholder="Select patient"
                  searchPlaceholder="Search patient..."
                  disabled={isPastAppointment}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-400">Date <span className="text-red-500">*</span></label>
                <CalendarInput
                  value={form.date}
                  onChange={(value) => setForm({ ...form, date: value })}
                  disabled={isPastAppointment}
                  placeholder="Select date"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-400">Start Time <span className="text-red-500">*</span></label>
                <TimePicker
                  value={form.start}
                  onChange={(value) => setForm({ ...form, start: value })}
                  disabled={isPastAppointment}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-400">End Time <span className="text-red-500">*</span></label>
                <TimePicker
                  value={form.end}
                  onChange={(value) => setForm({ ...form, end: value })}
                  disabled={isPastAppointment}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-400">Cost</label>
                <input 
                  className="input" 
                  type="number" 
                  value={form.cost} 
                  onChange={e => setForm({ ...form, cost: Number(e.target.value) })} 
                  disabled={isPastAppointment}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm mb-1 text-slate-400">Notes</label>
                <textarea 
                  className="input h-28" 
                  value={form.notes} 
                  onChange={e => setForm({ ...form, notes: e.target.value })} 
                  disabled={isPastAppointment}
                />
              </div>
              <div className="col-span-2 flex justify-between gap-2">
                {editingAppointmentId && !isPastAppointment && (
                  <button 
                    className="px-4 py-2 rounded-lg border border-red-600 text-red-400 hover:bg-red-900/20 transition-colors" 
                    onClick={() => setConfirmDelete(true)}
                  >
                    Cancel Appointment
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button 
                    className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors" 
                    onClick={() => {
                      setShowModal(false);
                      setEditingAppointmentId(null);
                      setIsPastAppointment(false);
                      setForm({ title: "", doctorId: null, patientId: null, date: "", start: "10:00", end: "11:00", cost: 0, notes: "" });
                    }}
                  >
                    Close
                  </button>
                  {!isPastAppointment && (
                    <button 
                      className="btn" 
                      onClick={() => {
                        if (!form.title || !form.date || !form.start || !form.end || !form.doctorId) {
                          setWarningMessage("Fill in required fields");
                          setShowWarning(true);
                          return;
                        }
                        if (editingAppointmentId) {
                          setConfirmSave(true);
                        } else {
                          handleSaveAppointment();
                        }
                      }}
                    >
                      {editingAppointmentId ? "Save Changes" : "Create Appointment"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmSave}
        onClose={() => setConfirmSave(false)}
        onConfirm={async () => {
          if (!form.title || !form.date || !form.start || !form.end || !form.doctorId) {
            setWarningMessage("Fill in required fields");
            setShowWarning(true);
            setConfirmSave(false);
            return;
          }
          await handleSaveAppointment();
          setConfirmSave(false);
        }}
        title="Save Changes"
        message="Are you sure you want to save the changes for this appointment?"
        confirmText="Save"
        cancelText="Cancel"
        type="info"
      />

      <WarningModal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        title="Warning"
        message={warningMessage}
        buttonText="OK"
      />

      <ConfirmationModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (editingAppointmentId) {
            try {
              await api.delete(`/appointments/${editingAppointmentId}`);
              setShowModal(false);
              setEditingAppointmentId(null);
              setIsPastAppointment(false);
              setForm({ title: "", doctorId: null, patientId: null, date: "", start: "10:00", end: "11:00", cost: 0, notes: "" });
              setConfirmDelete(false);
              await load();
            } catch (error) {
              console.error("Failed to delete appointment:", error);
            }
          }
        }}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Cancel Appointment"
        cancelText="Keep Appointment"
        type="danger"
      />
    </div>
  );
}

