import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/browse");
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-logo">
          <ChefHat size={34} />
        </div>
        <h1>Plately</h1>
        <p>Discover, share, and plan delicious meals together.</p>
        <div className="auth-tags">
          <span>🍳 Share Recipes</span>
          <span>📅 Plan Meals</span>
          <span>💰 Track Costs</span>
        </div>
      </div>

      <form className="modern-auth-card" onSubmit={handleLogin}>
        <p className="auth-kicker">Welcome back</p>
        <h2>Login to Plately</h2>
        <p className="auth-subtitle">Browse recipes and plan your weekly meals.</p>

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
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p className="message">{message}</p>}

        <p className="auth-switch">
          No account yet? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
