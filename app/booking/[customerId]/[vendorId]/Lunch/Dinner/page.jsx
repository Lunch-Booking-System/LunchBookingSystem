"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import MenuCard from "@/components/MenuCard";
import { useParams, useRouter } from "next/navigation";
import LoadingGif from "../../../../../../assets/LoadingComponentImage.gif";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { ShoppingCart, X } from "lucide-react";

const MealMenu = ({ mealType }) => {
  const { customerId } = useParams();
  const router = useRouter();

  const [mealItems, setMealItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [foodFilter, setFoodFilter] = useState("all");

  const getMonthName = (monthIndex) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[monthIndex];
  };

  const getDayName = (dayIndex) => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thrusday",
      "Friday",
      "Saturday",
    ];
    return dayNames[dayIndex];
  };

  useEffect(() => {
    fetchMealMenu();
  }, [mealType]);

  const fetchMealMenu = async () => {
    try {
      const response = await fetch("/api/getMenuItems");
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      console.log("Fetched data:", data);
      // Use data.menuItems since your API returns { success: true, menuItems: [...] }
      const items = Array.isArray(data) ? data : data.menuItems;
      setMealItems(items);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load menu!");
    } finally {
      setLoading(false);
    }
  };

  const onOrder = (item, quantity) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find(
        (orderItem) => orderItem._id === item._id
      );
      if (existingItem) {
        return prevItems.map((orderItem) =>
          orderItem._id === item._id
            ? { ...orderItem, quantity: orderItem.quantity + quantity }
            : orderItem
        );
      } else {
        return [...prevItems, { ...item, quantity }];
      }
    });
    toast.success(`Added ${item.itemName} to cart!`);
  };

  const onRemove = (item) => {
    setOrderItems((prev) =>
      prev
        .map((order) =>
          order._id === item._id
            ? { ...order, quantity: order.quantity - 1 }
            : order
        )
        .filter((order) => order.quantity > 0)
    );
    toast.error(`Removed ${item.itemName}`);
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  };

  const decreaseQuantity = (item) => {
    setOrderItems((prev) =>
      prev
        .map((order) =>
          order._id === item._id
            ? { ...order, quantity: order.quantity - 1 }
            : order
        )
        .filter((order) => order.quantity > 0)
    );
  };

  const handleClearOrder = () => {
    setOrderItems([]);
    toast.success("Cart cleared!");
  };

  const submitOrder = async () => {
    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const d = new Date();
    const dayName = getDayName(d.getDay());
    const month = getMonthName(d.getMonth());
    // Assumes at least one mealItem exists to get vendor info.
    const vendorId = mealItems[0]?.vendor?._id || mealItems[0]?.vendor;
    const orderData = {
      customer: customerId,
      vendor: vendorId,
      items: orderItems.map((item) => ({
        itemId: item._id,
        // Use the item.category if available, otherwise fallback to item.type or default to "Menu"
        category: item.category || item.type || "Menu",
        quantity: item.quantity,
        price: item.price,
        itemType: "Menu",
      })),
      totalAmount,
      orderDate: {
        date: d.getDate(),
        dayName: dayName,
        month: month,
        year: d.getFullYear(),
        time: d.toLocaleTimeString(),
      },
    };

    try {
      const response = await fetch("/api/addOrders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit order: ${response.status}`);
      }

      setOrderItems([]);
      toast.success("Order placed successfully!");
      router.push(`/myOrders/${customerId}`);
    } catch (err) {
      toast.dismiss();
      toast.error(err.message);
    }
  };

  const handleOrder = () => {
    submitOrder();
  };

  // Ensure mealItems is an array before filtering
  const filteredItems = (Array.isArray(mealItems) ? mealItems : []).filter(
    (item) => {
      const matchesSearch = item.itemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        foodFilter === "all" ||
        item.type.toLowerCase() === foodFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    }
  );

  if (loading)
    return (
      <div className="min-h-screen text-center text-lg font-semibold">
        <Image
          src={LoadingGif}
          className="md:ml-[35%] mt-[55%] md:mt-[15%]"
          alt="loader"
        />
      </div>
    );

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-7 md:px-8">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center">
            <span className="bg-orange-600 w-2 h-8 rounded mr-3 inline-block"></span>
            {mealType} Menu
          </h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search meals..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select
              onChange={(e) => setFoodFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Food Items</option>
              <option value="veg">Vegetarian Only</option>
              <option value="non-veg">Non-Vegetarian Only</option>
            </select>
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MenuCard
              key={item._id}
              item={item}
              onOrder={onOrder}
              onRemove={onRemove}
              isAdded={orderItems.some((order) => order._id === item._id)}
            />
          ))}
        </div>
      </div>

      {/* Order Details Bar */}
      {orderItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 z-50 bg-opacity-95">
          <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center bg-blue-600 text-white px-3 md:px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700"
            >
              <ShoppingCart className="mr-2" /> View Cart ({orderItems.length})
            </button>
            <button
              onClick={handleOrder}
              className="px-5 py-2 rounded-lg font-semibold bg-green-500 border border-green-500 text-white hover:bg-white hover:text-green-500"
            >
              Confirm Order
            </button>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <Dialog
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
            <div className="flex justify-between items-center">
              <Dialog.Title className="text-lg font-bold mb-4 text-gray-800">
                Your Cart
              </Dialog.Title>
              <button onClick={() => setIsCartOpen(false)}>
                <X
                  size={24}
                  className="text-black rounded-lg font-bold border-2 border-red-500 hover:text-red-500"
                />
              </button>
            </div>
            {orderItems.length ? (
              <div className="mt-4 max-h-[300px] md:max-h-[500px] overflow-y-auto">
                {orderItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between border-b py-2"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        width={50}
                        height={50}
                        alt={item.itemName}
                        className="rounded-lg"
                      />
                      <span className="text-md font-medium">
                        {item.itemName}
                      </span>
                    </div>
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => decreaseQuantity(item)}
                        className="px-4 py-1 bg-white text-black rounded-lg border border-gray-300 font-bold"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onOrder(item, 1)}
                        className="px-4 py-1 bg-white text-black rounded-lg border border-gray-300 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center">No items in the cart.</p>
            )}
            <div className="mt-6 flex justify-between items-center">
              <p className="text-lg font-bold">
                Total: ₹{calculateTotalPrice()}
              </p>
              <div>
                {orderItems.length ? (
                  <button
                    onClick={handleClearOrder}
                    className="px-3 py-1 mr-5 text-white rounded-lg font-bold border border-red-500 bg-red-500 hover:bg-white hover:text-red-500"
                  >
                    Clear Cart
                  </button>
                ) : null}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default MealMenu;
