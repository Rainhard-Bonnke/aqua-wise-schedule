import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainSidebar from "./MainSidebar";
import MainHeader from "./MainHeader";

// You should get user/profile from context or props in a real app
const mockUser = { email: "user@example.com" };
const mockProfile = { name: "John Doe", avatar_url: "" };

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const navigate = useNavigate();

  // Handles all navigation from sidebar, quick actions, etc.
  const handleNavigate = (view, data) => {
    setCurrentView(view);
    // Route navigation logic
    if (view === "dashboard") navigate("/dashboard");
    else if (view === "farmers") navigate("/farmers");
    else if (view === "schedules") navigate("/schedules");
    else if (view === "monitoring" && data?.farmId) navigate(`/farms/${data.farmId}/monitoring`);
    else if (view === "analytics") navigate("/analytics");
    else if (view === "extension") navigate("/extension");
    else if (view === "reports") navigate("/reports");
    // Add more as needed
  };

  return (
    <div className="flex min-h-screen">
      <MainSidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col">
        <MainHeader
          user={mockUser}
          profile={mockProfile}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4">
          {/* Pass navigation handler to children if needed */}
          {children && typeof children === "function"
            ? children({ onNavigate: handleNavigate })
            : children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;