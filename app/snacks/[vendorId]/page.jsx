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
  Leaf,
  Drumstick,
} from "lucide-react";
import VendorNavbar from "@/components/VendorNavbar";

const SnackManager = () => {
  const { vendorId } = useParams();
  const [snacks, setSnacks] = useState([]);
  const [filteredSnacks, setFilteredSnacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSnack, setEditingSnack] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [sortOption, setSortOption] = useState("name-asc");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [newSnack, setNewSnack] = useState({
    itemName: "",
    type: "Veg",
    description: "",
    imageUrl: "",
    price: "",
  });

  useEffect(() => {
    if (vendorId) fetchSnacks();
  }, [vendorId]);

  useEffect(() => {
    applyFilters();
  }, [snacks, searchTerm, filterType, sortOption]);

  const fetchSnacks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/snacks?vendorId=${vendorId}`);
      const data = await res.json();
      setSnacks(data.snacks || []);
    } catch (error) {
      toast.error("Failed to load snacks");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...snacks];

    // Apply search filter
    if (searchTerm.trim()) {
      results = results.filter(
        (snack) =>
          snack.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          snack.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "All") {
      results = results.filter((snack) => snack.type === filterType);
    }

    // Apply sorting
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

    setFilteredSnacks(results);
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/snacks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, isActive: newStatus }),
      });

      if (!res.ok) {
        toast.error("Failed to update snack status");
        return;
      }

      setSnacks((prev) =>
        prev.map((snack) =>
          snack._id === id ? { ...snack, isActive: newStatus } : snack
        )
      );

      toast.success(`Snack ${newStatus ? "available" : "unavailable"} now`);
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleAddOrUpdateSnack = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    if (!newSnack.itemName || !newSnack.price) {
      toast.error("Item name and price are required");
      setFormSubmitting(false);
      return;
    }

    const snackData = {
      ...newSnack,
      vendor: vendorId,
      price: Number(newSnack.price),
    };

    try {
      const url = editingSnack ? "/api/updateSnacks" : "/api/snacks";
      const method = editingSnack ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snackData),
      });

      if (res.ok) {
        toast.success(
          editingSnack
            ? "Snack updated successfully"
            : "Snack added successfully"
        );

        setNewSnack({
          itemName: "",
          type: "Veg",
          description: "",
          imageUrl: "",
          price: "",
        });
        setEditingSnack(null);
        setShowForm(false);
        fetchSnacks();
      } else {
        toast.error("Failed to save snack");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (snack) => {
    setEditingSnack(snack);
    setNewSnack({
      _id: snack._id,
      itemName: snack.itemName,
      type: snack.type,
      description: snack.description,
      imageUrl: snack.imageUrl,
      price: snack.price,
    });
    setShowForm(true);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setNewSnack({
      itemName: "",
      type: "Veg",
      description: "",
      imageUrl: "",
      price: "",
    });
    setEditingSnack(null);
    setShowForm(false);
  };

  return (
    <>
      <VendorNavbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6 pt-20 md:pt-24">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <Coffee className="mr-2 text-blue-600" size={24} />
                Manage All-Day Snacks
              </h1>
              <p className="text-gray-600 mt-1">
                Add and manage snacks for your customers
              </p>
            </div>
            <button
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              {showForm ? <X size={18} /> : <PlusCircle size={18} />}
              {showForm ? "Cancel Form" : "Add New Snack"}
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl mb-8 shadow-md border border-gray-200 transition-all">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              {editingSnack ? (
                <>
                  <Pencil size={18} className="mr-2 text-blue-600" />
                  Edit Snack
                </>
              ) : (
                <>
                  <PlusCircle size={18} className="mr-2 text-green-600" />
                  Add New Snack
                </>
              )}
            </h2>
            <form
              onSubmit={handleAddOrUpdateSnack}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <input type="hidden" value={newSnack._id || ""} />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Item Name*
                </label>
                <input
                  type="text"
                  value={newSnack.itemName}
                  onChange={(e) =>
                    setNewSnack({ ...newSnack, itemName: e.target.value })
                  }
                  required
                  placeholder="Enter item name"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                    value={newSnack.price}
                    onChange={(e) =>
                      setNewSnack({ ...newSnack, price: e.target.value })
                    }
                    placeholder="0.00"
                    required
                    className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Snack Type
                </label>
                <select
                  value={newSnack.type}
                  onChange={(e) =>
                    setNewSnack({ ...newSnack, type: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  value={newSnack.description}
                  onChange={(e) =>
                    setNewSnack({ ...newSnack, description: e.target.value })
                  }
                  placeholder="Enter description"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="text"
                  value={newSnack.imageUrl}
                  onChange={(e) =>
                    setNewSnack({ ...newSnack, imageUrl: e.target.value })
                  }
                  placeholder="Enter image URL"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all"
                >
                  {formSubmitting ? "Saving..." : "Save Snack"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Snacks list */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search snacks..."
                  className="p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm text-gray-500"
              >
                Clear Search
              </button>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                  className="p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredSnacks.length === 0 ? (
            <p className="text-center text-gray-500">No snacks found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnacks.map((snack) => (
                <div
                  key={snack._id}
                  className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
                >
                  <div className="relative">
                    <img
                      src={snack.imageUrl || "https://via.placeholder.com/150"}
                      alt={snack.itemName}
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/150")
                      }
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() =>
                          handleToggleStatus(snack._id, !snack.isActive)
                        }
                        className={`px-2 py-1 text-white rounded-lg ${
                          snack.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {snack.isActive ? "Available" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    {snack.itemName}
                  </h3>
                  <p className="text-gray-600">{snack.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-gray-800">
                      ₹{snack.price}
                    </span>
                    <button
                      onClick={() => handleEdit(snack)}
                      className="text-blue-600 hover:text-blue-800"
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

export default SnackManager;
