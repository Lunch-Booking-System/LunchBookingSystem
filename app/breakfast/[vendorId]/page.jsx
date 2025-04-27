"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  PlusCircle,
  DollarSign,
  Image,
  AlertCircle,
  Check,
  X,
  Pencil,
} from "lucide-react";
import VendorNavbar from "@/components/VendorNavbar";

const BreakfastManager = () => {
  const { vendorId } = useParams();
  const [breakfasts, setBreakfasts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBreakfast, setEditingBreakfast] = useState(null);

  const [newBreakfast, setNewBreakfast] = useState({
    itemName: "",
    type: "Veg",
    description: "",
    imageUrl: "",
    price: "",
  });

  useEffect(() => {
    if (vendorId) fetchBreakfasts();
  }, [vendorId]);

  const fetchBreakfasts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/breakfasts?vendorId=${vendorId}`);
      const data = await res.json();
      setBreakfasts(data.breakfasts || []);
    } catch (error) {
      toast.error("Failed to load breakfasts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      const res = await fetch("/api/breakfasts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, isActive: !isActive }),
      });

      if (res.ok) {
        toast.success(
          `Breakfast item ${isActive ? "disabled" : "enabled"} successfully`
        );
        fetchBreakfasts();
      } else {
        toast.error("Failed to update breakfast item status");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleAddOrUpdateBreakfast = async (e) => {
    e.preventDefault();

    if (!newBreakfast.itemName || !newBreakfast.price) {
      toast.error("Item name and price are required");
      return;
    }

    const breakfastData = {
      ...newBreakfast,
      vendor: vendorId,
      price: Number(newBreakfast.price),
    };

    try {
      const url = editingBreakfast
        ? "/api/updateBreakfasts"
        : "/api/breakfasts";
      const method = editingBreakfast ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(breakfastData),
      });

      if (res.ok) {
        toast.success(
          editingBreakfast ? "Breakfast updated" : "Breakfast added"
        );
        setNewBreakfast({
          itemName: "",
          type: "Veg",
          description: "",
          imageUrl: "",
          price: "",
        });
        setEditingBreakfast(null);
        setShowForm(false);
        fetchBreakfasts();
      } else {
        toast.error("Failed to save breakfast item");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleEdit = (breakfast) => {
    setEditingBreakfast(breakfast);
    setNewBreakfast(breakfast);
    setShowForm(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24">
      <VendorNavbar />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Manage Breakfast Items
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingBreakfast(null);
            setNewBreakfast({
              itemName: "",
              type: "Veg",
              description: "",
              imageUrl: "",
              price: "",
            });
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle size={18} />
          {showForm ? "Cancel" : "Add New Breakfast"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg mb-8 shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
            {editingBreakfast ? "Edit Breakfast" : "Add New Breakfast"}
          </h2>
          <form
            onSubmit={handleAddOrUpdateBreakfast}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input type="hidden" value={newBreakfast._id || ""} />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Item Name*
              </label>
              <input
                type="text"
                value={newBreakfast.itemName}
                onChange={(e) =>
                  setNewBreakfast({ ...newBreakfast, itemName: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price (₹)*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <DollarSign size={16} className="text-gray-500" />
                </div>
                <input
                  type="number"
                  value={newBreakfast.price}
                  onChange={(e) =>
                    setNewBreakfast({ ...newBreakfast, price: e.target.value })
                  }
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                value={newBreakfast.type}
                onChange={(e) =>
                  setNewBreakfast({ ...newBreakfast, type: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Image size={16} className="text-gray-500" />
                </div>
                <input
                  type="url"
                  value={newBreakfast.imageUrl}
                  onChange={(e) =>
                    setNewBreakfast({
                      ...newBreakfast,
                      imageUrl: e.target.value,
                    })
                  }
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={newBreakfast.description}
                onChange={(e) =>
                  setNewBreakfast({
                    ...newBreakfast,
                    description: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBreakfast(null);
                  setNewBreakfast({
                    itemName: "",
                    type: "Veg",
                    description: "",
                    imageUrl: "",
                    price: "",
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-2"
              >
                <PlusCircle size={18} />
                {editingBreakfast ? "Update Breakfast" : "Add Breakfast"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!isLoading && breakfasts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <AlertCircle size={48} className="text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700">
            No breakfast items available
          </h3>
          <p className="text-gray-500 mb-4">
            Add your first breakfast item to get started
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Add New Breakfast
            </button>
          )}
        </div>
      )}

      {!isLoading && breakfasts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {breakfasts.map((breakfast) => (
            <div
              key={breakfast._id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white"
            >
              <div className="relative h-48">
                <img
                  src={breakfast.imageUrl || "/api/placeholder/400/320"}
                  alt={breakfast.itemName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/400/320";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      breakfast.type === "Veg"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {breakfast.type}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-lg font-bold text-white">
                    {breakfast.itemName}
                  </h3>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{breakfast.price}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      breakfast.isActive ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {breakfast.isActive ? (
                      <>
                        <X size={16} className="text-red-600" />
                        Unavailable
                      </>
                    ) : (
                      <>
                        <Check size={16} className="text-green-600" />
                        Available
                      </>
                    )}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {breakfast.description || "No description available"}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(breakfast)}
                    className="w-full py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    <Pencil size={16} className="inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleToggleStatus(breakfast._id, breakfast.isActive)
                    }
                    className={`w-full py-2 rounded-md text-sm font-medium ${
                      breakfast.isActive
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    {breakfast.isActive ? "Available" : "Unavailable"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BreakfastManager;
