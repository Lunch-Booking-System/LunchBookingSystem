"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import MenuCard from "@/components/MenuCard";
import { useParams, useRouter } from "next/navigation";
import LoadingGif from "../../../../../assets/LoadingComponentImage.gif";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Loader,
  CheckCircle,
  Search,
  Coffee,
} from "lucide-react";

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
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayNames[dayIndex];
};

const SnacksMenu = () => {
  const { customerId, vendorId } = useParams();
  const [snackItems, setSnackItems] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clearMessage, setClearMessage] = useState("");
  const router = useRouter();

  // Redirect if customerId doesn't match
  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("customer"));
    if (!customer || customer.customerId !== customerId) {
      toast.dismiss();
      toast.error("Unauthorized access. Redirecting to login page...");
      router.push(`/vendorDashboard/${customerId}`);
    }
  }, [customerId, router]);

  // Fetch menu on mount
  useEffect(() => {
    fetchSnacksMenu();
  }, []);

  const fetchSnacksMenu = async () => {
    try {
      const response = await fetch("/api/getSnackItems");
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();

      const availableItems = data.filter((item) => item.available === true);
      setSnackItems(availableItems);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load snacks menu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!vendorId) return;

    fetchSnacksMenu();

    const interval = setInterval(() => {
      fetchSnacksMenu();
    }, 3000);

    return () => clearInterval(interval);
  }, [vendorId]);

  const onOrder = (item, quantity) => {
    setOrderItems((prev) => {
      const exist = prev.find((o) => o._id === item._id);
      if (exist) {
        return prev.map((o) =>
          o._id === item._id ? { ...o, quantity: o.quantity + quantity } : o
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const onRemove = (item) => {
    setOrderItems((prev) =>
      prev
        .map((o) =>
          o._id === item._id ? { ...o, quantity: o.quantity - 1 } : o
        )
        .filter((o) => o.quantity > 0)
    );
    toast.dismiss();
    toast.error(`Removed ${item.itemName}`);
  };

  const displayedItems = useMemo(() => {
    return snackItems.filter((item) => {
      if (filterType === "Veg" && item.type !== "Veg") return false;
      if (filterType === "Non-Veg" && item.type !== "Non-Veg") return false;
      if (
        searchTerm &&
        !item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [snackItems, filterType, searchTerm]);

  const calculateTotalPrice = () =>
    orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const submitOrder = async () => {
    if (!orderItems.length) {
      toast.error("Your cart is empty");
      return;
    }
    setOrderLoading(true);
    const totalAmount = calculateTotalPrice();
    const d = new Date();
    const orderData = {
      customer: customerId,
      vendor: snackItems[0]?.vendor,
      items: orderItems.map((i) => ({
        itemId: i._id,
        category: i.category,
        quantity: i.quantity,
        price: i.price,
        itemType: "Snack",
      })),
      totalAmount,
      orderDate: {
        date: d.getDate(),
        dayName: getDayName(d.getDay()),
        month: getMonthName(d.getMonth()),
        year: d.getFullYear(),
        time: d.toLocaleTimeString(),
      },
    };

    try {
      const res = await fetch("/api/addOrders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      setOrderItems([]);
      toast.success("Order placed successfully!");
      router.push(`/myOrders/${customerId}`);
    } catch (err) {
      toast.dismiss();
      toast.error(err.message);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleClearOrder = () => {
    setOrderItems([]);
    toast.dismiss();
    toast.success("Cart cleared!");
    setClearMessage("Cart cleared!");
    setTimeout(() => {
      setClearMessage("");
      setIsCartOpen(false);
    }, 2000);
  };

  const decreaseQuantity = (item) => {
    onRemove(item);
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Image src={LoadingGif} alt="loader" className="w-64 h-64" />
        <p className="mt-4 text-lg text-gray-600">Loading menu...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-semibold mb-2">
            Something went wrong
          </p>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchSnacksMenu}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center mb-2">
            <span className="bg-orange-600 w-2 h-8 rounded mr-3 inline-block"></span>
            Snacks Menu
          </h1>
          <p className="text-gray-600 ml-5">
            Showing {snackItems.length} items
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for snacks..."
                className="pl-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {["All", "Veg", "Non-Veg"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-full border ${
                    filterType === type
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  {type === "Veg" && (
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  )}
                  {type === "Non-Veg" && (
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  )}
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedItems.length > 0 ? (
            displayedItems.map((item) => (
              <MenuCard
                key={item._id}
                item={item}
                onOrder={onOrder}
                onRemove={onRemove}
                isAdded={orderItems.some((o) => o._id === item._id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-md">
              <p className="text-xl text-gray-500">No items found</p>
              <p className="text-gray-400 mt-2">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>

        {/* Cart & Checkout Bar */}
        {orderItems.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-white shadow-t">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  Items: {orderItems.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center text-blue-600"
                >
                  <ShoppingCart size={18} className="mr-1" /> View Cart
                </button>
              </div>
              <button
                onClick={submitOrder}
                disabled={orderLoading}
                className={`px-6 py-2 rounded-lg text-white ${
                  orderLoading
                    ? "bg-green-400"
                    : "bg-green-600 hover:bg-green-700"
                } flex items-center`}
              >
                {orderLoading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Order
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Cart Dialog */}
        <Dialog open={isCartOpen} onClose={() => setIsCartOpen(false)}>
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <ShoppingCart size={20} className="text-orange-500 mr-2" />
                  Your Cart
                </h2>
                <button onClick={() => setIsCartOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {clearMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle size={18} className="mr-2" />
                    {clearMessage}
                  </div>
                </div>
              )}

              {orderItems.length ? (
                orderItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.itemName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium">{item.itemName}</h3>
                        <p className="text-gray-500 text-sm">{item.category}</p>
                        <p className="text-orange-600 font-semibold">
                          ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => decreaseQuantity(item)}>
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold">
                        {item.quantity}
                      </span>
                      <button onClick={() => onOrder(item, 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between mb-4">
                  <p className="font-bold">Total Amount</p>
                  <p className="text-xl font-bold text-orange-600">
                    ₹{calculateTotalPrice()}
                  </p>
                </div>
                <div className="flex gap-3">
                  {orderItems.length > 0 && (
                    <button
                      onClick={handleClearOrder}
                      className="px-4 py-2 border rounded-lg text-red-600"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      orderItems.length && submitOrder();
                    }}
                    disabled={orderLoading || !orderItems.length}
                    className={`flex-1 py-3 rounded-lg text-white flex items-center justify-center ${
                      orderLoading || !orderItems.length
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {orderLoading ? (
                      <Loader size={16} className="animate-spin mr-2" />
                    ) : (
                      "Checkout"
                    )}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default SnacksMenu;
