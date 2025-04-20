"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

const BreakfastManager = () => {
  const { vendorId } = useParams();
  const [breakfasts, setBreakfasts] = useState([]);
  const [newBreakfast, setNewBreakfast] = useState({
    itemName: "",
    type: "Veg",
    category: "Breakfast",
    description: "",
    imageUrl: "",
    price: "",
  });

  useEffect(() => {
    if (vendorId) {
      fetchBreakfasts();
    }
  }, [vendorId]);

  const fetchBreakfasts = async () => {
    const res = await fetch(`/api/breakfasts?vendorId=${vendorId}`);
    const data = await res.json();
    setBreakfasts(data.breakfasts || []);
  };

  const handleToggleStatus = async (id, isActive) => {
    const res = await fetch("/api/breakfasts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id, isActive: !isActive }),
    });

    if (res.ok) {
      toast.success(`Breakfast status ${isActive ? "disabled" : "enabled"}`);
      fetchBreakfasts();
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleAddBreakfast = async () => {
    const breakfastData = {
      ...newBreakfast,
      vendor: vendorId,
      price: Number(newBreakfast.price),
    };

    const res = await fetch("/api/getBreakfastItems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(breakfastData),
    });

    if (res.ok) {
      toast.success("Breakfast added!");
      setNewBreakfast({
        itemName: "",
        type: "Veg",
        category: "Breakfast",
        description: "",
        imageUrl: "",
        price: "",
      });
      fetchBreakfasts();
    } else {
      toast.error("Error adding breakfast");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Manage Breakfast Items
      </h1>

      {/* Add New Breakfast Form */}
      <div className="bg-gray-100 p-4 rounded-lg mb-8 shadow">
        <h2 className="text-lg font-semibold mb-2">Add Breakfast</h2>
        <input
          type="text"
          placeholder="Item Name"
          value={newBreakfast.itemName}
          onChange={(e) =>
            setNewBreakfast({ ...newBreakfast, itemName: e.target.value })
          }
          className="w-full p-2 border mb-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={newBreakfast.description}
          onChange={(e) =>
            setNewBreakfast({ ...newBreakfast, description: e.target.value })
          }
          className="w-full p-2 border mb-2"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newBreakfast.imageUrl}
          onChange={(e) =>
            setNewBreakfast({ ...newBreakfast, imageUrl: e.target.value })
          }
          className="w-full p-2 border mb-2"
        />
        <select
          value={newBreakfast.type}
          onChange={(e) =>
            setNewBreakfast({ ...newBreakfast, type: e.target.value })
          }
          className="w-full p-2 border mb-2"
        >
          <option value="Veg">Veg</option>
          <option value="Non-Veg">Non-Veg</option>
        </select>
        <input
          type="number"
          placeholder="Price"
          value={newBreakfast.price}
          onChange={(e) =>
            setNewBreakfast({ ...newBreakfast, price: e.target.value })
          }
          className="w-full p-2 border mb-2"
        />
        <button
          onClick={handleAddBreakfast}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Breakfast
        </button>
      </div>

      {/* Breakfast List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {breakfasts.map((item) => (
          <div key={item._id} className="border p-4 rounded shadow bg-white">
            <img
              src={item.imageUrl}
              alt={item.itemName}
              className="w-full h-40 object-cover mb-2 rounded"
            />
            <h3 className="text-lg font-bold">{item.itemName}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
            <p className="text-sm">Type: {item.type}</p>
            <p className="text-sm">Category: {item.category}</p>
            <p className="text-sm">Price: ₹{item.price}</p>
            <p className="text-sm">
              Status: {item.isActive ? "Unavailable ❌" : "Available ✅"}
            </p>
            <button
              onClick={() => handleToggleStatus(item._id, item.isActive)}
              className="mt-2 px-4 py-1 text-sm rounded bg-black text-white"
            >
              {item.isActive ? "Mark as Available" : "Mark as Unavailable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BreakfastManager;
