import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col min-w-0">
        {/* Top Bar with Mobile Menu Toggle */}
        <div className="flex justify-between items-center gap-4 p-4 lg:p-6 border-b border-border bg-card/50 backdrop-blur-sm">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <User className="w-4 h-4 text-primary" />
            <div className="text-sm hidden sm:block">
              <p className="font-semibold text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="text-sm sm:hidden">
              <p className="font-semibold text-foreground">{user?.name?.split(' ')[0]}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2 hidden sm:inline" />
            <span className="hidden sm:inline">Logout</span>
            <LogOut className="w-4 h-4 sm:hidden" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
