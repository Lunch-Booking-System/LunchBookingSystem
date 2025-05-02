"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  PlusCircle,
  ChevronDown,
  DollarSign,
  Image as ImageIcon,
  Pencil,
  Search,
  X,
  Check,
  Filter,
  Drumstick,
} from "lucide-react";
import VendorNavbar from "@/components/VendorNavbar";

const LunchManager = () => {
  const { vendorId } = useParams();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [sortOption, setSortOption] = useState("name-asc");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [newItem, setNewItem] = useState({
    itemName: "",
    type: "Veg",
    description: "",
    imageUrl: "",
    price: "",
  });

  useEffect(() => {
    if (vendorId) fetchItems();
  }, [vendorId]);

  useEffect(() => {
    applyFilters();
  }, [items, searchTerm, filterType, sortOption]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lunchdinner?vendorId=${vendorId}`);
      const data = await res.json();
      setItems(data.data || []);
    } catch (error) {
      toast.error("Failed to load lunch items");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...items];

    if (searchTerm.trim()) {
      results = results.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "All") {
      results = results.filter((item) => item.type === filterType);
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
    }

    setFilteredItems(results);
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/lunchdinner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, available: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Failed to update status");
        return;
      }

      setItems((prev) =>
        prev.map((item) => (item._id === id ? data.lunch : item))
      );

      toast.success(
        `Item ${data.lunch.available ? "available" : "unavailable"} now`
      );
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    if (!newItem.itemName || !newItem.price) {
      toast.error("Name and price required");
      setFormSubmitting(false);
      return;
    }

    const itemData = {
      ...newItem,
      vendor: vendorId,
      price: Number(newItem.price),
    };

    try {
      const url = editingItem ? "/api/updateLunch" : "/api/lunch";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      if (res.ok) {
        toast.success(editingItem ? "Item updated" : "Item added");
        setNewItem({
          itemName: "",
          type: "Veg",
          description: "",
          imageUrl: "",
          price: "",
        });
        setEditingItem(null);
        setShowForm(false);
        fetchItems();
      } else {
        toast.error("Failed to save item");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem({
      _id: item._id,
      itemName: item.itemName,
      type: item.type,
      description: item.description,
      imageUrl: item.imageUrl,
      price: item.price,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setNewItem({
      itemName: "",
      type: "Veg",
      description: "",
      imageUrl: "",
      price: "",
    });
    setEditingItem(null);
    setShowForm(false);
  };

  return (
    <>
      <VendorNavbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6 pt-20 md:pt-24">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center text-gray-800">
                <Drumstick className="mr-2 text-orange-600" />
                Manage Lunch Items
              </h1>
              <p className="text-gray-600">Add and manage lunch meals</p>
            </div>
            <button
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
            >
              {showForm ? <X size={18} /> : <PlusCircle size={18} />}
              {showForm ? "Cancel Form" : "Add Lunch"}
            </button>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-md border mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {editingItem ? (
                <>
                  <Pencil size={18} className="mr-2 text-orange-600" />
                  Edit Lunch
                </>
              ) : (
                <>
                  <PlusCircle size={18} className="mr-2 text-green-600" />
                  Add New Lunch
                </>
              )}
            </h2>
            <form
              onSubmit={handleAddOrUpdate}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <input type="hidden" value={newItem._id || ""} />
              <div>
                <label className="text-sm font-medium">Item Name*</label>
                <input
                  type="text"
                  value={newItem.itemName}
                  onChange={(e) =>
                    setNewItem({ ...newItem, itemName: e.target.value })
                  }
                  required
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price (₹)*</label>
                <div className="relative">
                  <DollarSign
                    className="absolute top-3 left-3 text-gray-400"
                    size={16}
                  />
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                    required
                    className="w-full p-3 pl-10 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) =>
                    setNewItem({ ...newItem, type: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <input
                  type="text"
                  value={newItem.imageUrl}
                  onChange={(e) =>
                    setNewItem({ ...newItem, imageUrl: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="flex gap-4 mt-4 md:col-span-2 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg"
                >
                  {formSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Items List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Search size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="p-2 border rounded-md"
              />
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm text-gray-500"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-4 items-center">
              <Filter size={16} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="All">All</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
              </select>
              <ChevronDown size={16} />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low-High)</option>
                <option value="price-desc">Price (High-Low)</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <p className="text-center">Loading...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-gray-500">No items found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-4 rounded-lg shadow-md border"
                >
                  <img
                    src={item.imageUrl || "https://via.placeholder.com/150"}
                    alt={item.itemName}
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <h3 className="text-lg font-semibold mt-2">
                    {item.itemName}
                  </h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">₹{item.price}</span>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      Edit
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleStatus(item._id, !item.available)
                    }
                    className={`mt-3 px-2 py-1 rounded ${
                      item.available
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.available ? "Available" : "Unavailable"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LunchManager;
