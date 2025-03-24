"use client";

import { useEffect, useState } from "react";
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
  const { customerId } = useParams();
  const [snackItems, setSnackItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [clearMessage, setClearMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("customer"));
    const localCustomerId = customer?.customerId;

    if (!customer || !localCustomerId || localCustomerId !== customerId) {
      toast.dismiss();
      toast.error("Unauthorized access. Redirecting to login page...");
      router.push(`/vendorDashboard/${customerId}`);
    }
  }, [customerId, router]);

  useEffect(() => {
    fetchSnacksMenu();
  }, []);

  // Update filteredItems whenever snackItems, searchTerm, or filter changes
  useEffect(() => {
    filterAndSearchItems();
  }, [searchTerm, filter, snackItems]);

  const fetchSnacksMenu = async () => {
    try {
      const response = await fetch("/api/getSnackItems");
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setSnackItems(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load snacks menu!");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchItems = () => {
    let items = snackItems;

    if (filter !== "All") {
      items = items.filter((item) => {
        const normalizedItemCategory = item.category
          .replace(/[-\s]/g, "")
          .toLowerCase();
        const normalizedFilter = filter.replace(/[-\s]/g, "").toLowerCase();
        return normalizedItemCategory === normalizedFilter;
      });
    }

    if (searchTerm) {
      items = items.filter((item) =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(items);
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
  };

  const onRemove = (item) => {
    setOrderItems((prev) => {
      return prev
        .map((order) =>
          order.itemId === item._id
            ? { ...order, quantity: order.quantity - 1 }
            : order
        )
        .filter((order) => order.quantity > 0);
    });

    toast.dismiss();
    toast.error(`Removed ${item.itemName}`);
  };

  const submitOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setOrderLoading(true);
    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const d = new Date();
    const dayName = getDayName(d.getDay());
    const month = getMonthName(d.getMonth());
    const vendorId = snackItems[0]?.vendor;
    const orderData = {
      customer: customerId,
      vendor: vendorId,
      items: orderItems.map((item) => ({
        itemId: item._id,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        itemType: "Snack",
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
    } finally {
      setOrderLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
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

  const handleOrder = () => {
    submitOrder();
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

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Image
          src={LoadingGif}
          alt="loader"
          className="w-64 h-64 object-contain"
        />
        <p className="mt-4 text-lg font-medium text-gray-600">
          Loading menu...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg shadow-md">
          <p className="text-xl text-red-600 font-semibold mb-2">
            Something went wrong
          </p>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchSnacksMenu}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center mb-4 md:mb-0 self-start">
            <span className="bg-orange-600 w-2 h-8 rounded mr-3 inline-block"></span>
            Snacks
          </h1>
        </div>

        {/* Item count (using filteredItems) */}
        <p className="text-gray-600 mb-6 ml-2">
          Showing {filteredItems.length} items
        </p>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search snacks..."
            className="border p-2 rounded w-full md:w-1/3 mb-2 md:mb-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border p-2 rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="veg">Veg</option>
            <option value="nonveg">Non-Veg</option>
          </select>
        </div>

        {/* Menu Grid using filteredItems */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuCard
                key={item._id}
                item={item}
                onOrder={onOrder}
                onRemove={onRemove}
                isAdded={orderItems.some(
                  (orderItem) => orderItem._id === item._id
                )}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-gray-500">No items found</p>
            </div>
          )}
        </div>

        {/* Empty state when no items at all */}
        {snackItems.length === 0 && !loading && !error && (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-500 mb-4">
              No snack items available
            </p>
            <p className="text-gray-500">
              Check back later for our delicious snack menu!
            </p>
          </div>
        )}

        {/* Order Details Bottom Bar */}
        {orderItems.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-white shadow-xl border-t border-gray-200 z-40">
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                  <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
                    <span className="text-gray-700 font-medium mr-2">
                      Items:
                    </span>
                    <span className="text-blue-600 font-bold text-lg">
                      {orderItems.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="flex items-center bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors sm:hidden"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    View Cart
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="hidden sm:flex items-center bg-blue-50 text-blue-600 border border-blue-200 px-4 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    <span className="mr-2">View Cart</span>
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {orderItems.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  </button>

                  <button
                    onClick={handleOrder}
                    disabled={orderLoading}
                    className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white ${
                      orderLoading
                        ? "bg-green-400"
                        : "bg-green-600 hover:bg-green-700"
                    } transition-colors shadow-md flex items-center justify-center`}
                  >
                    {orderLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>Confirm Order</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Dialog */}
        <Dialog
          open={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
            <Dialog.Panel className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center border-b pb-4">
                <Dialog.Title className="text-xl font-bold text-gray-800 flex items-center">
                  <ShoppingCart size={20} className="text-orange-500 mr-2" />
                  Your Cart
                </Dialog.Title>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-all"
                  aria-label="Close cart"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Success message with animation */}
              {clearMessage && (
                <div className="my-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center font-medium animate-fadeIn">
                  <div className="flex items-center justify-center">
                    <CheckCircle size={18} className="mr-2" />
                    {clearMessage}
                  </div>
                </div>
              )}

              {/* Cart items */}
              {orderItems.length ? (
                <div className="mt-4 space-y-3">
                  {orderItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
                          <img
                            src={item.imageUrl}
                            alt={item.itemName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.itemName}</h3>
                          <p className="text-gray-500 text-sm">
                            {item.category}
                          </p>
                          <p className="text-orange-600 font-semibold">
                            ₹{item.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decreaseQuantity(item)}
                          className="p-1.5 rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} className="text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onOrder(item, 1)}
                          className="p-1.5 rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  {!clearMessage && (
                    <>
                      <div className="bg-gray-100 p-6 rounded-full mb-4">
                        <ShoppingCart size={48} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium">
                        Your cart is empty
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Add items to get started
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Cart summary */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">
                      {orderItems.length > 0
                        ? `${orderItems.length} item${
                            orderItems.length > 1 ? "s" : ""
                          }`
                        : ""}
                    </p>
                    <p className="text-lg font-bold">Total Amount</p>
                  </div>
                  <p className="text-xl font-bold text-orange-600">
                    ₹{calculateTotalPrice()}
                  </p>
                </div>

                <div className="flex gap-3">
                  {orderItems.length > 0 && (
                    <button
                      onClick={handleClearOrder}
                      className="flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-red-600 border border-red-200 bg-white hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Clear
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      if (orderItems.length > 0) {
                        handleOrder();
                      }
                    }}
                    disabled={orderItems.length === 0 || orderLoading}
                    className={`flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center ${
                      orderItems.length === 0 || orderLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    } transition-colors`}
                  >
                    {orderLoading ? (
                      <>
                        <span className="animate-spin mr-2">
                          <Loader size={16} />
                        </span>
                        Processing...
                      </>
                    ) : (
                      <>
                        Checkout
                        <ArrowRight size={16} className="ml-2" />
                      </>
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
