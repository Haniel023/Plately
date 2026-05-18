import { useNavigate, useLocation } from "react-router-dom";
import { NAV_TABS } from "../../lib/constants";

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {NAV_TABS.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.key}
            className={`bottom-nav-btn${isActive ? " active-bottom-tab" : ""}`}
            onClick={() => navigate(tab.path)}
          >
            <span>{tab.icon}</span>
            <small>{tab.label}</small>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;
