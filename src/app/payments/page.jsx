"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { DollarSign, CreditCard, Wallet } from "lucide-react";

export default function PaymentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch payments
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["payments", filterStatus],
    queryFn: async () => {
      let url = "/api/payments";
      if (filterStatus !== "all") {
        url += `?status=${filterStatus}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch payments");
      return response.json();
    },
  });

  const totalCompleted =
    paymentsData?.payments
      ?.filter((p) => p.payment_status === "completed")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

  const totalPending =
    paymentsData?.payments
      ?.filter((p) => p.payment_status === "pending")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

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
        <Header onMenuClick={() => setSidebarOpen(true)} title="Payments" />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  ${totalCompleted.toFixed(2)}
                </div>
              </div>
              <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                Completed Payments
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FEF3C7] dark:bg-[rgba(251,191,36,0.15)] flex items-center justify-center">
                  <Wallet
                    size={24}
                    className="text-[#F59E0B] dark:text-[#FBBF24]"
                  />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-black dark:text-white font-sora">
                  ${totalPending.toFixed(2)}
                </div>
              </div>
              <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                Pending Payments
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#E0E7FF] dark:bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
                  <CreditCard
                    size={24}
                    className="text-[#6366F1] dark:text-[#818CF8]"
                  />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-black dark:text-white font-sora">
                  {paymentsData?.payments?.length || 0}
                </div>
              </div>
              <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                Total Transactions
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black dark:text-white font-sora">
              Payment History
            </h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-[#E6E6E6] dark:border-[#404040] rounded-lg bg-white dark:bg-[#262626] text-black dark:text-white text-sm"
            >
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F3F3F3] dark:border-[#333333] bg-[#FAFAFA] dark:bg-[#262626]">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Transaction ID
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Customer
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Court
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Date
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Method
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-12 text-center text-[#6F6F6F] dark:text-[#AAAAAA]"
                      >
                        Loading payments...
                      </td>
                    </tr>
                  ) : paymentsData?.payments?.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-12 text-center text-[#6F6F6F] dark:text-[#AAAAAA]"
                      >
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    paymentsData?.payments?.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-[#F9F9F9] dark:border-[#2A2A2A] hover:bg-[#FAFAFA] dark:hover:bg-[#262626] transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-black dark:text-white font-inter font-medium">
                          {payment.transaction_id || `PAY-${payment.id}`}
                        </td>
                        <td className="py-4 px-6 text-sm text-black dark:text-white font-inter">
                          {payment.customer_name}
                        </td>
                        <td className="py-4 px-6 text-sm text-black dark:text-white font-inter">
                          {payment.court_name}
                        </td>
                        <td className="py-4 px-6 text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                          {new Date(payment.booking_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-inter capitalize">
                          {payment.payment_method.replace("_", " ")}
                        </td>
                        <td className="py-4 px-6 text-sm text-black dark:text-white font-inter font-semibold">
                          ${parseFloat(payment.amount).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              payment.payment_status === "completed"
                                ? "bg-[#DCFCE7] dark:bg-[rgba(64,214,119,0.15)] text-[#16A34A] dark:text-[#40D677] border border-[#22C55E] dark:border-[#40D677]"
                                : payment.payment_status === "pending"
                                  ? "bg-[#FEF3C7] dark:bg-[rgba(251,191,36,0.15)] text-[#D97706] dark:text-[#FBBF24] border border-[#F59E0B] dark:border-[#FBBF24]"
                                  : payment.payment_status === "refunded"
                                    ? "bg-[#E0E7FF] dark:bg-[rgba(99,102,241,0.15)] text-[#6366F1] dark:text-[#818CF8] border border-[#818CF8] dark:border-[#818CF8]"
                                    : "bg-[#FFEAEA] dark:bg-[rgba(255,102,102,0.15)] text-[#DC2626] dark:text-[#FF6666] border border-[#F87171] dark:border-[#FF6666]"
                            } font-montserrat capitalize`}
                          >
                            {payment.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))
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
