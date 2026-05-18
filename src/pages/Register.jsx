import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName } },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: form.fullName,
        email: form.email,
      });
    }

    setLoading(false);
    setSuccess(true);

    // If email confirmation is required, data.session is null
    if (!data.session) {
      setMessage("Check your email to confirm your account, then log in.");
      return;
    }

    setMessage("Account created! Redirecting...");
    setTimeout(() => navigate("/browse"), 1200);
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-logo">
          <ChefHat size={34} />
        </div>
        <h1>Plately</h1>
        <p>Start sharing your favorite recipes with the world.</p>
        <div className="auth-tags">
          <span>🍳 Share Recipes</span>
          <span>📅 Plan Meals</span>
          <span>💰 Track Costs</span>
        </div>
      </div>

      <form className="modern-auth-card" onSubmit={handleRegister}>
        <p className="auth-kicker">Create account</p>
        <h2>Join Plately</h2>
        <p className="auth-subtitle">Build your personal recipe collection and plan meals.</p>

        <input
          type="text"
          name="fullName"
          placeholder="Full name"
          value={form.fullName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required
        />

        <button disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        {message && (
          <p className={`message${success ? " success" : ""}`}>{message}</p>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
