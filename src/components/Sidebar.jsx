import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  BarChart3,
  Menu,
} from "lucide-react";

export default function Sidebar({ onClose }) {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const handleNavigation = (href) => {
    window.location.href = href;
  };

  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Courts", icon: Menu, href: "/courts" },
    { name: "Bookings", icon: Calendar, href: "/bookings" },
    { name: "Payments", icon: Wallet, href: "/payments" },
    { name: "Reports", icon: BarChart3, href: "/reports" },
  ];

  return (
    <div className="w-60 bg-[#F3F3F3] dark:bg-[#1A1A1A] flex-shrink-0 flex flex-col h-full">
      {/* Brand Logo */}
      <div className="p-4 flex justify-start">
        <div className="w-12 h-12 bg-white dark:bg-[#262626] rounded-full border border-[#E4E4E4] dark:border-[#404040] flex items-center justify-center">
          <div className="text-2xl font-bold text-black dark:text-white">F</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;

            return (
              <button
                key={item.name}
                onClick={() => {
                  handleNavigation(item.href);
                  if (
                    onClose &&
                    typeof window !== "undefined" &&
                    window.innerWidth < 1024
                  ) {
                    onClose();
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white dark:bg-[#262626] border border-[#E4E4E4] dark:border-[#404040] text-black dark:text-white"
                    : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 active:bg-white/70 dark:active:bg-white/15 active:scale-[0.98]"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-black dark:text-white"
                      : "text-black/70 dark:text-white/70"
                  }
                />
                <span
                  className={`font-medium text-sm font-plus-jakarta ${
                    isActive
                      ? "text-black dark:text-white"
                      : "text-black/70 dark:text-white/70"
                  }`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4">
        <div className="text-xs text-black/50 dark:text-white/50 font-inter">
          Futsal Management v1.0
        </div>
      </div>
    </div>
  );
}
