import React, { useState } from "react";
import { api, saveToken } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { getEmailError, emailRegex } from "../utils/validation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const emailErr = getEmailError(email, true);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }
    setEmailError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveToken(data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <h1 className="text-xl lg:text-2xl font-semibold">Login</h1>
        {error && <div className="text-red-400">{error}</div>}
        <div>
          <input 
            type="email"
            pattern={emailRegex.source}
            title="Please enter a valid email address (e.g., user@example.com)"
            className={`input w-full ${emailError ? 'border-red-500' : ''}`} 
            value={email} 
            onChange={e => {
              setEmail(e.target.value);
              if (emailError) setEmailError(getEmailError(e.target.value, true));
            }} 
            placeholder="Email" 
            required
          />
          {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
        </div>
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button className="btn w-full">Sign in</button>
      </form>
    </div>
  );
}

