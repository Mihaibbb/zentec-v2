import React, { useState, useEffect } from "react";
import { api, getCurrentUser } from "../lib/api";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";
import { getEmailError, getRequiredError, emailRegex } from "../utils/validation";

export default function DoctorEdit() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const user = getCurrentUser();
  const clinicId = user?.clinicId;
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", color: "#F59E0B" });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  function validateForm(): boolean {
    const newErrors: Record<string, string | null> = {};
    newErrors.firstName = getRequiredError(form.firstName, "First Name");
    newErrors.lastName = getRequiredError(form.lastName, "Last Name");
    newErrors.email = getEmailError(form.email, true);
    setErrors(newErrors);
    return !Object.values(newErrors).some(err => err !== null);
  }

  useEffect(() => {
    if (isEdit && id) {
      api.get(`/doctors/${id}`).then(({ data }) => {
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          color: data.color || "#F59E0B"
        });
      });
    }
  }, [id, isEdit]);

  async function save() {
    setSaving(true);
    try {
      if (isEdit && id) {
        await api.patch(`/doctors/${id}`, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          color: form.color
        });
      } else {
        // Create new doctor - this would need password, handled in DoctorNew
        navigate("/doctors/new");
        return;
      }
      navigate("/doctors");
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    if (isEdit) {
      setShowConfirm(true);
    } else {
      save();
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl lg:text-2xl font-semibold text-center mb-4 lg:mb-8">{isEdit ? "Edit Doctor" : "Add Doctor"}</h1>
      <form 
        onSubmit={handleSubmit} 
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
            <label className="block text-sm mb-1 text-slate-400">Color</label>
            <input 
              className="w-16 h-16 rounded-full border-2 border-slate-700 transition-colors cursor-pointer" 
              style={{ backgroundColor: form.color }}
              type="color" 
              value={form.color} 
              onChange={e => setForm({ ...form, color: e.target.value })} 
            />
          </div>
        </div>
        <div className="pt-2 flex gap-2">
          <button 
            type="button"
            onClick={() => navigate("/doctors")} 
            className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button disabled={saving} type="submit" className="btn flex-1">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Doctor"}
          </button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={save}
        title="Save Changes"
        message="Are you sure you want to save the changes for this doctor?"
        confirmText="Save"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
}

