import { Link, useLocation } from "react-router-dom";
import { Home, Users, Target, UserPlus, Diamond } from "lucide-react";

const menuItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/purposes", label: "Purposes", icon: Target },
  { path: "/staff", label: "Staff", icon: UserPlus },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Diamond className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold gold-gradient-text">
              Pavan Gold
            </h1>
            <p className="text-xs text-muted-foreground">Association</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          © 2026 Pavan Gold
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
