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
} from "lucide-react";

const LunchManager = () => {
  const { vendorId } = useParams();
  const [lunchItems, setLunchItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]); // New state for general menu items
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    itemName: "",
    type: "Veg",
    description: "",
    imageUrl: "",
    price: "",
  });

  useEffect(() => {
    if (vendorId) {
      fetchLunchItems();
    }
    fetchMenuItems(); // Fetch general menu items
  }, [vendorId]);

  const fetchLunchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lunchdinner?vendorId=${vendorId}`);
      const data = await res.json();
      setLunchItems(data.lunch || []);
    } catch (error) {
      toast.error("Failed to load lunch items");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/getMenuItems");
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      const items = Array.isArray(data) ? data : data.menuItems;
      setMenuItems(items);
    } catch (err) {
      toast.error("Failed to load menu items");
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      const res = await fetch("/api/lunch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, isActive: !isActive }),
      });

      if (res.ok) {
        toast.success(`Item ${isActive ? "disabled" : "enabled"} successfully`);
        fetchLunchItems();
      } else {
        toast.error("Failed to update item status");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!newItem.itemName || !newItem.price) {
      toast.error("Item name and price are required");
      return;
    }

    try {
      const itemData = {
        ...newItem,
        vendor: vendorId,
        price: Number(newItem.price),
      };

      const res = await fetch("/api/lunch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      if (res.ok) {
        toast.success("Item added successfully!");
        setNewItem({
          itemName: "",
          type: "Veg",
          description: "",
          imageUrl: "",
          price: "",
        });
        setShowForm(false);
        fetchLunchItems();
      } else {
        toast.error("Error adding item");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Lunch Menu</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle size={18} />
          {showForm ? "Cancel" : "Add New Item"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg mb-8 shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
            Add New Item
          </h2>
          <form
            onSubmit={handleAddItem}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Item Name*
              </label>
              <input
                type="text"
                placeholder="Enter item name"
                value={newItem.itemName}
                onChange={(e) =>
                  setNewItem({ ...newItem, itemName: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price (₹)*
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                value={newItem.type}
                onChange={(e) =>
                  setNewItem({ ...newItem, type: e.target.value })
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
                  placeholder="https://example.com/image.jpg"
                  value={newItem.imageUrl}
                  onChange={(e) =>
                    setNewItem({ ...newItem, imageUrl: e.target.value })
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
                placeholder="Brief description of the item"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-2"
              >
                <PlusCircle size={18} />
                Add Item
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

      {!isLoading && lunchItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <AlertCircle size={48} className="text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700">
            No lunch items available
          </h3>
          <p className="text-gray-500 mb-4">
            Add your first lunch item to get started
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Add New Item
            </button>
          )}
        </div>
      )}

      {!isLoading && lunchItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lunchItems.map((item) => (
            <div
              key={item._id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white"
            >
              <div className="relative h-48">
                <img
                  src={item.imageUrl || "/api/placeholder/400/320"}
                  alt={item.itemName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/400/320";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      item.type === "Veg"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-lg font-bold text-white">
                    {item.itemName}
                  </h3>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{item.price}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      item.isActive ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {item.isActive ? (
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
                  {item.description || "No description available"}
                </p>

                <button
                  onClick={() => handleToggleStatus(item._id, item.isActive)}
                  className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                    item.isActive
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  {item.isActive ? " Available" : " Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LunchManager;
