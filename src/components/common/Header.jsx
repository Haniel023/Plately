import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

function Header({ displayName }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <Link to="/browse" className="header-brand">
        <div className="header-brand-icon">🍳</div>
        RecipeBook
      </Link>

      <div className="header-right">
        {displayName && (
          <Link to="/profile">
            <button className="icon-btn" title="Profile">
              <User size={18} />
            </button>
          </Link>
        )}
        {displayName && (
          <button className="icon-btn danger" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
