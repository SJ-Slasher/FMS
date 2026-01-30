"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export default function CourtsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    court_type: "",
    price_per_hour: "",
    is_active: true,
  });

  const queryClient = useQueryClient();

  // Fetch courts
  const { data: courtsData, isLoading } = useQuery({
    queryKey: ["courts"],
    queryFn: async () => {
      const response = await fetch("/api/courts");
      if (!response.ok) throw new Error("Failed to fetch courts");
      return response.json();
    },
  });

  // Create court mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/courts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create court");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courts"]);
      setShowModal(false);
      resetForm();
      toast.success("Court created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update court mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/courts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update court");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courts"]);
      setShowModal(false);
      setEditingCourt(null);
      resetForm();
      toast.success("Court updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete court mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/courts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete court");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courts"]);
      toast.success("Court deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCourt) {
      updateMutation.mutate({ id: editingCourt.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      description: court.description || "",
      court_type: court.court_type,
      price_per_hour: court.price_per_hour,
      is_active: court.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this court?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      court_type: "",
      price_per_hour: "",
      is_active: true,
    });
    setEditingCourt(null);
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
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Courts Management"
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black dark:text-white font-sora">
              Futsal Courts
            </h2>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold rounded-xl transition-all duration-150 hover:from-[#2d2d2d] hover:to-[#171717] dark:hover:from-[#F0F0F0] dark:hover:to-[#D0D0D0] active:scale-95"
            >
              <Plus size={20} />
              Add Court
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12 text-[#6F6F6F] dark:text-[#AAAAAA]">
                Loading courts...
              </div>
            ) : (
              courtsData?.courts?.map((court) => (
                <div
                  key={court.id}
                  className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6 hover:border-[#D0D0D0] dark:hover:border-[#444444] transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-black dark:text-white font-bricolage mb-1">
                        {court.name}
                      </h3>
                      <span className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                        {court.court_type}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        court.is_active
                          ? "bg-[#DCFCE7] dark:bg-[rgba(64,214,119,0.15)] text-[#16A34A] dark:text-[#40D677] border border-[#22C55E] dark:border-[#40D677]"
                          : "bg-[#FFEAEA] dark:bg-[rgba(255,102,102,0.15)] text-[#DC2626] dark:text-[#FF6666] border border-[#F87171] dark:border-[#FF6666]"
                      } font-montserrat`}
                    >
                      {court.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {court.description && (
                    <p className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] mb-4 font-inter">
                      {court.description}
                    </p>
                  )}

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-black dark:text-white font-sora">
                      ${parseFloat(court.price_per_hour).toFixed(2)}
                      <span className="text-sm font-normal text-[#6F6F6F] dark:text-[#AAAAAA]">
                        /hour
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(court)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#262626] border border-[#E6E6E6] dark:border-[#404040] rounded-lg text-black dark:text-white font-medium text-sm transition-all duration-150 hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] active:scale-95"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(court.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#FFEAEA] dark:bg-[rgba(255,102,102,0.15)] border border-[#F87171] dark:border-[#FF6666] rounded-lg text-[#DC2626] dark:text-[#FF6666] font-medium text-sm transition-all duration-150 hover:bg-[#FFDDDD] dark:hover:bg-[rgba(255,102,102,0.25)] active:scale-95"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-black dark:text-white font-bricolage">
                {editingCourt ? "Edit Court" : "Add New Court"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] transition-all duration-150"
              >
                <X size={20} className="text-black dark:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                  Court Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E6E6E6] dark:border-[#404040] rounded-lg bg-white dark:bg-[#262626] text-black dark:text-white focus:border-black dark:focus:border-white transition-all duration-200"
                  placeholder="e.g., Court A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E6E6E6] dark:border-[#404040] rounded-lg bg-white dark:bg-[#262626] text-black dark:text-white focus:border-black dark:focus:border-white transition-all duration-200"
                  rows="3"
                  placeholder="Enter court description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                  Court Type *
                </label>
                <select
                  required
                  value={formData.court_type}
                  onChange={(e) =>
                    setFormData({ ...formData, court_type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E6E6E6] dark:border-[#404040] rounded-lg bg-white dark:bg-[#262626] text-black dark:text-white focus:border-black dark:focus:border-white transition-all duration-200"
                >
                  <option value="">Select type</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Indoor Premium">Indoor Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                  Price per Hour ($) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price_per_hour}
                  onChange={(e) =>
                    setFormData({ ...formData, price_per_hour: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E6E6E6] dark:border-[#404040] rounded-lg bg-white dark:bg-[#262626] text-black dark:text-white focus:border-black dark:focus:border-white transition-all duration-200"
                  placeholder="50.00"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-[#E6E6E6] dark:border-[#404040]"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm text-black dark:text-white font-inter"
                >
                  Court is active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border border-[#E6E6E6] dark:border-[#404040] rounded-lg text-black dark:text-white font-medium transition-all duration-150 hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-1 px-4 py-3 bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold rounded-lg transition-all duration-150 hover:from-[#2d2d2d] hover:to-[#171717] dark:hover:from-[#F0F0F0] dark:hover:to-[#D0D0D0] active:scale-95 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingCourt
                      ? "Update Court"
                      : "Create Court"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
