"use client";
import { useEffect, useState } from "react";
import VendorNavbar from "@/components/VendorNavbar";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
// import LoadingGif from "../../../assets/LoadingComponentImage.gif";

const Page = () => {
  const router = useRouter();
  const { vendorId } = useParams();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const session = localStorage.getItem("vendorSession");

    if (session) {
      const { sessionId } = JSON.parse(session);

      if (sessionId !== vendorId) {
        localStorage.removeItem("vendorSession");
        toast.error("Invalid Vendor-ID. Try logging in again.");
        router.push("/onboardingvendor/login");
        return;
      }
    } else {
      toast.error("Try logging in again.");
      router.push("/onboardingvendor/login");
      return;
    }

    if (vendorId) {
      getMenuItems();
    }
  }, [vendorId]);

  const getMenuItems = async () => {
    const res = await fetch("/api/getMenuItems");
    const data = await res.json();
    // Extract the menuItems array from the API response
    setMenuItems(data.menuItems);
  };

  const handleEdit = (updatedItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
    );
  };

  return (
    <>
      <VendorNavbar />
      <h1 className="flex justify-center text-3xl md:text-4xl my-10 font-bold">
        Customize Weekly Menu
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {menuItems.map((item) => (
          <MenuCard key={item._id} item={item} onEdit={handleEdit} />
        ))}
      </div>
    </>
  );
};

export default Page;

const MenuCard = ({ item, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedItem, setUpdatedItem] = useState(item);

  const handleChange = (e) => {
    if (e.target.name === "menuDate") {
      const newDate = new Date(e.target.value);
      setUpdatedItem({
        ...updatedItem,
        menuDate: {
          date: newDate.getDate(),
          dayName: newDate.toLocaleDateString("en-US", { weekday: "long" }),
          month: newDate.toLocaleDateString("en-US", { month: "long" }),
          year: newDate.getFullYear(),
        },
      });
    } else {
      setUpdatedItem({ ...updatedItem, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/updateItem", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    });
    if (res.ok) {
      setIsEditing(false);
      onEdit(updatedItem);
      setLoading(false);
      toast.success("Updated menu successfully");
    } else {
      toast.error("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 shadow-lg rounded-md hover:shadow-xl bg-white">
      <h3 className="text-xl font-semibold bg-orange-500 p-3 text-white rounded-lg flex justify-center">
        {item.menuDate.dayName}
      </h3>
      <img
        src={item.imageUrl}
        alt={item.itemName}
        className="w-full h-40 object-cover rounded-md mt-2"
      />
      {isEditing ? (
        <input
          type="text"
          name="itemName"
          value={updatedItem.itemName}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-2"
        />
      ) : (
        <h2 className="text-lg font-bold mt-2">{item.itemName}</h2>
      )}
      {isEditing ? (
        <input
          type="text"
          name="type"
          value={updatedItem.type}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-2"
        />
      ) : item.type === "Veg" ? (
        <h2 className="text-md font-semibold mt-1 bg-green-200 border border-green-400 rounded-xl text-green-700 w-[50px] flex justify-center">
          {item.type}
        </h2>
      ) : (
        <h2 className="text-md font-semibold mt-1 bg-red-200 border border-red-400 rounded-xl text-red-700 w-[80px] flex justify-center">
          {item.type}
        </h2>
      )}
      {isEditing ? (
        <textarea
          name="description"
          value={updatedItem.description}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-2"
        />
      ) : (
        <p className="text-gray-600 mt-2">{item.description}</p>
      )}
      {isEditing ? (
        <input
          type="number"
          name="price"
          value={updatedItem.price}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-2"
        />
      ) : (
        <p className="text-sm text-gray-500 mt-2">Price: ₹{item.price}</p>
      )}
      {isEditing ? (
        <input
          type="date"
          name="menuDate"
          value={`${updatedItem.menuDate.year}-${String(
            new Date(
              updatedItem.menuDate.month + " 1, " + updatedItem.menuDate.year
            ).getMonth() + 1
          ).padStart(2, "0")}-${String(updatedItem.menuDate.date).padStart(
            2,
            "0"
          )}`}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-2"
        />
      ) : (
        <p className="text-sm text-gray-500 mt-2">
          Date: {item.menuDate.date} {item.menuDate.dayName}{" "}
          {item.menuDate.month} {item.menuDate.year}
        </p>
      )}
      {isEditing ? (
        <button
          onClick={handleSave}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="mt-2 px-4 py-2 bg-black text-white rounded"
        >
          <Pencil />
        </button>
      )}
    </div>
  );
};
