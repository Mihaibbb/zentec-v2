import React, { useState } from "react";
import { api, getCurrentUser } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { getEmailError, getPasswordError, getRequiredError, emailRegex } from "../utils/validation";
import { ChevronLeft } from "lucide-react";

export default function DoctorNew() {
  const user = getCurrentUser();
  const clinicId = user?.clinicId;
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", color: "#F59E0B" });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  function validateForm(): boolean {
    const newErrors: Record<string, string | null> = {};
    newErrors.firstName = getRequiredError(form.firstName, "First Name");
    newErrors.lastName = getRequiredError(form.lastName, "Last Name");
    newErrors.email = getEmailError(form.email, true);
    newErrors.password = getPasswordError(form.password, true);
    setErrors(newErrors);
    return !Object.values(newErrors).some(err => err !== null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm() || !clinicId) return;
    setSaving(true);
    try {
      await api.post(`/clinic/${clinicId}/users`, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: "doctor"
      });
      // set color on last created doctor for simplicity
      const { data } = await api.get("/doctors", { params: { clinicId } });
      const created = data[data.length - 1];
      if (created && form.color) {
        await api.patch(`/doctors/${created.id}`, { color: form.color });
      }
      navigate("/doctors");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4 lg:mb-8">
        <button
          type="button"
          onClick={() => navigate("/doctors")}
          className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex-shrink-0"
          aria-label="Go back"
        >
          <ChevronLeft size={20} className="lg:w-6 lg:h-6" />
        </button>
        <h1 className="text-xl lg:text-2xl font-semibold flex-1 text-center">Add Doctor</h1>
        <div className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0" /> {/* Spacer for centering */}
      </div>
      <form 
        onSubmit={save} 
        className="rounded-xl p-4 lg:p-6 space-y-4"
        style={{ background: 'linear-gradient(90deg,  rgb(25, 28, 65), transparent)' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-slate-400">First Name <span className="text-red-500">*</span></label>
            <input 
              className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${errors.firstName ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={form.firstName} 
              onChange={e => {
                setForm({ ...form, firstName: e.target.value });
                if (errors.firstName) setErrors({ ...errors, firstName: getRequiredError(e.target.value, "First Name") });
              }}
              required
            />
            {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-400">Last Name <span className="text-red-500">*</span></label>
            <input 
              className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${errors.lastName ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={form.lastName} 
              onChange={e => {
                setForm({ ...form, lastName: e.target.value });
                if (errors.lastName) setErrors({ ...errors, lastName: getRequiredError(e.target.value, "Last Name") });
              }}
              required
            />
            {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-slate-400">Email <span className="text-red-500">*</span></label>
            <input 
              type="email"
              pattern={emailRegex.source}
              title="Please enter a valid email address (e.g., user@example.com)"
              className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${errors.email ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={form.email} 
              onChange={e => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: getEmailError(e.target.value, true) });
              }}
              required
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-400">Password <span className="text-red-500">*</span></label>
            <input 
              className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${errors.password ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              type="password" 
              value={form.password} 
              onChange={e => {
                setForm({ ...form, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: getPasswordError(e.target.value, true) });
              }}
              required
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 text-slate-400">Color</label>
          <input 
            className="w-16 h-16 rounded-full border-2 border-slate-700 transition-colors cursor-pointer" 
            style={{ backgroundColor: form.color }}
            type="color" 
            value={form.color} 
            onChange={e => setForm({ ...form, color: e.target.value })} 
          />
        </div>
        <div className="pt-2">
          <button disabled={saving} type="submit" className="btn w-full">{saving ? "Saving..." : "Create Doctor"}</button>
        </div>
      </form>
    </div>
  );
}

