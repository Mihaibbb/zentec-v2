import React, { useState } from "react";
import { api, getCurrentUser } from "../lib/api";
import { useNavigate } from "react-router-dom";
import CalendarInput from "../components/Calendar";
import { getEmailError, getPhoneError, getRequiredError, phoneRegex, emailRegex } from "../utils/validation";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PatientNew() {
  const user = getCurrentUser();
  const clinicId = user?.clinicId;
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", dob: "", fileNumber: "",
    email: "", country: "", city: "", address: "", gender: "N", pic: "", notes: ""
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [otherFieldsExpanded, setOtherFieldsExpanded] = useState(false);
  const navigate = useNavigate();

  function validateForm(): boolean {
    const newErrors: Record<string, string | null> = {};
    newErrors.firstName = getRequiredError(form.firstName, "First Name");
    newErrors.lastName = getRequiredError(form.lastName, "Last Name");
    newErrors.phone = getPhoneError(form.phone, true);
    newErrors.fileNumber = getRequiredError(form.fileNumber, "File Number");
    if (form.email) {
      newErrors.email = getEmailError(form.email, false);
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some(err => err !== null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm() || !clinicId) return;
    setSaving(true);
    try {
      await api.post("/patients", { clinicId, ...form });
      navigate("/patients");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-xl lg:text-2xl font-semibold text-center mb-4 lg:mb-8">Create new patient</h1>
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
            <label className="block text-sm mb-1 text-slate-400">Phone number <span className="text-red-500">*</span></label>
            <input 
              type="tel"
              pattern={phoneRegex.source}
              title="Please enter a valid phone number (e.g., +1234567890, 123-456-7890, (123) 456-7890)"
              className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${errors.phone ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={form.phone} 
              onChange={e => {
                setForm({ ...form, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: getPhoneError(e.target.value, true) });
              }}
              required
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-400">Date of birth</label>
            <CalendarInput
              value={form.dob}
              onChange={(value) => setForm({ ...form, dob: value })}
              placeholder="Select date of birth"
              allowPastDates={true}
              maxDate={new Date()} // Only allow past dates (up to today)
              maxWidth="320px"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 text-slate-400">File Number <span className="text-red-500">*</span></label>
          <input 
            className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${errors.fileNumber ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            value={form.fileNumber} 
            onChange={e => {
              setForm({ ...form, fileNumber: e.target.value });
              if (errors.fileNumber) setErrors({ ...errors, fileNumber: getRequiredError(e.target.value, "File Number") });
            }}
            required
          />
          {errors.fileNumber && <p className="text-red-400 text-xs mt-1">{errors.fileNumber}</p>}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setOtherFieldsExpanded(!otherFieldsExpanded)}
            className="flex items-center gap-2 text-xl mb-2 text-slate-200 font-semibold hover:text-slate-100 transition-colors"
          >
            <span>Other fields</span>
            {otherFieldsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {otherFieldsExpanded && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-slate-400">Email</label>
            <input 
              type="email"
              pattern={emailRegex.source}
              title="Please enter a valid email address (e.g., user@example.com)"
              className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${errors.email ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={form.email} 
              onChange={e => {
                setForm({ ...form, email: e.target.value });
                if (errors.email || e.target.value) setErrors({ ...errors, email: getEmailError(e.target.value, false) });
              }}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-400">Country</label>
            <input 
              className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={form.country} 
              onChange={e => setForm({ ...form, country: e.target.value })} 
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-slate-400">City</label>
            <input 
              className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={form.city} 
              onChange={e => setForm({ ...form, city: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-400">Address</label>
            <input 
              className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={form.address} 
              onChange={e => setForm({ ...form, address: e.target.value })} 
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-slate-400">Gender</label>
            <div className="flex items-center gap-4 text-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  checked={form.gender === "M"} 
                  onChange={() => setForm({ ...form, gender: "M" })} 
                  className="w-4 h-4 text-purple-600 border-none focus:ring-purple-500"
                /> 
                Male
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  checked={form.gender === "F"} 
                  onChange={() => setForm({ ...form, gender: "F" })} 
                  className="w-4 h-4 text-purple-600 border-none focus:ring-purple-500"
                /> 
                Female
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  checked={form.gender === "N"} 
                  onChange={() => setForm({ ...form, gender: "N" })} 
                  className="w-4 h-4 text-purple-600 border-none focus:ring-purple-500"
                /> 
                Not mentioned
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-400">PIC</label>
            <input 
              className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={form.pic} 
              onChange={e => setForm({ ...form, pic: e.target.value })} 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 text-slate-400">Notes</label>
          <textarea 
            className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors h-28 resize-none" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            value={form.notes} 
            onChange={e => setForm({ ...form, notes: e.target.value })} 
          />
        </div>
          </>
        )}
        <div className="pt-2">
          <button disabled={saving} type="submit" className="btn w-full">{saving ? "Saving..." : "Add patient"}</button>
        </div>
      </form>
    </div>
  );
}

