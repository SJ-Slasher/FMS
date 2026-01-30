"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { Plus, Eye, X, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

export default function BookingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ["bookings", filterStatus],
    queryFn: async () => {
      let url = "/api/bookings";
      if (filterStatus !== "all") {
        url += `?status=${filterStatus}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
  });

  // Fetch courts for new booking
  const { data: courtsData } = useQuery({
    queryKey: ["courts"],
    queryFn: async () => {
      const response = await fetch("/api/courts?active=true");
      if (!response.ok) throw new Error("Failed to fetch courts");
      return response.json();
    },
    enabled: showNewBooking,
  });

  // Fetch time slots
  const { data: timeSlotsData } = useQuery({
    queryKey: ["timeSlots"],
    queryFn: async () => {
      const response = await fetch("/api/time-slots?active=true");
      if (!response.ok) throw new Error("Failed to fetch time slots");
      return response.json();
    },
    enabled: showNewBooking,
  });

  // Update booking status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update booking");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bookings"]);
      setShowModal(false);
      toast.success("Booking updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleStatusChange = (bookingId, newStatus) => {
    if (confirm(`Are you sure you want to ${newStatus} this booking?`)) {
      updateStatusMutation.mutate({ id: bookingId, status: newStatus });
    }
  };

  const viewBookingDetails = async (bookingId) => {
    const response = await fetch(`/api/bookings/${bookingId}`);
    if (response.ok) {
      const data = await response.json();
      setSelectedBooking(data.booking);
      setShowModal(true);
    }
  };

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
        <Header onMenuClick={() => setSidebarOpen(true)} title="Bookings" />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-black dark:text-white font-sora">
                All Bookings
              </h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-[#E6E6E6] dark:border-[#404040] rounded-lg bg-white dark:bg-[#262626] text-black dark:text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F3F3F3] dark:border-[#333333] bg-[#FAFAFA] dark:bg-[#262626]">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Booking ID
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
                      Time
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#6F6F6F] dark:text-[#AAAAAA] font-opensans">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="py-12 text-center text-[#6F6F6F] dark:text-[#AAAAAA]"
                      >
                        Loading bookings...
                      </td>
                    </tr>
                  ) : bookingsData?.bookings?.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="py-12 text-center text-[#6F6F6F] dark:text-[#AAAAAA]"
                      >
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    bookingsData?.bookings?.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-[#F9F9F9] dark:border-[#2A2A2A] hover:bg-[#FAFAFA] dark:hover:bg-[#262626] transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-black dark:text-white font-inter font-medium">
                          #{booking.id}
                        </td>
                        <td className="py-4 px-6 text-sm text-black dark:text-white font-inter">
                          <div className="font-medium">
                            {booking.customer_name}
                          </div>
                          <div className="text-xs text-[#6F6F6F] dark:text-[#AAAAAA]">
                            {booking.customer_email}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-black dark:text-white font-inter">
                          {booking.court_name}
                        </td>
                        <td className="py-4 px-6 text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                          {new Date(booking.booking_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                          {booking.start_time.slice(0, 5)} -{" "}
                          {booking.end_time.slice(0, 5)}
                        </td>
                        <td className="py-4 px-6 text-sm text-black dark:text-white font-inter font-semibold">
                          ${parseFloat(booking.total_amount).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-[#DCFCE7] dark:bg-[rgba(64,214,119,0.15)] text-[#16A34A] dark:text-[#40D677] border border-[#22C55E] dark:border-[#40D677]"
                                : booking.status === "pending"
                                  ? "bg-[#FEF3C7] dark:bg-[rgba(251,191,36,0.15)] text-[#D97706] dark:text-[#FBBF24] border border-[#F59E0B] dark:border-[#FBBF24]"
                                  : booking.status === "completed"
                                    ? "bg-[#E0E7FF] dark:bg-[rgba(99,102,241,0.15)] text-[#6366F1] dark:text-[#818CF8] border border-[#818CF8] dark:border-[#818CF8]"
                                    : "bg-[#FFEAEA] dark:bg-[rgba(255,102,102,0.15)] text-[#DC2626] dark:text-[#FF6666] border border-[#F87171] dark:border-[#FF6666]"
                            } font-montserrat`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => viewBookingDetails(booking.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#2A2A2A] border border-[#E6E6E6] dark:border-[#404040] rounded-lg text-black dark:text-white text-sm transition-all duration-150 hover:bg-[#F5F5F5] dark:hover:bg-[#333333] active:scale-95"
                          >
                            <Eye size={14} />
                            View
                          </button>
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

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-black dark:text-white font-bricolage">
                Booking Details
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                }}
                className="p-2 rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] transition-all duration-150"
              >
                <X size={20} className="text-black dark:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] mb-1">
                    Booking ID
                  </div>
                  <div className="text-base font-semibold text-black dark:text-white">
                    #{selectedBooking.id}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] mb-1">
                    Status
                  </div>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      selectedBooking.status === "confirmed"
                        ? "bg-[#DCFCE7] dark:bg-[rgba(64,214,119,0.15)] text-[#16A34A] dark:text-[#40D677] border border-[#22C55E] dark:border-[#40D677]"
                        : selectedBooking.status === "pending"
                          ? "bg-[#FEF3C7] dark:bg-[rgba(251,191,36,0.15)] text-[#D97706] dark:text-[#FBBF24] border border-[#F59E0B] dark:border-[#FBBF24]"
                          : selectedBooking.status === "completed"
                            ? "bg-[#E0E7FF] dark:bg-[rgba(99,102,241,0.15)] text-[#6366F1] dark:text-[#818CF8] border border-[#818CF8] dark:border-[#818CF8]"
                            : "bg-[#FFEAEA] dark:bg-[rgba(255,102,102,0.15)] text-[#DC2626] dark:text-[#FF6666] border border-[#F87171] dark:border-[#FF6666]"
                    }`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#E6E6E6] dark:border-[#404040] pt-4">
                <h4 className="font-semibold text-black dark:text-white mb-3">
                  Customer Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA]">
                      Name:
                    </span>
                    <span className="text-sm text-black dark:text-white font-medium">
                      {selectedBooking.customer_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA]">
                      Email:
                    </span>
                    <span className="text-sm text-black dark:text-white">
                      {selectedBooking.customer_email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA]">
                      Phone:
                    </span>
                    <span className="text-sm text-black dark:text-white">
                      {selectedBooking.customer_phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E6E6E6] dark:border-[#404040] pt-4">
                <h4 className="font-semibold text-black dark:text-white mb-3">
                  Booking Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA]">
                      Court:
                    </span>
                    <span className="text-sm text-black dark:text-white font-medium">
                      {selectedBooking.court_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA]">
                      Type:
                    </span>
                    <span className="text-sm text-black dark:text-white">
                      {selectedBooking.court_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA]">
                      Date:
                    </span>
                    <span className="text-sm text-black dark:text-white">
                      {new Date(
                        selectedBooking.booking_date,
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA]">
                      Time:
                    </span>
                    <span className="text-sm text-black dark:text-white font-medium">
                      {selectedBooking.start_time.slice(0, 5)} -{" "}
                      {selectedBooking.end_time.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA]">
                      Total Amount:
                    </span>
                    <span className="text-lg text-black dark:text-white font-bold">
                      ${parseFloat(selectedBooking.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="border-t border-[#E6E6E6] dark:border-[#404040] pt-4">
                  <h4 className="font-semibold text-black dark:text-white mb-2">
                    Notes
                  </h4>
                  <p className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA]">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {selectedBooking.status === "pending" && (
                <div className="border-t border-[#E6E6E6] dark:border-[#404040] pt-4">
                  <h4 className="font-semibold text-black dark:text-white mb-3">
                    Update Status
                  </h4>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleStatusChange(selectedBooking.id, "confirmed")
                      }
                      className="flex-1 px-4 py-2 bg-[#DCFCE7] dark:bg-[rgba(64,214,119,0.15)] text-[#16A34A] dark:text-[#40D677] border border-[#22C55E] dark:border-[#40D677] rounded-lg font-medium transition-all duration-150 hover:bg-[#BBF7D0] active:scale-95"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedBooking.id, "cancelled")
                      }
                      className="flex-1 px-4 py-2 bg-[#FFEAEA] dark:bg-[rgba(255,102,102,0.15)] text-[#DC2626] dark:text-[#FF6666] border border-[#F87171] dark:border-[#FF6666] rounded-lg font-medium transition-all duration-150 hover:bg-[#FFDDDD] active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
