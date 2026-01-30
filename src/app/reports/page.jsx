"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { TrendingUp, Calendar, DollarSign, Users } from "lucide-react";

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState("30");

  const startDate = new Date(
    Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .split("T")[0];
  const endDate = new Date().toISOString().split("T")[0];

  // Fetch booking reports
  const { data: bookingReport, isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookingReport", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(
        `/api/reports/bookings?startDate=${startDate}&endDate=${endDate}`,
      );
      if (!response.ok) throw new Error("Failed to fetch booking report");
      return response.json();
    },
  });

  // Fetch revenue reports
  const { data: revenueReport, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenueReport", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(
        `/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`,
      );
      if (!response.ok) throw new Error("Failed to fetch revenue report");
      return response.json();
    },
  });

  const isLoading = bookingsLoading || revenueLoading;

  return (
    <div className="flex h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Reports & Analytics"
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black dark:text-white font-sora">
              Business Analytics
            </h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-[#E6E6E6] dark:border-[#404040] rounded-lg bg-white dark:bg-[#262626] text-black dark:text-white text-sm"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-[#6F6F6F] dark:text-[#AAAAAA]">
              Loading reports...
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#E0E7FF] dark:bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
                      <Calendar
                        size={24}
                        className="text-[#6366F1] dark:text-[#818CF8]"
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-black dark:text-white font-sora">
                      {bookingReport?.summary?.total_bookings || 0}
                    </div>
                  </div>
                  <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                    Total Bookings
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-[rgba(32,198,93,0.10)] dark:bg-[rgba(32,198,93,0.18)] flex items-center justify-center">
                      <DollarSign
                        size={24}
                        className="text-[#20C65D] dark:text-[#40D677]"
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-black dark:text-white font-sora">
                      $
                      {parseFloat(
                        revenueReport?.summary?.completed_revenue || 0,
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                    Total Revenue
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#DCFCE7] dark:bg-[rgba(64,214,119,0.15)] flex items-center justify-center">
                      <TrendingUp
                        size={24}
                        className="text-[#22C55E] dark:text-[#40D677]"
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-black dark:text-white font-sora">
                      $
                      {parseFloat(
                        revenueReport?.summary?.average_payment || 0,
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                    Average Booking Value
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#FEF3C7] dark:bg-[rgba(251,191,36,0.15)] flex items-center justify-center">
                      <Users
                        size={24}
                        className="text-[#F59E0B] dark:text-[#FBBF24]"
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-black dark:text-white font-sora">
                      {bookingReport?.topCustomers?.length || 0}
                    </div>
                  </div>
                  <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                    Active Customers
                  </div>
                </div>
              </div>

              {/* Bookings by Court */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-6 font-bricolage">
                    Bookings by Court
                  </h3>
                  <div className="space-y-4">
                    {bookingReport?.byCourt?.map((court, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-black dark:text-white font-inter font-medium">
                            {court.court_name}
                          </span>
                          <span className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                            {court.booking_count} bookings
                          </span>
                        </div>
                        <div className="w-full bg-[#F3F3F3] dark:bg-[#2A2A2A] rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#20C65D] to-[#16A34A] h-2 rounded-full"
                            style={{
                              width: `${(parseInt(court.booking_count) / parseInt(bookingReport?.summary?.total_bookings || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                            Revenue: $
                            {parseFloat(court.revenue || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revenue by Payment Method */}
                <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-6 font-bricolage">
                    Revenue by Payment Method
                  </h3>
                  <div className="space-y-4">
                    {revenueReport?.byPaymentMethod?.map((method, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-black dark:text-white font-inter font-medium capitalize">
                            {method.payment_method.replace("_", " ")}
                          </span>
                          <span className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                            {method.payment_count} payments
                          </span>
                        </div>
                        <div className="w-full bg-[#F3F3F3] dark:bg-[#2A2A2A] rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#6366F1] to-[#818CF8] h-2 rounded-full"
                            style={{
                              width: `${(parseFloat(method.total_amount) / parseFloat(revenueReport?.summary?.completed_revenue || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                            Total: $
                            {parseFloat(method.total_amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Customers */}
              <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-6 font-bricolage">
                  Top Customers
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F3F3F3] dark:border-[#333333]">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                          Rank
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                          Bookings
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                          Total Spent
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingReport?.topCustomers?.map((customer, index) => (
                        <tr
                          key={index}
                          className="border-b border-[#F9F9F9] dark:border-[#2A2A2A]"
                        >
                          <td className="py-4 px-4 text-sm text-black dark:text-white font-inter font-bold">
                            #{index + 1}
                          </td>
                          <td className="py-4 px-4 text-sm text-black dark:text-white font-inter">
                            {customer.full_name}
                          </td>
                          <td className="py-4 px-4 text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                            {customer.email}
                          </td>
                          <td className="py-4 px-4 text-sm text-black dark:text-white font-inter">
                            {customer.booking_count}
                          </td>
                          <td className="py-4 px-4 text-sm text-black dark:text-white font-inter font-semibold">
                            ${parseFloat(customer.total_spent || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
