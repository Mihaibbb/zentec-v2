import React, { useEffect, useState, useRef } from "react";
import { api, getCurrentUser } from "../lib/api";
import MultiSelect from "../components/MultiSelect";
import CalendarInput from "../components/Calendar";
import LoadingSpinner from "../components/LoadingSpinner";
import { Download, X } from "lucide-react";
import moment from "moment";
import Papa from "papaparse";

export default function Dashboard() {
  const user = getCurrentUser();
  const clinicId = user?.clinicId;
  const isDoctor = user?.role?.toLocaleLowerCase() === "doctor";
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ appointments: 0, newPatients: 0, earnings: 0 });
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<number[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [allAppts, setAllAppts] = useState<any[]>([]);
  const [range, setRange] = useState<"day" | "week" | "month" | "year">("day");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState<any | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!clinicId) return;
    async function load() {
      setLoading(true);
      try {
        const { data: docs } = await api.get("/doctors", { params: { clinicId } });
        setDoctors(docs);
        const { data: appts } = await api.get("/appointments", { params: { clinicId } });
        setAllAppts(appts);
        const { data: pats } = await api.get("/patients", { params: { clinicId } });
        setPatients(pats);
        if (isDoctor) {
          setSelectedDoctorIds([docs.find((d: any) => d.userId === user?.id)?.id]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clinicId]);

  // Set default doctor selection for admin (all doctors) - only once on initial load
  useEffect(() => {
    if (!initializedRef.current && doctors.length > 0) {
      const user = getCurrentUser();
      if (user && user.role === "admin") {
        setSelectedDoctorIds(doctors.map((d: any) => d.id));
      }
      initializedRef.current = true;
    }
  }, [doctors]);

  function getRangeDates() {
    if (useCustomDates && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      start.setHours(0,0,0,0);
      const end = new Date(customEndDate);
      end.setHours(23,59,59,999);
      return { start, end };
    }

    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    if (range === "day") {
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
    } else if (range === "week") {
      const day = now.getDay(); // 0-6
      const diffToMonday = (day + 6) % 7;
      start.setDate(now.getDate() - diffToMonday);
      start.setHours(0,0,0,0);
      end.setDate(start.getDate() + 6);
      end.setHours(23,59,59,999);
    } else if (range === "month") {
      start.setDate(1); start.setHours(0,0,0,0);
      end.setMonth(start.getMonth() + 1, 0); end.setHours(23,59,59,999);
    } else {
      start.setMonth(0,1); start.setHours(0,0,0,0);
      end.setMonth(11,31); end.setHours(23,59,59,999);
    }
    return { start, end };
  }

  const { start, end } = getRangeDates();

  // Update custom dates when range changes (only if not using custom dates)
  useEffect(() => {
    if (!useCustomDates) {
      const now = new Date();
      const start = new Date(now);
      const end = new Date(now);
      if (range === "day") {
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
      } else if (range === "week") {
        const day = now.getDay();
        const diffToMonday = (day + 6) % 7;
        start.setDate(now.getDate() - diffToMonday);
        start.setHours(0,0,0,0);
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);
      } else if (range === "month") {
        start.setDate(1); start.setHours(0,0,0,0);
        end.setMonth(start.getMonth() + 1, 0); end.setHours(23,59,59,999);
      } else {
        start.setMonth(0,1); start.setHours(0,0,0,0);
        end.setMonth(11,31); end.setHours(23,59,59,999);
      }
      setCustomStartDate(moment(start).format("YYYY-MM-DD"));
      setCustomEndDate(moment(end).format("YYYY-MM-DD"));
    }
  }, [range, useCustomDates]);

  // Initialize custom dates on mount
  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
    setCustomStartDate(moment(start).format("YYYY-MM-DD"));
    setCustomEndDate(moment(end).format("YYYY-MM-DD"));
  }, []);
  const rangeAppts = allAppts.filter((a: any) => {
    const t = new Date(a.start).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
  const filtered = rangeAppts.filter(a => selectedDoctorIds.length ? selectedDoctorIds.includes(a.doctorId) : true);

  useEffect(() => {
    const { start: rangeStart, end: rangeEnd } = getRangeDates();
    const rangeAppts = allAppts.filter((a: any) => {
      const t = new Date(a.start).getTime();
      return t >= rangeStart.getTime() && t <= rangeEnd.getTime();
    });
    const filtered = rangeAppts.filter(a => selectedDoctorIds.length ? selectedDoctorIds.includes(a.doctorId) : true);
    const earnings = filtered.reduce((s: number, a: any) => s + (a.cost || 0), 0);
    setMetrics({ appointments: filtered.length, newPatients: 0, earnings });
  }, [allAppts, selectedDoctorIds, range, useCustomDates, customStartDate, customEndDate]);

  function handleExportCSV() {
    const csvData = filtered.map((a: any, i: number) => {
      const doctor = doctors.find((d: any) => d.id === a.doctorId);
      const patient = a.patientId ? patients.find((p: any) => p.id === a.patientId) : null;
      const startDate = new Date(a.start);
      const endDate = new Date(a.end);
      return {
        "No.": i + 1,
        "Doctor": doctor?.name || "-",
        "Patient ID": a.patientId || "-",
        "Patient Name": patient ? `${patient.firstName} ${patient.lastName}` : "-",
        "Title": a.title || "-",
        "Start Date": moment(startDate).format("YYYY-MM-DD"),
        "Start Time": moment(startDate).format("HH:mm"),
        "End Date": moment(endDate).format("YYYY-MM-DD"),
        "End Time": moment(endDate).format("HH:mm"),
        "Cost": a.cost || 0,
        "Notes": a.notes || ""
      };
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `appointments_${moment().format("YYYY-MM-DD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-2xl lg:text-4xl font-semibold text-center mb-4 lg:mb-8">Dashboard</h1>
      
      <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6 mb-4">
        {/* Date Pickers - Left Side */}
        <div className="w-full lg:w-auto px-3 lg:px-4 py-3 rounded-lg border" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="flex flex-col sm:flex-row items-start gap-3 lg:gap-4">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <label className="text-sm text-slate-400">Start Date</label>
              <CalendarInput
                value={customStartDate}
                onChange={(value) => {
                  setCustomStartDate(value);
                  setUseCustomDates(true);
                  // Ensure end date is not before start date
                  if (customEndDate && value > customEndDate) {
                    setCustomEndDate(value);
                  }
                }}
                placeholder="Start date"
                allowPastDates={true}
                maxDate={customEndDate ? new Date(customEndDate) : undefined}
              />
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <label className="text-sm text-slate-400">End Date</label>
              <CalendarInput
                value={customEndDate}
                onChange={(value) => {
                  setCustomEndDate(value);
                  setUseCustomDates(true);
                  // Ensure start date is not after end date
                  if (customStartDate && value < customStartDate) {
                    setCustomStartDate(value);
                  }
                }}
                placeholder="End date"
                allowPastDates={true}
                minDate={customStartDate ? new Date(customStartDate) : undefined}
              />
            </div>
          </div>
        </div>

        {/* Filter Buttons - Right Side */}
        <div className="w-full lg:flex-1 flex items-center justify-center lg:justify-end">
          <div className="px-3 lg:px-4 py-2 rounded-lg border" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
              {(["day","week","month","year"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setRange(k);
                    setUseCustomDates(false);
                  }}
                  className={`px-3 lg:px-4 py-1 rounded-full border transition-colors text-sm lg:text-base ${
                    range === k && !useCustomDates 
                      ? "bg-gradient-brand text-white border-brand-600" 
                      : "bg-panel2 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {k[0].toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!isDoctor && <div className="w-full lg:max-w-xl">
        <MultiSelect
          items={doctors.map((d: any) => ({ id: d.id, name: d.name, color: d.color }))}
          selectedIds={selectedDoctorIds}
          onSelectionChange={setSelectedDoctorIds}
          searchPlaceholder="Search for a doctor..."
          label="Doctors"
        />
      </div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl py-8 px-5 shadow flex items-center gap-4" style={{ background: 'linear-gradient(135deg, rgb(47,50,109), rgb(25,28,65))' }}>
          <div className="w-12 h-12 rounded-xl grid place-items-center" style={{ backgroundColor: 'rgb(125,67,248)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 2v4M17 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div className="text-sm text-slate-400">Appointments</div>
            <div className="text-2xl font-semibold text-white">{metrics.appointments}</div>
          </div>
        </div>
        <div className="rounded-xl py-8 px-5 shadow flex items-center gap-4" style={{ background: 'linear-gradient(135deg, rgb(47,50,109), rgb(25,28,65))' }}>
          <div className="w-12 h-12 rounded-xl grid place-items-center" style={{ backgroundColor: 'rgb(125,67,248)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16 14a4 4 0 1 0-8 0M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" transform="translate(0 4)" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div className="text-sm text-slate-400">New patients</div>
            <div className="text-2xl font-semibold text-white">{metrics.newPatients}</div>
          </div>
        </div>
        <div className="rounded-xl py-8 px-5 shadow flex items-center gap-4" style={{ background: 'linear-gradient(135deg, rgb(47,50,109), rgb(25,28,65))' }}>
          <div className="w-12 h-12 rounded-xl grid place-items-center" style={{ backgroundColor: 'rgb(125,67,248)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 20c4.418 0 8-3.582 8-8S16.418 4 12 4 4 7.582 4 12s3.582 8 8 8Zm-1-13v6l5 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div className="text-sm text-slate-400">Earning</div>
            <div className="text-2xl font-semibold text-white">${metrics.earnings}</div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl p-4 lg:p-6" style={{ background: 'linear-gradient(135deg, rgb(47,50,109), rgb(25,28,65))' }}>
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-lg lg:text-xl font-semibold text-slate-300">No appointments for today!</div>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleExportCSV}
                className="px-3 lg:px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm lg:text-base"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400">
                    <th className="py-2">No.</th>
                    <th>Doctor</th>
                    <th>Patient</th>
                    <th>Date of admit</th>
                    <th>Income</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a: any, i: number) => (
                    <tr key={a.id} className="border-t border-slate-700">
                      <td className="py-2">{String(i + 1).padStart(2, "0")}</td>
                      <td>{doctors.find((d: any) => d.id === a.doctorId)?.name || "-"}</td>
                      <td>{a.patientId || "-"}</td>
                      <td>{new Date(a.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                      <td>{a.cost || 0}</td>
                      <td>
                        <button 
                          onClick={() => setViewingAppointment(a)}
                          className="px-4 py-1 rounded-full border-gradient bg-panel2 hover:bg-slate-700 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filtered.map((a: any, i: number) => (
                <div key={a.id} className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="text-slate-400 text-sm">No.</div>
                    <div className="text-slate-200 font-semibold">{String(i + 1).padStart(2, "0")}</div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="text-slate-400 text-sm">Doctor</div>
                    <div className="text-slate-200">{doctors.find((d: any) => d.id === a.doctorId)?.name || "-"}</div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="text-slate-400 text-sm">Patient</div>
                    <div className="text-slate-200">{a.patientId || "-"}</div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="text-slate-400 text-sm">Date of admit</div>
                    <div className="text-slate-200">{new Date(a.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="text-slate-400 text-sm">Income</div>
                    <div className="text-slate-200">{a.cost || 0}</div>
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={() => setViewingAppointment(a)}
                      className="w-full px-4 py-2 rounded-full border-gradient bg-panel2 text-center hover:bg-slate-700 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* View Appointment Modal */}
      {viewingAppointment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setViewingAppointment(null)}>
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Appointment Details</div>
              <button
                onClick={() => setViewingAppointment(null)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Title</label>
                  <div className="input bg-slate-800/50 border-slate-700">{viewingAppointment.title || "-"}</div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Doctor</label>
                  <div className="input bg-slate-800/50 border-slate-700">
                    {doctors.find((d: any) => d.id === viewingAppointment.doctorId)?.name || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Patient</label>
                  <div className="input bg-slate-800/50 border-slate-700">
                    {viewingAppointment.patientId 
                      ? (patients.find((p: any) => p.id === viewingAppointment.patientId) 
                          ? `${patients.find((p: any) => p.id === viewingAppointment.patientId).firstName} ${patients.find((p: any) => p.id === viewingAppointment.patientId).lastName}`
                          : `ID: ${viewingAppointment.patientId}`)
                      : "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Date</label>
                  <div className="input bg-slate-800/50 border-slate-700">
                    {moment(viewingAppointment.start).format("DD/MM/YYYY")}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Start Time</label>
                  <div className="input bg-slate-800/50 border-slate-700">
                    {moment(viewingAppointment.start).format("HH:mm")}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">End Time</label>
                  <div className="input bg-slate-800/50 border-slate-700">
                    {moment(viewingAppointment.end).format("HH:mm")}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Cost</label>
                  <div className="input bg-slate-800/50 border-slate-700">
                    ${viewingAppointment.cost || 0}
                  </div>
                </div>
              </div>
              {viewingAppointment.notes && (
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Notes</label>
                  <div className="input bg-slate-800/50 border-slate-700 min-h-[100px] whitespace-pre-wrap">
                    {viewingAppointment.notes}
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingAppointment(null)}
                  className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

