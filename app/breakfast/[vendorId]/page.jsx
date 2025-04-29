"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  PlusCircle,
  ChevronDown,
  DollarSign,
  Image as ImageIcon,
  AlertCircle,
  Pencil,
  Search,
  X,
  Check,
  Filter,
  Coffee,
} from "lucide-react";
import VendorNavbar from "@/components/VendorNavbar";

const BreakfastManager = () => {
  const { vendorId } = useParams();
  const [breakfasts, setBreakfasts] = useState([]);
  const [filteredBreakfasts, setFilteredBreakfasts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBreakfast, setEditingBreakfast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [sortOption, setSortOption] = useState("name-asc");
  const [formSubmitting, setFormSubmitting] = useState(false);

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

  useEffect(() => {
    applyFilters();
  }, [breakfasts, searchTerm, filterType, sortOption]);

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

 

  const applyFilters = () => {
    let results = [...breakfasts];

    if (searchTerm.trim()) {
      results = results.filter(
        (breakfast) =>
          breakfast.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          breakfast.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "All") {
      results = results.filter((breakfast) => breakfast.type === filterType);
    }

    switch (sortOption) {
      case "name-asc":
        results.sort((a, b) => a.itemName.localeCompare(b.itemName));
        break;
      case "name-desc":
        results.sort((a, b) => b.itemName.localeCompare(a.itemName));
        break;
      case "price-asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        results.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredBreakfasts(results);
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/breakfasts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, available: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Failed to update breakfast status");
        return;
      }

      setBreakfasts((prev) =>
        prev.map((breakfast) =>
          breakfast._id === id ? data.breakfast : breakfast
        )
      );

      toast.success(
        `Breakfast ${
          data.breakfast.available ? "available" : "unavailable"
        } now`
      );
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleAddOrUpdateBreakfast = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    if (!newBreakfast.itemName || !newBreakfast.price) {
      toast.error("Item name and price are required");
      setFormSubmitting(false);
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
          editingBreakfast
            ? "Breakfast updated successfully"
            : "Breakfast added successfully"
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
        toast.error("Failed to save breakfast");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (breakfast) => {
    setEditingBreakfast(breakfast);
    setNewBreakfast({
      _id: breakfast._id,
      itemName: breakfast.itemName,
      type: breakfast.type,
      description: breakfast.description,
      imageUrl: breakfast.imageUrl,
      price: breakfast.price,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setNewBreakfast({
      itemName: "",
      type: "Veg",
      description: "",
      imageUrl: "",
      price: "",
    });
    setEditingBreakfast(null);
    setShowForm(false);
  };

  return (
    <>
      <VendorNavbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6 pt-20 md:pt-24">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <Coffee className="mr-2 text-yellow-600" size={24} />
                Manage Breakfast Items
              </h1>
              <p className="text-gray-600 mt-1">
                Add and manage breakfast items for your customers
              </p>
            </div>
            <button
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              {showForm ? <X size={18} /> : <PlusCircle size={18} />}
              {showForm ? "Cancel Form" : "Add New Breakfast"}
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl mb-8 shadow-md border border-gray-200 transition-all">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              {editingBreakfast ? (
                <>
                  <Pencil size={18} className="mr-2 text-yellow-600" />
                  Edit Breakfast
                </>
              ) : (
                <>
                  <PlusCircle size={18} className="mr-2 text-green-600" />
                  Add New Breakfast
                </>
              )}
            </h2>
            <form
              onSubmit={handleAddOrUpdateBreakfast}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
                    setNewBreakfast({
                      ...newBreakfast,
                      itemName: e.target.value,
                    })
                  }
                  required
                  placeholder="Enter item name"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Price (₹)*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    value={newBreakfast.price}
                    onChange={(e) =>
                      setNewBreakfast({
                        ...newBreakfast,
                        price: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    required
                    className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>

              <div className="space-y-2">
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
                  placeholder="Enter description"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="text"
                  value={newBreakfast.imageUrl}
                  onChange={(e) =>
                    setNewBreakfast({
                      ...newBreakfast,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="Enter image URL"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                />
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-all"
                >
                  {formSubmitting ? "Saving..." : "Save Breakfast"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search breakfasts..."
                  className="p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                />
              </div>
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm text-gray-500"
              >
                Clear Search
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                >
                  <option value="All">All</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <ChevronDown size={16} />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low-High)</option>
                  <option value="price-desc">Price (High-Low)</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredBreakfasts.length === 0 ? (
            <p className="text-center text-gray-500">No breakfasts found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredBreakfasts.map((breakfast) => (
                <div
                  key={breakfast._id}
                  className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
                >
                  <div className="relative">
                    <img
                      src={
                        breakfast.imageUrl || "https://via.placeholder.com/150"
                      }
                      alt={breakfast.itemName}
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/150")
                      }
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() =>
                          handleToggleStatus(
                            breakfast._id,
                            !breakfast.available
                          )
                        }
                        className={`px-2 py-1 text-white rounded-lg ${
                          breakfast.available ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {breakfast.available ? "Available" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    {breakfast.itemName}
                  </h3>
                  <p className="text-gray-600">{breakfast.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-gray-800">
                      ₹{breakfast.price}
                    </span>
                    <button
                      onClick={() => handleEdit(breakfast)}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BreakfastManager;
