"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  ArrowUp,
  ArrowDown,
  Calendar,
  DollarSign,
  Users,
  Activity,
} from "lucide-react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch today's bookings
  const today = new Date().toISOString().split("T")[0];
  const { data: todayBookings } = useQuery({
    queryKey: ["todayBookings"],
    queryFn: async () => {
      const response = await fetch(`/api/bookings?date=${today}`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
  });

  // Fetch booking reports for the last 30 days
  const { data: reportData } = useQuery({
    queryKey: ["dashboardReport"],
    queryFn: async () => {
      const response = await fetch("/api/reports/bookings");
      if (!response.ok) throw new Error("Failed to fetch report");
      return response.json();
    },
  });

  const todayCount = todayBookings?.bookings?.length || 0;
  const totalRevenue = reportData?.summary?.total_revenue || 0;
  const totalBookings = reportData?.summary?.total_bookings || 0;

  return (
    <div className="flex h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Dashboard" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Bookings */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] dark:bg-[rgba(64,214,119,0.15)] flex items-center justify-center">
                  <Calendar
                    size={24}
                    className="text-[#22C55E] dark:text-[#40D677]"
                  />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-black dark:text-white font-sora">
                  {todayCount}
                </div>
              </div>
              <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                Today's Bookings
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgba(32,198,93,0.10)] dark:bg-[rgba(32,198,93,0.18)] flex items-center justify-center">
                  <DollarSign
                    size={24}
                    className="text-[#20C65D] dark:text-[#40D677]"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(32,198,93,0.10)] dark:bg-[rgba(32,198,93,0.18)] rounded-full">
                  <ArrowUp
                    size={14}
                    className="text-[#20C65D] dark:text-[#40D677]"
                  />
                  <span className="text-xs font-bold text-[#20C65D] dark:text-[#40D677] font-jetbrains">
                    12%
                  </span>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-black dark:text-white font-sora">
                  ${parseFloat(totalRevenue).toFixed(2)}
                </div>
              </div>
              <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                Total Revenue (30d)
              </div>
            </div>

            {/* Total Bookings */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#E0E7FF] dark:bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
                  <Activity
                    size={24}
                    className="text-[#6366F1] dark:text-[#818CF8]"
                  />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-black dark:text-white font-sora">
                  {totalBookings}
                </div>
              </div>
              <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                Total Bookings (30d)
              </div>
            </div>

            {/* Court Utilization */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FEF3C7] dark:bg-[rgba(251,191,36,0.15)] flex items-center justify-center">
                  <Users
                    size={24}
                    className="text-[#F59E0B] dark:text-[#FBBF24]"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(255,75,75,0.08)] dark:bg-[rgba(255,75,75,0.15)] rounded-full">
                  <ArrowDown
                    size={14}
                    className="text-[#FF4B4B] dark:text-[#FF6666]"
                  />
                  <span className="text-xs font-bold text-[#FF4B4B] dark:text-[#FF6666] font-jetbrains">
                    3%
                  </span>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-black dark:text-white font-sora">
                  76%
                </div>
              </div>
              <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                Court Utilization
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
            <h2 className="text-xl font-bold text-black dark:text-white mb-6 font-bricolage">
              Recent Bookings
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F3F3F3] dark:border-[#333333]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Court
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {todayBookings?.bookings?.slice(0, 5).map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-[#F9F9F9] dark:border-[#2A2A2A]"
                    >
                      <td className="py-4 px-4 text-sm text-black dark:text-white font-inter">
                        {booking.customer_name}
                      </td>
                      <td className="py-4 px-4 text-sm text-black dark:text-white font-inter">
                        {booking.court_name}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                        {booking.start_time.slice(0, 5)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-[#DCFCE7] dark:bg-[rgba(64,214,119,0.15)] text-[#16A34A] dark:text-[#40D677] border border-[#22C55E] dark:border-[#40D677]"
                              : booking.status === "pending"
                                ? "bg-[#FEF3C7] dark:bg-[rgba(251,191,36,0.15)] text-[#D97706] dark:text-[#FBBF24] border border-[#F59E0B] dark:border-[#FBBF24]"
                                : "bg-[#FFEAEA] dark:bg-[rgba(255,102,102,0.15)] text-[#DC2626] dark:text-[#FF6666] border border-[#F87171] dark:border-[#FF6666]"
                          } font-montserrat`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!todayBookings?.bookings ||
                    todayBookings.bookings.length === 0) && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-[#6F6F6F] dark:text-[#AAAAAA] font-inter"
                      >
                        No bookings for today
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
